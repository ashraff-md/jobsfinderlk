import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BannerAspectRatio,
  JobStatus,
  PlatformAdReviewStatus,
  Prisma,
} from '@prisma/client';
import { ImageStorageService } from '../../common/storage/image-storage.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DEFAULT_BANNER_SLOTS } from './platform-ads.defaults';
import {
  CreateBannerCampaignDto,
  CreateSponsoredAdDto,
  PromotionPeriodDays,
  ReorderSponsoredAdsDto,
  ModeratePlatformAdDto,
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

export type PlatformAdSubmissionOptions = {
  submittedById?: string;
  pendingReview?: boolean;
};

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
      reviewStatus: PlatformAdReviewStatus;
      reviewNotes?: string | null;
      submittedById: string | null;
      promotionDays?: number;
      startsAt: Date;
      endsAt: Date;
      viewCount: number;
      clickCount?: number;
      job: Parameters<PlatformAdsService['mapJobForPublic']>[0];
    },
  >(ad: T) {
    return {
      id: ad.id,
      jobId: ad.jobId,
      sortOrder: ad.sortOrder,
      active: ad.active,
      reviewStatus: ad.reviewStatus,
      reviewNotes: ad.reviewNotes ?? undefined,
      submittedById: ad.submittedById ?? undefined,
      promotionDays:
        ad.promotionDays ??
        this.inferPromotionDays({ startsAt: ad.startsAt, endsAt: ad.endsAt }),
      viewCount: ad.viewCount,
      clickCount: ad.clickCount ?? 0,
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
    if (slides.length < BANNER_SLIDES_PER_SLOT) return true;
    const withImage = slides.filter((s) => s.imageUrl);
    if (withImage.length === 0) return false;
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
        const slides = def.slides.map((slide, index) => ({
          href: slide.href,
          alt: slide.alt,
          imageUrl: slot.slides[index]?.imageUrl ?? slide.imageUrl ?? undefined,
          active: true,
        }));
        await this.replaceSlotSlides(slot.id, slides);
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
        const imageUrl = await this.imageStorage.savePlatformBannerImage(
          slide.imageUrl,
        );
        await this.prisma.platformBannerCampaign.create({
          data: {
            label: slide.alt,
            aspectRatio: def.aspectRatio,
            href: slide.href,
            imageUrl,
            alt: slide.alt,
            promotionDays: 7,
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
    reviewStatus: PlatformAdReviewStatus;
    reviewNotes?: string | null;
    submittedById: string | null;
    promotionDays?: number;
    startsAt: Date;
    endsAt: Date;
    sortOrder: number;
    viewCount: number;
    clickCount?: number;
  }) {
    return {
      id: campaign.id,
      label: campaign.label,
      aspectRatio: campaign.aspectRatio,
      href: campaign.href,
      imageUrl: this.imageStorage.resolvePublicUrl(campaign.imageUrl),
      alt: campaign.alt,
      active: campaign.active,
      reviewStatus: campaign.reviewStatus,
      reviewNotes: campaign.reviewNotes ?? undefined,
      submittedById: campaign.submittedById ?? undefined,
      promotionDays:
        campaign.promotionDays ??
        this.inferPromotionDays({
          startsAt: campaign.startsAt,
          endsAt: campaign.endsAt,
        }),
      startsAt: campaign.startsAt.toISOString(),
      endsAt: campaign.endsAt.toISOString(),
      sortOrder: campaign.sortOrder,
      viewCount: campaign.viewCount,
      clickCount: campaign.clickCount ?? 0,
    };
  }

  private resolveEmployerCampaignStatus(
    reviewStatus: PlatformAdReviewStatus,
    startsAt: Date,
    endsAt: Date,
    active: boolean,
  ):
    | 'Pending Review'
    | 'Rejected'
    | 'Active'
    | 'Scheduled'
    | 'Paused'
    | 'Inactive' {
    if (reviewStatus === PlatformAdReviewStatus.PENDING) return 'Pending Review';
    if (reviewStatus === PlatformAdReviewStatus.REJECTED) return 'Rejected';
    if (Date.now() > endsAt.getTime()) return 'Inactive';
    if (!active) return 'Paused';
    return this.sponsoredScheduleStatus(startsAt, endsAt, active);
  }

  private async employerCompanyIds(userId: string) {
    const links = await this.prisma.employerUser.findMany({
      where: { userId },
      select: { companyId: true },
    });
    return links.map((link) => link.companyId);
  }

  private async assertEmployerOwnsSponsored(userId: string, id: string) {
    const companyIds = await this.employerCompanyIds(userId);
    const ad = await this.prisma.sponsoredAd.findFirst({
      where: {
        id,
        OR: [
          { submittedById: userId },
          ...(companyIds.length
            ? [{ job: { companyId: { in: companyIds } } }]
            : []),
        ],
      },
      include: { job: { include: jobWithCompany } },
    });
    if (!ad) throw new NotFoundException('Campaign not found');
    return ad;
  }

  private assertEmployerCanToggleCampaign(
    reviewStatus: PlatformAdReviewStatus,
    endsAt: Date,
  ) {
    if (reviewStatus !== PlatformAdReviewStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved campaigns can be paused or resumed.',
      );
    }
    if (Date.now() > endsAt.getTime()) {
      throw new BadRequestException(
        'Expired campaigns cannot be paused or resumed.',
      );
    }
  }

  async setEmployerSponsoredActive(
    userId: string,
    id: string,
    active: boolean,
  ) {
    const ad = await this.assertEmployerOwnsSponsored(userId, id);
    this.assertEmployerCanToggleCampaign(ad.reviewStatus, ad.endsAt);

    const updated = await this.prisma.sponsoredAd.update({
      where: { id },
      data: { active },
      include: { job: { include: jobWithCompany } },
    });

    return {
      kind: 'sponsored' as const,
      ...this.mapSponsoredAd(updated),
      status: this.resolveEmployerCampaignStatus(
        updated.reviewStatus,
        updated.startsAt,
        updated.endsAt,
        updated.active,
      ),
    };
  }

  async setEmployerBannerActive(userId: string, id: string, active: boolean) {
    const campaign = await this.prisma.platformBannerCampaign.findFirst({
      where: { id, submittedById: userId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    this.assertEmployerCanToggleCampaign(campaign.reviewStatus, campaign.endsAt);

    const updated = await this.prisma.platformBannerCampaign.update({
      where: { id },
      data: { active },
    });

    return {
      kind: 'banner' as const,
      ...this.mapBannerCampaignAdmin(updated),
      status: this.resolveEmployerCampaignStatus(
        updated.reviewStatus,
        updated.startsAt,
        updated.endsAt,
        updated.active,
      ),
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
    id: string;
    href: string;
    imageUrl: string | null;
    alt: string;
    label: string;
  }) {
    return {
      campaignId: campaign.id,
      href: campaign.href,
      imageUrl: this.imageStorage.resolvePublicUrl(campaign.imageUrl)!,
      alt: campaign.alt || campaign.label,
    };
  }

  async recordBannerImpressions(campaignIds: string[]) {
    const uniqueIds = [...new Set(campaignIds.filter(Boolean))];
    if (!uniqueIds.length) return { recorded: 0 };

    const now = new Date();
    const active = await this.prisma.platformBannerCampaign.findMany({
      where: {
        id: { in: uniqueIds },
        active: true,
        reviewStatus: PlatformAdReviewStatus.APPROVED,
        startsAt: { lte: now },
        endsAt: { gte: now },
        imageUrl: { not: null },
      },
      select: { id: true },
    });
    if (!active.length) return { recorded: 0 };

    const counts = new Map<string, number>();
    for (const id of campaignIds) {
      if (!active.some((row) => row.id === id)) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    await this.prisma.$transaction(
      [...counts.entries()].map(([id, count]) =>
        this.prisma.platformBannerCampaign.update({
          where: { id },
          data: { viewCount: { increment: count } },
        }),
      ),
    );

    return { recorded: [...counts.values()].reduce((sum, count) => sum + count, 0) };
  }

  async recordBannerClicks(campaignIds: string[]) {
    const uniqueIds = [...new Set(campaignIds.filter(Boolean))];
    if (!uniqueIds.length) return { recorded: 0 };

    const now = new Date();
    const active = await this.prisma.platformBannerCampaign.findMany({
      where: {
        id: { in: uniqueIds },
        active: true,
        reviewStatus: PlatformAdReviewStatus.APPROVED,
        startsAt: { lte: now },
        endsAt: { gte: now },
        imageUrl: { not: null },
      },
      select: { id: true },
    });
    if (!active.length) return { recorded: 0 };

    const counts = new Map<string, number>();
    for (const id of campaignIds) {
      if (!active.some((row) => row.id === id)) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    await this.prisma.$transaction(
      [...counts.entries()].map(([id, count]) =>
        this.prisma.platformBannerCampaign.update({
          where: { id },
          data: { clickCount: { increment: count } },
        }),
      ),
    );

    return { recorded: [...counts.values()].reduce((sum, count) => sum + count, 0) };
  }

  async recordSponsoredImpressions(sponsoredAdIds: string[]) {
    const uniqueIds = [...new Set(sponsoredAdIds.filter(Boolean))];
    if (!uniqueIds.length) return { recorded: 0 };

    const now = new Date();
    const active = await this.prisma.sponsoredAd.findMany({
      where: {
        id: { in: uniqueIds },
        active: true,
        reviewStatus: PlatformAdReviewStatus.APPROVED,
        startsAt: { lte: now },
        endsAt: { gte: now },
        job: { status: JobStatus.PUBLISHED },
      },
      select: { id: true },
    });
    if (!active.length) return { recorded: 0 };

    const counts = new Map<string, number>();
    for (const id of sponsoredAdIds) {
      if (!active.some((row) => row.id === id)) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    await this.prisma.$transaction(
      [...counts.entries()].map(([id, count]) =>
        this.prisma.sponsoredAd.update({
          where: { id },
          data: { viewCount: { increment: count } },
        }),
      ),
    );

    return { recorded: [...counts.values()].reduce((sum, count) => sum + count, 0) };
  }

  async recordSponsoredClicks(sponsoredAdIds: string[]) {
    const uniqueIds = [...new Set(sponsoredAdIds.filter(Boolean))];
    if (!uniqueIds.length) return { recorded: 0 };

    const now = new Date();
    const active = await this.prisma.sponsoredAd.findMany({
      where: {
        id: { in: uniqueIds },
        active: true,
        reviewStatus: PlatformAdReviewStatus.APPROVED,
        startsAt: { lte: now },
        endsAt: { gte: now },
        job: { status: JobStatus.PUBLISHED },
      },
      select: { id: true },
    });
    if (!active.length) return { recorded: 0 };

    const counts = new Map<string, number>();
    for (const id of sponsoredAdIds) {
      if (!active.some((row) => row.id === id)) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    await this.prisma.$transaction(
      [...counts.entries()].map(([id, count]) =>
        this.prisma.sponsoredAd.update({
          where: { id },
          data: { clickCount: { increment: count } },
        }),
      ),
    );

    return { recorded: [...counts.values()].reduce((sum, count) => sum + count, 0) };
  }

  private async listActiveBannerCampaigns(
    aspectRatio: BannerAspectRatio,
    now = new Date(),
  ) {
    return this.prisma.platformBannerCampaign.findMany({
      where: {
        aspectRatio,
        active: true,
        reviewStatus: PlatformAdReviewStatus.APPROVED,
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

  async createBannerCampaign(
    dto: CreateBannerCampaignDto,
    options?: PlatformAdSubmissionOptions,
  ) {
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

    const pendingReview = options?.pendingReview === true;

    await this.prisma.platformBannerCampaign.create({
      data: {
        label,
        aspectRatio: dto.aspectRatio,
        href: dto.href.trim(),
        imageUrl,
        alt: dto.alt?.trim() || label,
        promotionDays: dto.promotionDays,
        startsAt,
        endsAt,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
        reviewStatus: pendingReview
          ? PlatformAdReviewStatus.PENDING
          : PlatformAdReviewStatus.APPROVED,
        active: !pendingReview,
        submittedById: options?.submittedById ?? null,
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
    const promotionDays =
      dto.promotionDays ??
      (dto.startsAt !== undefined
        ? (campaign.promotionDays ||
            this.inferPromotionDays(campaign))
        : campaign.promotionDays);
    const endsAt =
      dto.promotionDays !== undefined || dto.startsAt !== undefined
        ? this.endsAtFromPromotion(
            startsAt,
            (promotionDays ?? this.inferPromotionDays(campaign)) as PromotionPeriodDays,
          )
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
          ? { startsAt, endsAt, promotionDays: promotionDays ?? campaign.promotionDays }
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
    const allowed: PromotionPeriodDays[] = [3, 5, 7, 14, 30, 60];
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

  async getSponsoredAdForAdmin(id: string) {
    await this.ensureDefaults();
    const ad = await this.prisma.sponsoredAd.findUnique({
      where: { id },
      include: { job: { include: jobWithCompany } },
    });
    if (!ad) throw new NotFoundException('Sponsored ad not found');
    return this.mapSponsoredAd(ad);
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
        reviewStatus: PlatformAdReviewStatus.APPROVED,
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
      jobs: batch.map((ad) => ({
        sponsoredAdId: ad.id,
        job: this.mapJobForPublic(ad.job),
      })),
    };
  }

  async createSponsoredAd(
    dto: CreateSponsoredAdDto,
    options?: PlatformAdSubmissionOptions,
  ) {
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

    const pendingReview = options?.pendingReview === true;

    await this.prisma.sponsoredAd.create({
      data: {
        jobId: dto.jobId,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
        promotionDays: dto.promotionDays,
        startsAt,
        endsAt,
        reviewStatus: pendingReview
          ? PlatformAdReviewStatus.PENDING
          : PlatformAdReviewStatus.APPROVED,
        active: !pendingReview,
        submittedById: options?.submittedById ?? null,
      },
    });

    return this.listSponsoredForAdmin();
  }

  async approveBannerCampaign(id: string, dto: ModeratePlatformAdDto = {}) {
    await this.ensureDefaults();
    const campaign = await this.prisma.platformBannerCampaign.findUnique({
      where: { id },
    });
    if (!campaign) throw new NotFoundException('Banner campaign not found');
    if (campaign.reviewStatus !== PlatformAdReviewStatus.PENDING) {
      throw new BadRequestException('Only pending banner campaigns can be approved.');
    }

    await this.prisma.platformBannerCampaign.update({
      where: { id },
      data: {
        reviewStatus: PlatformAdReviewStatus.APPROVED,
        active: true,
        reviewNotes: dto.reviewNotes?.trim() || null,
      },
    });

    return this.getBannerCampaignForAdmin(id);
  }

  async rejectBannerCampaign(id: string, dto: ModeratePlatformAdDto = {}) {
    await this.ensureDefaults();
    const campaign = await this.prisma.platformBannerCampaign.findUnique({
      where: { id },
    });
    if (!campaign) throw new NotFoundException('Banner campaign not found');
    if (campaign.reviewStatus !== PlatformAdReviewStatus.PENDING) {
      throw new BadRequestException('Only pending banner campaigns can be rejected.');
    }
    const reviewNotes = dto.reviewNotes?.trim();
    if (!reviewNotes) {
      throw new BadRequestException(
        'Review notes are required when rejecting a campaign.',
      );
    }

    await this.prisma.platformBannerCampaign.update({
      where: { id },
      data: {
        reviewStatus: PlatformAdReviewStatus.REJECTED,
        active: false,
        reviewNotes,
      },
    });

    return this.getBannerCampaignForAdmin(id);
  }

  async approveSponsoredAd(id: string, dto: ModeratePlatformAdDto = {}) {
    await this.ensureDefaults();
    const ad = await this.prisma.sponsoredAd.findUnique({
      where: { id },
      include: { job: true },
    });
    if (!ad) throw new NotFoundException('Sponsored ad not found');
    if (ad.reviewStatus !== PlatformAdReviewStatus.PENDING) {
      throw new BadRequestException('Only pending sponsored ads can be approved.');
    }
    if (ad.job.status !== JobStatus.PUBLISHED) {
      throw new BadRequestException('Only published jobs can be sponsored.');
    }

    await this.prisma.sponsoredAd.update({
      where: { id },
      data: {
        reviewStatus: PlatformAdReviewStatus.APPROVED,
        active: true,
        reviewNotes: dto.reviewNotes?.trim() || null,
      },
    });

    return this.listSponsoredForAdmin();
  }

  async rejectSponsoredAd(id: string, dto: ModeratePlatformAdDto = {}) {
    await this.ensureDefaults();
    const ad = await this.prisma.sponsoredAd.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Sponsored ad not found');
    if (ad.reviewStatus !== PlatformAdReviewStatus.PENDING) {
      throw new BadRequestException('Only pending sponsored ads can be rejected.');
    }
    const reviewNotes = dto.reviewNotes?.trim();
    if (!reviewNotes) {
      throw new BadRequestException(
        'Review notes are required when rejecting a campaign.',
      );
    }

    await this.prisma.sponsoredAd.update({
      where: { id },
      data: {
        reviewStatus: PlatformAdReviewStatus.REJECTED,
        active: false,
        reviewNotes,
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
    const promotionDays =
      dto.promotionDays ??
      (dto.startsAt !== undefined ? ad.promotionDays : undefined);
    const endsAt =
      dto.promotionDays !== undefined || dto.startsAt !== undefined
        ? this.endsAtFromPromotion(
            startsAt,
            (promotionDays ?? ad.promotionDays) as PromotionPeriodDays,
          )
        : ad.endsAt;

    if (endsAt <= startsAt) {
      throw new BadRequestException('End date must be after start date');
    }

    await this.prisma.sponsoredAd.update({
      where: { id },
      data: {
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(dto.promotionDays !== undefined || dto.startsAt !== undefined
          ? { startsAt, endsAt, promotionDays: promotionDays ?? ad.promotionDays }
          : {}),
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

  private sponsoredScheduleStatus(
    startsAt: Date,
    endsAt: Date,
    active: boolean,
  ): 'Active' | 'Scheduled' | 'Inactive' {
    if (!active) return 'Inactive';
    const now = Date.now();
    if (now < startsAt.getTime()) return 'Scheduled';
    if (now > endsAt.getTime()) return 'Inactive';
    return 'Active';
  }

  async listForEmployer(userId: string) {
    await this.ensureDefaults();

    const links = await this.prisma.employerUser.findMany({
      where: { userId },
      select: { companyId: true },
    });
    const companyIds = links.map((link) => link.companyId);

    const sponsoredWhere: Prisma.SponsoredAdWhereInput = {
      OR: [
        { submittedById: userId },
        ...(companyIds.length
          ? [{ job: { companyId: { in: companyIds } } }]
          : []),
      ],
    };

    const [sponsoredAds, bannerCampaigns] = await Promise.all([
      this.prisma.sponsoredAd.findMany({
        where: sponsoredWhere,
        orderBy: [{ createdAt: 'desc' }],
        include: { job: { include: jobWithCompany } },
      }),
      this.prisma.platformBannerCampaign.findMany({
        where: { submittedById: userId },
        orderBy: [{ createdAt: 'desc' }],
      }),
    ]);

    let totalImpressions = 0;
    let totalClicks = 0;
    let pendingReviewCount = 0;
    let activeCount = 0;
    let scheduledCount = 0;
    let expiredCount = 0;

    const sponsoredRows = sponsoredAds.map((ad) => {
      totalImpressions += ad.viewCount;
      totalClicks += ad.clickCount ?? 0;
      const status = this.resolveEmployerCampaignStatus(
        ad.reviewStatus,
        ad.startsAt,
        ad.endsAt,
        ad.active,
      );
      if (status === 'Pending Review') pendingReviewCount += 1;
      else if (status === 'Active') activeCount += 1;
      else if (status === 'Scheduled') scheduledCount += 1;
      else if (status === 'Paused' || status === 'Inactive') expiredCount += 1;

      return {
        kind: 'sponsored' as const,
        ...this.mapSponsoredAd(ad),
        status,
      };
    });

    const bannerRows = bannerCampaigns.map((campaign) => {
      totalImpressions += campaign.viewCount;
      totalClicks += campaign.clickCount ?? 0;
      const status = this.resolveEmployerCampaignStatus(
        campaign.reviewStatus,
        campaign.startsAt,
        campaign.endsAt,
        campaign.active,
      );
      if (status === 'Pending Review') pendingReviewCount += 1;
      else if (status === 'Active') activeCount += 1;
      else if (status === 'Scheduled') scheduledCount += 1;
      else if (status === 'Paused' || status === 'Inactive') expiredCount += 1;

      return {
        kind: 'banner' as const,
        ...this.mapBannerCampaignAdmin(campaign),
        status,
      };
    });

    const campaigns = [...sponsoredRows, ...bannerRows].sort(
      (a, b) =>
        new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    );

    return {
      campaigns,
      stats: {
        totalImpressions,
        totalClicks,
        pendingReviewCount,
        activeCount,
        scheduledCount,
        expiredCount,
      },
    };
  }
}
