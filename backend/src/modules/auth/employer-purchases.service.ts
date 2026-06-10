import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EmployerPurchaseProduct, JobStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PROMOTION_PERIOD_DAYS,
  type PromotionPeriodDays,
} from '../platform-ads/dto/platform-ads.dto';
import { PlatformAdsService } from '../platform-ads/platform-ads.service';
import {
  FREE_JOB_LISTING_SLOTS,
  jobSlotsForPlan,
} from './listing-slots.constants';
import { RecordEmployerPurchaseDto } from './dto/employer-purchase.dto';
import { PromoCodesService } from './promo-codes.service';

export type ListingAllowance = {
  freeSlots: number;
  purchasedSlots: number;
  totalSlots: number;
  usedSlots: number;
  remainingSlots: number;
};

const PRODUCT_MAP: Record<
  RecordEmployerPurchaseDto['product'],
  EmployerPurchaseProduct
> = {
  'job-listings': EmployerPurchaseProduct.JOB_LISTINGS,
  'sponsored-jobs': EmployerPurchaseProduct.SPONSORED_JOBS,
  'banner-advertising': EmployerPurchaseProduct.BANNER_ADVERTISING,
};

@Injectable()
export class EmployerPurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly promoCodes: PromoCodesService,
    private readonly platformAds: PlatformAdsService,
  ) {}

  async getListingAllowance(userId: string): Promise<ListingAllowance> {
    const [purchasedSlots, usedSlots] = await Promise.all([
      this.sumPurchasedJobSlots(userId),
      this.countUsedListingSlots(userId),
    ]);

    const totalSlots = FREE_JOB_LISTING_SLOTS + purchasedSlots;
    const remainingSlots = Math.max(0, totalSlots - usedSlots);

    return {
      freeSlots: FREE_JOB_LISTING_SLOTS,
      purchasedSlots,
      totalSlots,
      usedSlots,
      remainingSlots,
    };
  }

  async assertCanUseListingSlot(userId: string) {
    const allowance = await this.getListingAllowance(userId);
    if (allowance.remainingSlots > 0) return;

    throw new ForbiddenException(
      'You have used all your job listing slots. Purchase a listing package to post more vacancies.',
    );
  }

  async listPurchases(userId: string) {
    const purchases = await this.prisma.employerPurchase.findMany({
      where: { userId },
      orderBy: { purchasedAt: 'desc' },
    });

    return purchases.map((purchase) => this.mapPurchase(purchase));
  }

  async recordPurchase(userId: string, dto: RecordEmployerPurchaseDto) {
    if (dto.product === 'job-listings') {
      const slots = jobSlotsForPlan(dto.plan);
      if (slots <= 0) {
        throw new BadRequestException('Unknown job listing package.');
      }
    }

    const { promo, subtotal, total } = await this.promoCodes.applyOnPurchase(
      dto.promoCode,
      dto.product,
      dto.subtotal,
      dto.total,
    );

    const purchase = await this.prisma.$transaction(async (tx) => {
      const created = await tx.employerPurchase.create({
        data: {
          userId,
          product: PRODUCT_MAP[dto.product],
          plan: dto.plan.trim(),
          duration: dto.duration?.trim() || null,
          jobSlots:
            dto.product === 'job-listings' ? jobSlotsForPlan(dto.plan) : null,
          subtotal,
          promoCodeId: promo?.id ?? null,
          promoCode: promo?.code ?? null,
          promoDiscount: promo?.discountAmount ?? 0,
          total,
          paymentMethod: dto.paymentMethod,
        },
      });

      if (promo) {
        await tx.promoCode.update({
          where: { id: promo.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      return created;
    });

    if (dto.product === 'sponsored-jobs' || dto.product === 'banner-advertising') {
      try {
        await this.provisionAdFromPurchase(userId, dto);
      } catch (error) {
        await this.rollbackPurchase(purchase.id, purchase.promoCodeId);
        throw error;
      }
    }

    const listingAllowance =
      dto.product === 'job-listings'
        ? await this.getListingAllowance(userId)
        : undefined;

    return {
      purchase: this.mapPurchase(purchase),
      listingAllowance,
    };
  }

  private async provisionAdFromPurchase(
    userId: string,
    dto: RecordEmployerPurchaseDto,
  ) {
    const campaign = dto.adCampaign;
    if (!campaign) {
      throw new BadRequestException(
        'Ad campaign details are required for sponsored and banner purchases.',
      );
    }

    const promotionDays =
      campaign.promotionDays ?? this.parseDurationDays(dto.duration);
    if (
      promotionDays === null ||
      !PROMOTION_PERIOD_DAYS.includes(promotionDays as PromotionPeriodDays)
    ) {
      throw new BadRequestException('Invalid promotion duration.');
    }

    const startsAt =
      campaign.startsAt ?? new Date().toISOString().slice(0, 10);

    if (dto.product === 'sponsored-jobs') {
      if (!campaign.jobId) {
        throw new BadRequestException('Select a job to sponsor.');
      }
      await this.assertJobOwnedByUser(userId, campaign.jobId);
      await this.platformAds.createSponsoredAd(
        {
          jobId: campaign.jobId,
          startsAt,
          promotionDays: promotionDays as PromotionPeriodDays,
        },
        { submittedById: userId, pendingReview: true },
      );
      return;
    }

    if (!campaign.aspectRatio || !campaign.href?.trim() || !campaign.imageUrl) {
      throw new BadRequestException(
        'Banner artwork, destination link, and format are required.',
      );
    }

    await this.platformAds.createBannerCampaign(
      {
        aspectRatio: campaign.aspectRatio,
        label: campaign.label?.trim() || dto.plan.trim(),
        href: campaign.href.trim(),
        imageUrl: campaign.imageUrl,
        alt: campaign.label?.trim(),
        startsAt,
        promotionDays: promotionDays as PromotionPeriodDays,
      },
      { submittedById: userId, pendingReview: true },
    );
  }

  private parseDurationDays(duration?: string | null): number | null {
    if (!duration) return null;
    const match = /^(\d+)/.exec(duration.trim());
    if (!match) return null;
    return Number(match[1]);
  }

  private async assertJobOwnedByUser(userId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new BadRequestException('Job not found.');
    }
    if (job.postedById !== userId) {
      throw new ForbiddenException('You can only sponsor jobs you posted.');
    }
  }

  private async rollbackPurchase(
    purchaseId: string,
    promoCodeId: string | null,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.employerPurchase.delete({ where: { id: purchaseId } });
      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: { usedCount: { decrement: 1 } },
        });
      }
    });
  }

  private async sumPurchasedJobSlots(userId: string): Promise<number> {
    const result = await this.prisma.employerPurchase.aggregate({
      where: {
        userId,
        product: EmployerPurchaseProduct.JOB_LISTINGS,
      },
      _sum: { jobSlots: true },
    });
    return result._sum.jobSlots ?? 0;
  }

  private async countUsedListingSlots(userId: string): Promise<number> {
    return this.prisma.job.count({
      where: {
        postedById: userId,
        status: { in: [JobStatus.PUBLISHED, JobStatus.PENDING_REVIEW] },
      },
    });
  }

  private mapPurchase(purchase: {
    id: string;
    product: EmployerPurchaseProduct;
    plan: string;
    duration: string | null;
    jobSlots: number | null;
    subtotal: number | null;
    promoCode: string | null;
    promoDiscount: number;
    total: number;
    paymentMethod: string;
    purchasedAt: Date;
  }) {
    const product =
      purchase.product === EmployerPurchaseProduct.SPONSORED_JOBS
        ? 'sponsored-jobs'
        : purchase.product === EmployerPurchaseProduct.BANNER_ADVERTISING
          ? 'banner-advertising'
          : 'job-listings';

    return {
      id: purchase.id,
      product,
      plan: purchase.plan,
      duration: purchase.duration ?? undefined,
      jobSlots: purchase.jobSlots ?? undefined,
      subtotal: purchase.subtotal ?? undefined,
      promoCode: purchase.promoCode ?? undefined,
      promoDiscount: purchase.promoDiscount || undefined,
      total: purchase.total,
      paymentMethod: purchase.paymentMethod as 'card' | 'bank' | 'po',
      purchasedAt: purchase.purchasedAt.toISOString(),
    };
  }
}
