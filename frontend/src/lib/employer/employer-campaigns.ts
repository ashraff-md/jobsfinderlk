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

export function checkoutHrefForCampaign(input: {
  adType: EmployerAdType;
  days: EmployerDurationDays;
  campaignName: string;
  jobId?: string;
}) {
  const { total } = calculateCampaignTotal(input.adType, input.days);
  const durationLabel = `${input.days} Days`;

  if (input.adType === "sponsored") {
    const params = new URLSearchParams({
      product: "sponsored-jobs",
      plan: `${input.campaignName} (${durationLabel})`,
      duration: durationLabel,
      price: String(total),
    });
    if (input.jobId) params.set("jobId", input.jobId);
    return `/pricing/checkout?${params.toString()}`;
  }

  const aspect = input.adType === "banner-wide" ? "wide" : "tall";
  const bannerType =
    input.adType === "banner-wide" ? "Medium Banner (3x2)" : "Vertical Banner (2x5)";
  const params = new URLSearchParams({
    product: "banner-advertising",
    plan: `${bannerType} — ${durationLabel}`,
    duration: durationLabel,
    price: String(total),
    aspect,
  });
  return `/pricing/checkout?${params.toString()}`;
}
