import {
  BadRequestException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  EmployerPurchaseProduct,
  PromoCode,
  PromoDiscountType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type PromoCodeProduct =
  | 'job-listings'
  | 'sponsored-jobs'
  | 'banner-advertising';

const PRODUCT_MAP: Record<PromoCodeProduct, EmployerPurchaseProduct> = {
  'job-listings': EmployerPurchaseProduct.JOB_LISTINGS,
  'sponsored-jobs': EmployerPurchaseProduct.SPONSORED_JOBS,
  'banner-advertising': EmployerPurchaseProduct.BANNER_ADVERTISING,
};

export const CHECKOUT_VAT_RATE = 0.08;

export type ValidatedPromoCode = {
  id: string;
  code: string;
  description: string | null;
  discountAmount: number;
  subtotalAfterDiscount: number;
  vat: number;
  total: number;
};

@Injectable()
export class PromoCodesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultCodes();
  }

  private async ensureDefaultCodes() {
    const defaults: Array<{
      code: string;
      description: string;
      discountType: PromoDiscountType;
      discountValue: number;
      minSubtotal: number;
    }> = [
      {
        code: 'WELCOME10',
        description: '10% off your order',
        discountType: PromoDiscountType.PERCENT,
        discountValue: 10,
        minSubtotal: 0,
      },
      {
        code: 'SAVE2000',
        description: 'LKR 2,000 off orders over LKR 10,000',
        discountType: PromoDiscountType.FIXED,
        discountValue: 2000,
        minSubtotal: 10000,
      },
    ];

    for (const item of defaults) {
      await this.prisma.promoCode.upsert({
        where: { code: item.code },
        update: {},
        create: {
          code: item.code,
          description: item.description,
          discountType: item.discountType,
          discountValue: item.discountValue,
          minSubtotal: item.minSubtotal,
          active: true,
        },
      });
    }
  }

  normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  async validateForCheckout(
    code: string,
    product: PromoCodeProduct,
    subtotal: number,
  ): Promise<ValidatedPromoCode> {
    const normalized = this.normalizeCode(code);
    if (!normalized) {
      throw new BadRequestException('Enter a promo code.');
    }

    const promo = await this.prisma.promoCode.findUnique({
      where: { code: normalized },
    });

    if (!promo) {
      throw new BadRequestException('This promo code is not valid.');
    }

    const discountAmount = this.computeDiscount(promo, product, subtotal);
    const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
    const vat = Math.round(subtotalAfterDiscount * CHECKOUT_VAT_RATE);
    const total = subtotalAfterDiscount + vat;

    return {
      id: promo.id,
      code: promo.code,
      description: promo.description,
      discountAmount,
      subtotalAfterDiscount,
      vat,
      total,
    };
  }

  async applyOnPurchase(
    code: string | undefined,
    product: PromoCodeProduct,
    subtotal: number,
    expectedTotal: number,
  ): Promise<{
    promo: ValidatedPromoCode | null;
    subtotal: number;
    total: number;
  }> {
    if (!code?.trim()) {
      const { vat, total } = this.totalsFromSubtotal(subtotal);
      if (total !== expectedTotal) {
        throw new BadRequestException('Order total does not match the quoted price.');
      }
      return { promo: null, subtotal, total };
    }

    const promo = await this.validateForCheckout(code, product, subtotal);
    if (promo.total !== expectedTotal) {
      throw new BadRequestException('Order total does not match the quoted price.');
    }

    return { promo, subtotal, total: promo.total };
  }

  totalsFromSubtotal(subtotal: number, promoDiscount = 0) {
    const subtotalAfterDiscount = Math.max(0, subtotal - promoDiscount);
    const vat = Math.round(subtotalAfterDiscount * CHECKOUT_VAT_RATE);
    return {
      subtotalAfterDiscount,
      vat,
      total: subtotalAfterDiscount + vat,
    };
  }

  private computeDiscount(
    promo: PromoCode,
    product: PromoCodeProduct,
    subtotal: number,
  ): number {
    this.assertPromoActive(promo, product, subtotal);

    if (promo.discountType === PromoDiscountType.PERCENT) {
      const percent = Math.min(100, Math.max(0, promo.discountValue));
      return Math.round((subtotal * percent) / 100);
    }

    return Math.min(subtotal, Math.max(0, promo.discountValue));
  }

  private assertPromoActive(
    promo: PromoCode,
    product: PromoCodeProduct,
    subtotal: number,
  ) {
    if (!promo.active) {
      throw new BadRequestException('This promo code is no longer active.');
    }

    const now = Date.now();
    if (promo.startsAt && now < promo.startsAt.getTime()) {
      throw new BadRequestException('This promo code is not active yet.');
    }
    if (promo.endsAt && now > promo.endsAt.getTime()) {
      throw new BadRequestException('This promo code has expired.');
    }
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('This promo code has reached its usage limit.');
    }
    if (subtotal < promo.minSubtotal) {
      throw new BadRequestException(
        `This promo code requires a minimum order of LKR ${promo.minSubtotal.toLocaleString()}.`,
      );
    }

    if (promo.products.length > 0) {
      const mapped = PRODUCT_MAP[product];
      if (!promo.products.includes(mapped)) {
        throw new BadRequestException('This promo code does not apply to this product.');
      }
    }
  }
}
