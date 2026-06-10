import type { PurchaseProduct } from "@/lib/employer/purchases";

export type EmployerAdType = "sponsored" | "banner-wide" | "banner-tall";

export const EMPLOYER_DURATION_OPTIONS = [7, 14, 30, 60] as const;

export type EmployerDurationDays = (typeof EMPLOYER_DURATION_OPTIONS)[number];

const WIDE_PRICES: Record<EmployerDurationDays, number> = {
  7: 3000,
  14: 5500,
  30: 10000,
  60: 18000,
};

const TALL_PRICES: Record<EmployerDurationDays, number> = {
  7: 4500,
  14: 8000,
  30: 14500,
  60: 22000,
};

const SPONSORED_PRICES: Record<EmployerDurationDays, number> = {
  7: 3000,
  14: 5500,
  30: 10000,
  60: 18000,
};

export function basePriceForAdType(adType: EmployerAdType, days: EmployerDurationDays): number {
  if (adType === "banner-wide") return WIDE_PRICES[days];
  if (adType === "banner-tall") return TALL_PRICES[days];
  return SPONSORED_PRICES[days];
}

export function calculateCampaignTotal(adType: EmployerAdType, days: EmployerDurationDays) {
  const base = basePriceForAdType(adType, days);
  const discount = days >= 30 ? Math.round(base * 0.15) : 0;
  return { base, discount, total: base - discount };
}

export function adTypeLabel(adType: EmployerAdType): string {
  if (adType === "sponsored") return "Sponsored Job";
  if (adType === "banner-wide") return "Banner Ad";
  return "Leaderboard Ad";
}

export function parsePromotionDaysFromDuration(
  duration?: string,
): EmployerDurationDays | undefined {
  const match = duration?.trim().match(/^(\d+)/);
  const days = match ? Number(match[1]) : NaN;
  return EMPLOYER_DURATION_OPTIONS.includes(days as EmployerDurationDays)
    ? (days as EmployerDurationDays)
    : undefined;
}

export function campaignStartsAtIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function campaignPurchaseMeta(input: {
  adType: EmployerAdType;
  days: EmployerDurationDays;
  campaignName: string;
}): { product: PurchaseProduct; plan: string; duration: string } {
  const durationLabel = `${input.days} Days`;
  const name = input.campaignName.trim() || "Campaign";

  if (input.adType === "sponsored") {
    return {
      product: "sponsored-jobs",
      plan: `${name} (${durationLabel})`,
      duration: durationLabel,
    };
  }

  const bannerType =
    input.adType === "banner-wide" ? "Medium Banner (3x2)" : "Vertical Banner (2x5)";
  return {
    product: "banner-advertising",
    plan: `${bannerType} — ${durationLabel}`,
    duration: durationLabel,
  };
}
