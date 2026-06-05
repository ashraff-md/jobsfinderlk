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
  CreateBannerCampaignDto,
  CreateSponsoredAdDto,
  PromotionPeriodDays,
  ReorderSponsoredAdsDto,
  UpdateBannerCampaignDto,
  UpdateBannerSlotDto,
  UpdateSponsoredAdDto,
} from './dto/platform-ads.dto';
import type { BannerSlideDto } from './dto/platform-ads.dto';
import {
  BANNER_SLIDE_ROTATION_MS,
  BANNER_SLIDE_ROTATION_SECONDS,
  BANNER_SLIDES_PER_SLOT,
  SPONSORED_BATCH_PERIOD_MS,
  SPONSORED_JOBS_BATCH_SIZE,
  SPONSORED_POOL_MAX,
} from './platform-ads.constants';

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

  private parseStartDate(value: string): Date {
    const start = new Date(value);
    if (Number.isNaN(start.getTime())) {
      throw new BadRequestException('Invalid start date');
    }
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private endsAtFromPromotion(start: Date, days: PromotionPeriodDays): Date {
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  private defaultBannerSchedule(): { startsAt: Date; endsAt: Date } {
    const startsAt = new Date();
    startsAt.setHours(0, 0, 0, 0);
    return {
      startsAt,
      endsAt: this.endsAtFromPromotion(startsAt, 7),
    };
  }

  /** Reads schedule columns directly (works when Prisma client is out of sync). */
  private async bannerSlotScheduleById() {
    const rows = await this.prisma.$queryRaw<
      Array<{ id: string; starts_at: Date; ends_at: Date }>
    >`SELECT id, starts_at, ends_at FROM platform_banner_slots`;
    return new Map(
      rows.map((row) => [
        row.id,
        { startsAt: row.starts_at, endsAt: row.ends_at },
      ]),
    );
  }

  private resolveBannerSchedule(
    slot: { id: string; startsAt?: Date | null; endsAt?: Date | null },
    schedules: Map<string, { startsAt: Date; endsAt: Date }>,
  ): { startsAt: Date; endsAt: Date } {
    if (slot.startsAt && slot.endsAt) {
      return { startsAt: slot.startsAt, endsAt: slot.endsAt };
    }
    return schedules.get(slot.id) ?? this.defaultBannerSchedule();
  }

  private isBannerSlotLive(
    schedule: { startsAt: Date; endsAt: Date },
    now = new Date(),
  ): boolean {
    return schedule.startsAt <= now && schedule.endsAt >= now;
  }

  private mapSponsoredAd<
    T extends {
      id: string;
      jobId: string;
      sortOrder: number;
      active: boolean;
      startsAt: Date;
      endsAt: Date;
      viewCount: number;
      job: Parameters<PlatformAdsService['mapJobForPublic']>[0];
    },
  >(ad: T) {
    return {
      id: ad.id,
      jobId: ad.jobId,
      sortOrder: ad.sortOrder,
      active: ad.active,
      viewCount: ad.viewCount,
      startsAt: ad.startsAt.toISOString(),
      endsAt: ad.endsAt.toISOString(),
      job: this.mapJobForPublic(ad.job),
    };
  }

  private mapSlideImage(slide: { imageUrl: string | null }) {
    return {
      ...slide,
      imageUrl: this.imageStorage.resolvePublicUrl(slide.imageUrl),
    };
  }

  private slotNeedsSlideRepair(
    slides: Array<{ imageUrl: string | null }>,
  ): boolean {
    const withImage = slides.filter((s) => s.imageUrl);
    if (withImage.length < BANNER_SLIDES_PER_SLOT) return true;
    return new Set(withImage.map((s) => s.imageUrl)).size < BANNER_SLIDES_PER_SLOT;
  }

  private async syncAllBannerSlotsFromDefaults() {
    const { startsAt, endsAt } = this.defaultBannerSchedule();
    for (const def of DEFAULT_BANNER_SLOTS) {
      let slot = await this.prisma.platformBannerSlot.findUnique({
        where: { key: def.key },
      });
      if (!slot) {
        slot = await this.prisma.platformBannerSlot.create({
          data: {
            key: def.key,
            label: def.label,
            aspectRatio: def.aspectRatio,
            sortOrder: def.sortOrder,
            startsAt,
            endsAt,
          },
        });
      }
      await this.replaceSlotSlides(slot.id, def.slides);
      await this.prisma.platformBannerSlot.update({
        where: { id: slot.id },
        data: { active: true, startsAt, endsAt },
      });
    }
  }

  private async repairBannerSlotsIfNeeded() {
    for (const def of DEFAULT_BANNER_SLOTS) {
      const slot = await this.prisma.platformBannerSlot.findUnique({
        where: { key: def.key },
        include: { slides: { orderBy: { sortOrder: 'asc' } } },
      });
      if (!slot) continue;
      if (this.slotNeedsSlideRepair(slot.slides)) {
        await this.replaceSlotSlides(slot.id, def.slides);
      }
    }
  }

  private async seedDefaultCampaignsIfEmpty() {
    const count = await this.prisma.platformBannerCampaign.count();
    if (count > 0) return;

    const { startsAt, endsAt } = this.defaultBannerSchedule();
    let sortOrder = 0;
    for (const def of DEFAULT_BANNER_SLOTS) {
      for (const slide of def.slides) {
        await this.prisma.platformBannerCampaign.create({
          data: {
            label: slide.alt,
            aspectRatio: def.aspectRatio,
            href: slide.href,
            imageUrl: slide.imageUrl,
            alt: slide.alt,
            startsAt,
            endsAt,
            sortOrder: sortOrder++,
          },
        });
      }
    }
  }

  private async ensureDefaults() {
    const count = await this.prisma.platformBannerSlot.count();
    if (count === 0) {
      await this.syncAllBannerSlotsFromDefaults();
    } else {
      await this.repairBannerSlotsIfNeeded();
    }
    await this.seedDefaultCampaignsIfEmpty();
  }

  /** Admin: reset placement fallbacks and default campaign pool. */
  async syncAllBannerSlots() {
    await this.syncAllBannerSlotsFromDefaults();
    await this.prisma.platformBannerCampaign.deleteMany();
    await this.seedDefaultCampaignsIfEmpty();
    return this.listBannerCampaignsForAdmin();
  }

  private mapBannerCampaignAdmin(campaign: {
    id: string;
    label: string;
    aspectRatio: BannerAspectRatio;
    href: string;
    imageUrl: string | null;
    alt: string;
    active: boolean;
    startsAt: Date;
    endsAt: Date;
    sortOrder: number;
    viewCount: number;
  }) {
    return {
      id: campaign.id,
      label: campaign.label,
      aspectRatio: campaign.aspectRatio,
      href: campaign.href,
      imageUrl: this.imageStorage.resolvePublicUrl(campaign.imageUrl),
      alt: campaign.alt,
      active: campaign.active,
      startsAt: campaign.startsAt.toISOString(),
      endsAt: campaign.endsAt.toISOString(),
      sortOrder: campaign.sortOrder,
      viewCount: campaign.viewCount,
    };
  }

  private rotationBaseOffset(poolSize: number): number {
    if (poolSize <= 0) return 0;
    return Math.floor(Date.now() / SPONSORED_BATCH_PERIOD_MS) % poolSize;
  }

  /** Assign carousel batches so the same campaign is not visible on two slots at once. */
  private assignDisjointCarouselBatches<
    T extends { id: string },
  >(campaigns: T[], slotCount: number): T[][] {
    const batchSize = BANNER_SLIDES_PER_SLOT;
    if (campaigns.length === 0 || slotCount === 0) return [];
    const baseOffset = this.rotationBaseOffset(campaigns.length);
    const batches: T[][] = Array.from({ length: slotCount }, () => []);

    for (let frame = 0; frame < batchSize; frame++) {
      const usedThisFrame = new Set<string>();
      for (let slotIndex = 0; slotIndex < slotCount; slotIndex++) {
        let picked: T | undefined;
        for (let attempt = 0; attempt < campaigns.length; attempt++) {
          const idx =
            (baseOffset + slotIndex + frame * slotCount + attempt) %
            campaigns.length;
          const candidate = campaigns[idx];
          if (!usedThisFrame.has(candidate.id)) {
            picked = candidate;
            break;
          }
        }
        if (!picked) {
          picked = campaigns[(baseOffset + slotIndex + frame) % campaigns.length];
        }
        usedThisFrame.add(picked.id);
        batches[slotIndex].push(picked);
      }
    }

    return batches;
  }

  private buildPublicSlotSlides<
    T extends {
      id: string;
      href: string;
      imageUrl: string | null;
      alt: string;
      label: string;
    },
  >(batch: T[]) {
    if (batch.length === 0) return [];
    return batch.map((c) => this.campaignToPublicSlide(c));
  }

  private buildPublicSlotsForAspect(
    placementSlots: Array<{ key: string; aspectRatio: BannerAspectRatio }>,
    campaigns: Array<{
      id: string;
      href: string;
      imageUrl: string | null;
      alt: string;
      label: string;
    }>,
  ) {
    const batches = this.assignDisjointCarouselBatches(
      campaigns,
      placementSlots.length,
    );
    return placementSlots
      .map((slot, slotIndex) => ({
        key: slot.key,
        aspectRatio: slot.aspectRatio,
        slides: this.buildPublicSlotSlides(batches[slotIndex] ?? []),
      }))
      .filter((slot) => slot.slides.length > 0);
  }

  private campaignToPublicSlide(campaign: {
    href: string;
    imageUrl: string | null;
    alt: string;
    label: string;
  }) {
    return {
      href: campaign.href,
      imageUrl: this.imageStorage.resolvePublicUrl(campaign.imageUrl)!,
      alt: campaign.alt || campaign.label,
    };
  }

  private async listActiveBannerCampaigns(
    aspectRatio: BannerAspectRatio,
    now = new Date(),
  ) {
    return this.prisma.platformBannerCampaign.findMany({
      where: {
        aspectRatio,
        active: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
        imageUrl: { not: null },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  private mapBannerSlotAdmin(
    slot: Prisma.PlatformBannerSlotGetPayload<{
      include: { slides: true };
    }>,
    schedules: Map<string, { startsAt: Date; endsAt: Date }>,
  ) {
    const { startsAt, endsAt } = this.resolveBannerSchedule(slot, schedules);
    return {
      id: slot.id,
      key: slot.key,
      label: slot.label,
      aspectRatio: slot.aspectRatio,
      active: slot.active,
      sortOrder: slot.sortOrder,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      slides: slot.slides
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((slide) => this.mapSlideImage(slide)),
    };
  }

  async listPublicBanners(aspectRatio?: BannerAspectRatio) {
    await this.ensureDefaults();
    const now = new Date();
    const slots = await this.prisma.platformBannerSlot.findMany({
      where: {
        active: true,
        ...(aspectRatio ? { aspectRatio } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    });

    const campaignsCache = new Map<
      BannerAspectRatio,
      Awaited<ReturnType<PlatformAdsService['listActiveBannerCampaigns']>>
    >();
    const slotsByAspect = new Map<BannerAspectRatio, typeof slots>();
    for (const slot of slots) {
      const group = slotsByAspect.get(slot.aspectRatio) ?? [];
      group.push(slot);
      slotsByAspect.set(slot.aspectRatio, group);
    }

    const publicSlots = [];
    for (const [ratio, group] of slotsByAspect) {
      let campaigns = campaignsCache.get(ratio);
      if (!campaigns) {
        campaigns = await this.listActiveBannerCampaigns(ratio, now);
        campaignsCache.set(ratio, campaigns);
      }
      publicSlots.push(
        ...this.buildPublicSlotsForAspect(
          group.map((s) => ({ key: s.key, aspectRatio: s.aspectRatio })),
          campaigns,
        ),
      );
    }

    publicSlots.sort((a, b) => {
      const orderA = slots.findIndex((s) => s.key === a.key);
      const orderB = slots.findIndex((s) => s.key === b.key);
      return orderA - orderB;
    });

    return {
      slideRotationSeconds: BANNER_SLIDE_ROTATION_SECONDS,
      slidesPerPosition: BANNER_SLIDES_PER_SLOT,
      rotationIntervalMs: BANNER_SLIDE_ROTATION_MS,
      slots: publicSlots,
    };
  }

  async getPublicBannerByKey(key: string) {
    await this.ensureDefaults();
    const slot = await this.prisma.platformBannerSlot.findUnique({
      where: { key },
    });
    if (!slot || !slot.active) {
      throw new NotFoundException('Banner slot not found');
    }
    const siblings = await this.prisma.platformBannerSlot.findMany({
      where: { active: true, aspectRatio: slot.aspectRatio },
      orderBy: { sortOrder: 'asc' },
    });
    const campaigns = await this.listActiveBannerCampaigns(slot.aspectRatio);
    const built = this.buildPublicSlotsForAspect(
      siblings.map((s) => ({ key: s.key, aspectRatio: s.aspectRatio })),
      campaigns,
    );
    const match = built.find((s) => s.key === key);
    if (!match || match.slides.length === 0) {
      throw new NotFoundException('Banner slot has no active slides');
    }
    return match;
  }

  private async replaceSlotSlides(
    slotId: string,
    slides: BannerSlideDto[],
  ) {
    const imageUrls = await Promise.all(
      slides.map((slide) =>
        this.imageStorage.savePlatformBannerImage(slide.imageUrl),
      ),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.platformBannerSlide.deleteMany({ where: { slotId } });
      await tx.platformBannerSlide.createMany({
        data: slides.map((slide, index) => ({
          slotId,
          href: slide.href.trim(),
          imageUrl: imageUrls[index],
          alt: slide.alt.trim(),
          sortOrder: index,
          active: slide.active ?? true,
        })),
      });
    });
  }

  async listBannerSlotsForAdmin(aspectRatio?: BannerAspectRatio) {
    await this.ensureDefaults();
    const schedules = await this.bannerSlotScheduleById();
    const slots = await this.prisma.platformBannerSlot.findMany({
      where: aspectRatio ? { aspectRatio } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: {
        slides: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return slots.map((slot) => this.mapBannerSlotAdmin(slot, schedules));
  }

  async getBannerSlotForAdmin(id: string) {
    await this.ensureDefaults();
    const schedules = await this.bannerSlotScheduleById();
    const slot = await this.prisma.platformBannerSlot.findUnique({
      where: { id },
      include: { slides: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!slot) throw new NotFoundException('Banner slot not found');
    return this.mapBannerSlotAdmin(slot, schedules);
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
      await this.replaceSlotSlides(id, dto.slides);
    }

    const startsAt =
      dto.startsAt !== undefined
        ? this.parseStartDate(dto.startsAt)
        : undefined;
    const schedules = await this.bannerSlotScheduleById();
    const currentSchedule = this.resolveBannerSchedule(slot, schedules);
    const endsAt =
      dto.promotionDays !== undefined && startsAt !== undefined
        ? this.endsAtFromPromotion(startsAt, dto.promotionDays)
        : dto.promotionDays !== undefined
          ? this.endsAtFromPromotion(currentSchedule.startsAt, dto.promotionDays)
          : undefined;

    await this.prisma.platformBannerSlot.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(startsAt !== undefined ? { startsAt } : {}),
        ...(endsAt !== undefined ? { endsAt } : {}),
      },
    });

    return this.getBannerSlotForAdmin(id);
  }

  async listBannerCampaignsForAdmin(aspectRatio?: BannerAspectRatio) {
    await this.ensureDefaults();
    const campaigns = await this.prisma.platformBannerCampaign.findMany({
      where: aspectRatio ? { aspectRatio } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
    return campaigns.map((campaign) => this.mapBannerCampaignAdmin(campaign));
  }

  async getBannerCampaignForAdmin(id: string) {
    await this.ensureDefaults();
    const campaign = await this.prisma.platformBannerCampaign.findUnique({
      where: { id },
    });
    if (!campaign) throw new NotFoundException('Banner campaign not found');
    return this.mapBannerCampaignAdmin(campaign);
  }

  async createBannerCampaign(dto: CreateBannerCampaignDto) {
    await this.ensureDefaults();
    const startsAt = this.parseStartDate(dto.startsAt);
    const endsAt = this.endsAtFromPromotion(startsAt, dto.promotionDays);
    const label = dto.label?.trim() || dto.alt?.trim() || 'Campaign banner';
    const imageUrl = await this.imageStorage.savePlatformBannerImage(
      dto.imageUrl,
    );
    if (!imageUrl) {
      throw new BadRequestException(
        'Banner image could not be saved. Use a JPEG, PNG, or WebP image up to 5MB.',
      );
    }
    const maxOrder = await this.prisma.platformBannerCampaign.aggregate({
      where: { aspectRatio: dto.aspectRatio },
      _max: { sortOrder: true },
    });

    await this.prisma.platformBannerCampaign.create({
      data: {
        label,
        aspectRatio: dto.aspectRatio,
        href: dto.href.trim(),
        imageUrl,
        alt: dto.alt?.trim() || label,
        startsAt,
        endsAt,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return this.listBannerCampaignsForAdmin(dto.aspectRatio);
  }

  async updateBannerCampaign(id: string, dto: UpdateBannerCampaignDto) {
    await this.ensureDefaults();
    const campaign = await this.prisma.platformBannerCampaign.findUnique({
      where: { id },
    });
    if (!campaign) throw new NotFoundException('Banner campaign not found');

    const startsAt = dto.startsAt
      ? this.parseStartDate(dto.startsAt)
      : campaign.startsAt;
    const endsAt =
      dto.promotionDays !== undefined
        ? this.endsAtFromPromotion(startsAt, dto.promotionDays)
        : dto.startsAt !== undefined
          ? this.endsAtFromPromotion(startsAt, this.inferPromotionDays(campaign))
          : campaign.endsAt;

    const imageUrl =
      dto.imageUrl !== undefined
        ? await this.imageStorage.savePlatformBannerImage(dto.imageUrl)
        : undefined;
    if (dto.imageUrl !== undefined && !imageUrl) {
      throw new BadRequestException(
        'Banner image could not be saved. Use a JPEG, PNG, or WebP image up to 5MB.',
      );
    }

    await this.prisma.platformBannerCampaign.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
        ...(dto.href !== undefined ? { href: dto.href.trim() } : {}),
        ...(dto.alt !== undefined ? { alt: dto.alt.trim() } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(dto.startsAt !== undefined || dto.promotionDays !== undefined
          ? { startsAt, endsAt }
          : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
      },
    });

    return this.getBannerCampaignForAdmin(id);
  }

  async deleteBannerCampaign(id: string) {
    await this.ensureDefaults();
    const campaign = await this.prisma.platformBannerCampaign.findUnique({
      where: { id },
    });
    if (!campaign) throw new NotFoundException('Banner campaign not found');
    await this.prisma.platformBannerCampaign.delete({ where: { id } });
    return this.listBannerCampaignsForAdmin();
  }

  private inferPromotionDays(campaign: {
    startsAt: Date;
    endsAt: Date;
  }): PromotionPeriodDays {
    const days = Math.round(
      (campaign.endsAt.getTime() - campaign.startsAt.getTime()) / 86400000,
    );
    const allowed: PromotionPeriodDays[] = [3, 5, 7, 14, 30];
    return allowed.find((d) => d === days) ?? 7;
  }

  async listSponsoredForAdmin() {
    await this.ensureDefaults();
    const ads = await this.prisma.sponsoredAd.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { job: { include: jobWithCompany } },
    });
    return ads.map((ad) => this.mapSponsoredAd(ad));
  }

  private takeRotatingBatch<T>(items: T[], batchSize: number, offset: number): T[] {
    if (items.length === 0) return [];
    const start = offset % items.length;
    const batch: T[] = [];
    for (let i = 0; i < batchSize; i++) {
      batch.push(items[(start + i) % items.length]);
    }
    return batch;
  }

  private timeBasedSponsoredOffset(total: number, batchSize: number): number {
    if (total <= batchSize) return 0;
    const batchIndex = Math.floor(Date.now() / SPONSORED_BATCH_PERIOD_MS);
    return (batchIndex * batchSize) % total;
  }

  async listPublicSponsored(limit = SPONSORED_JOBS_BATCH_SIZE, offset?: number) {
    await this.ensureDefaults();
    const batchSize = Math.min(Math.max(limit, 1), 12);
    const now = new Date();
    const ads = await this.prisma.sponsoredAd.findMany({
      where: {
        active: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
        job: { status: JobStatus.PUBLISHED },
      },
      orderBy: { sortOrder: 'asc' },
      take: SPONSORED_POOL_MAX,
      include: { job: { include: jobWithCompany } },
    });

    const totalActive = ads.length;
    const resolvedOffset =
      offset !== undefined
        ? offset % Math.max(totalActive, 1)
        : this.timeBasedSponsoredOffset(totalActive, batchSize);
    const batch = this.takeRotatingBatch(ads, batchSize, resolvedOffset);
    const nextOffset =
      totalActive <= batchSize
        ? 0
        : (resolvedOffset + batchSize) % totalActive;

    return {
      batchSize,
      totalActive,
      offset: resolvedOffset,
      nextOffset,
      jobs: batch.map((ad) => this.mapJobForPublic(ad.job)),
    };
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

    const startsAt = this.parseStartDate(dto.startsAt);
    const endsAt = this.endsAtFromPromotion(startsAt, dto.promotionDays);

    const maxOrder = await this.prisma.sponsoredAd.aggregate({
      _max: { sortOrder: true },
    });

    await this.prisma.sponsoredAd.create({
      data: {
        jobId: dto.jobId,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
        startsAt,
        endsAt,
      },
    });

    return this.listSponsoredForAdmin();
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

  async updateSponsoredAd(id: string, dto: UpdateSponsoredAdDto) {
    const ad = await this.prisma.sponsoredAd.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Sponsored ad not found');

    const startsAt = dto.startsAt ? this.parseStartDate(dto.startsAt) : ad.startsAt;
    const endsAt =
      dto.promotionDays !== undefined
        ? this.endsAtFromPromotion(startsAt, dto.promotionDays)
        : ad.endsAt;

    if (endsAt <= startsAt) {
      throw new BadRequestException('End date must be after start date');
    }

    await this.prisma.sponsoredAd.update({
      where: { id },
      data: {
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        startsAt,
        endsAt,
      },
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
