import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BannerAspectRatio, JobStatus, Prisma } from '@prisma/client';
import { ImageStorageService } from '../../common/storage/image-storage.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DEFAULT_BANNER_SLOTS } from './platform-ads.defaults';
import {
  CreateSponsoredAdDto,
  ReorderSponsoredAdsDto,
  UpdateBannerSlotDto,
} from './dto/platform-ads.dto';

const BANNER_SLIDES_PER_SLOT = 3;

const jobWithCompany = {
  company: true,
} satisfies Prisma.JobInclude;

@Injectable()
export class PlatformAdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorage: ImageStorageService,
  ) {}

  private mapJobForPublic<
    T extends {
      vacancyArtworkUrl?: string | null;
      company: { logoUrl?: string | null; lifeAtCompanyImages?: string[] };
    },
  >(job: T): T {
    return {
      ...job,
      vacancyArtworkUrl: this.imageStorage.resolvePublicUrl(job.vacancyArtworkUrl),
      company: this.imageStorage.withPublicUrls(job.company),
    };
  }

  private mapSlideImage(slide: { imageUrl: string | null }) {
    return {
      ...slide,
      imageUrl: this.imageStorage.resolvePublicUrl(slide.imageUrl),
    };
  }

  private async ensureDefaults() {
    const count = await this.prisma.platformBannerSlot.count();
    if (count > 0) return;

    for (const def of DEFAULT_BANNER_SLOTS) {
      const slot = await this.prisma.platformBannerSlot.create({
        data: {
          key: def.key,
          label: def.label,
          aspectRatio: def.aspectRatio,
          sortOrder: def.sortOrder,
        },
      });
      await this.prisma.platformBannerSlide.createMany({
        data: def.slides.map((slide, index) => ({
          slotId: slot.id,
          href: slide.href,
          imageUrl: slide.imageUrl,
          alt: slide.alt,
          sortOrder: index,
        })),
      });
    }
  }

  private mapBannerSlotAdmin(
    slot: Prisma.PlatformBannerSlotGetPayload<{
      include: { slides: true };
    }>,
  ) {
    return {
      id: slot.id,
      key: slot.key,
      label: slot.label,
      aspectRatio: slot.aspectRatio,
      active: slot.active,
      sortOrder: slot.sortOrder,
      slides: slot.slides
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((slide) => this.mapSlideImage(slide)),
    };
  }

  async listPublicBanners(aspectRatio?: BannerAspectRatio) {
    await this.ensureDefaults();
    const slots = await this.prisma.platformBannerSlot.findMany({
      where: {
        active: true,
        ...(aspectRatio ? { aspectRatio } : {}),
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        slides: {
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return slots
      .map((slot) => ({
        key: slot.key,
        aspectRatio: slot.aspectRatio,
        slides: slot.slides
          .filter((slide) => slide.imageUrl)
          .map((slide) => ({
            href: slide.href,
            imageUrl: this.imageStorage.resolvePublicUrl(slide.imageUrl)!,
            alt: slide.alt,
          })),
      }))
      .filter((slot) => slot.slides.length > 0);
  }

  async getPublicBannerByKey(key: string) {
    await this.ensureDefaults();
    const slot = await this.prisma.platformBannerSlot.findUnique({
      where: { key },
      include: {
        slides: {
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!slot || !slot.active) {
      throw new NotFoundException('Banner slot not found');
    }
    const slides = slot.slides
      .filter((slide) => slide.imageUrl)
      .map((slide) => ({
        href: slide.href,
        imageUrl: this.imageStorage.resolvePublicUrl(slide.imageUrl)!,
        alt: slide.alt,
      }));
    if (slides.length === 0) {
      throw new NotFoundException('Banner slot has no active slides');
    }
    return {
      key: slot.key,
      aspectRatio: slot.aspectRatio,
      slides,
    };
  }

  async listBannerSlotsForAdmin(aspectRatio?: BannerAspectRatio) {
    await this.ensureDefaults();
    const slots = await this.prisma.platformBannerSlot.findMany({
      where: aspectRatio ? { aspectRatio } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: {
        slides: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return slots.map((slot) => this.mapBannerSlotAdmin(slot));
  }

  async getBannerSlotForAdmin(id: string) {
    await this.ensureDefaults();
    const slot = await this.prisma.platformBannerSlot.findUnique({
      where: { id },
      include: { slides: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!slot) throw new NotFoundException('Banner slot not found');
    return this.mapBannerSlotAdmin(slot);
  }

  async updateBannerSlot(id: string, dto: UpdateBannerSlotDto) {
    await this.ensureDefaults();
    const slot = await this.prisma.platformBannerSlot.findUnique({ where: { id } });
    if (!slot) throw new NotFoundException('Banner slot not found');

    if (dto.slides) {
      if (dto.slides.length !== BANNER_SLIDES_PER_SLOT) {
        throw new BadRequestException(
          `Each banner slot requires exactly ${BANNER_SLIDES_PER_SLOT} slides`,
        );
      }
      const imageUrls = await Promise.all(
        dto.slides.map((slide) =>
          this.imageStorage.savePlatformBannerImage(slide.imageUrl),
        ),
      );

      await this.prisma.$transaction(async (tx) => {
        await tx.platformBannerSlide.deleteMany({ where: { slotId: id } });
        await tx.platformBannerSlide.createMany({
          data: dto.slides!.map((slide, index) => ({
            slotId: id,
            href: slide.href.trim(),
            imageUrl: imageUrls[index],
            alt: slide.alt.trim(),
            sortOrder: index,
            active: slide.active ?? true,
          })),
        });
      });
    }

    await this.prisma.platformBannerSlot.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
    });

    return this.getBannerSlotForAdmin(id);
  }

  async listSponsoredForAdmin() {
    await this.ensureDefaults();
    const ads = await this.prisma.sponsoredAd.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { job: { include: jobWithCompany } },
    });
    return ads.map((ad) => ({
      id: ad.id,
      jobId: ad.jobId,
      sortOrder: ad.sortOrder,
      active: ad.active,
      job: this.mapJobForPublic(ad.job),
    }));
  }

  async listPublicSponsored(limit = 3) {
    await this.ensureDefaults();
    const take = Math.min(Math.max(limit, 1), 12);
    const ads = await this.prisma.sponsoredAd.findMany({
      where: {
        active: true,
        job: { status: JobStatus.PUBLISHED },
      },
      orderBy: { sortOrder: 'asc' },
      take,
      include: { job: { include: jobWithCompany } },
    });
    return ads.map((ad) => this.mapJobForPublic(ad.job));
  }

  async createSponsoredAd(dto: CreateSponsoredAdDto) {
    await this.ensureDefaults();
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.status !== JobStatus.PUBLISHED) {
      throw new BadRequestException('Only published jobs can be sponsored');
    }

    const existing = await this.prisma.sponsoredAd.findUnique({
      where: { jobId: dto.jobId },
    });
    if (existing) {
      throw new BadRequestException('This job is already in sponsored ads');
    }

    const maxOrder = await this.prisma.sponsoredAd.aggregate({
      _max: { sortOrder: true },
    });

    const ad = await this.prisma.sponsoredAd.create({
      data: {
        jobId: dto.jobId,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
      include: { job: { include: jobWithCompany } },
    });

    return {
      id: ad.id,
      jobId: ad.jobId,
      sortOrder: ad.sortOrder,
      active: ad.active,
      job: this.mapJobForPublic(ad.job),
    };
  }

  async reorderSponsoredAds(dto: ReorderSponsoredAdsDto) {
    await this.ensureDefaults();
    const ads = await this.prisma.sponsoredAd.findMany({
      select: { id: true, jobId: true },
    });
    const knownJobIds = new Set(ads.map((a) => a.jobId));
    for (const jobId of dto.jobIds) {
      if (!knownJobIds.has(jobId)) {
        throw new BadRequestException('Unknown sponsored job id in reorder list');
      }
    }
    if (dto.jobIds.length !== ads.length) {
      throw new BadRequestException('Reorder list must include every sponsored job');
    }

    await this.prisma.$transaction(
      dto.jobIds.map((jobId, index) =>
        this.prisma.sponsoredAd.update({
          where: { jobId },
          data: { sortOrder: index },
        }),
      ),
    );

    return this.listSponsoredForAdmin();
  }

  async patchSponsoredAd(id: string, active: boolean) {
    const ad = await this.prisma.sponsoredAd.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Sponsored ad not found');
    await this.prisma.sponsoredAd.update({
      where: { id },
      data: { active },
    });
    return this.listSponsoredForAdmin();
  }

  async deleteSponsoredAd(id: string) {
    const ad = await this.prisma.sponsoredAd.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Sponsored ad not found');
    await this.prisma.sponsoredAd.delete({ where: { id } });
    return this.listSponsoredForAdmin();
  }
}
