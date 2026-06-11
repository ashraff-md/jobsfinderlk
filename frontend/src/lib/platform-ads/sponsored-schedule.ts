export const BANNER_PROMOTION_PERIOD_OPTIONS = [
  { days: 7, label: "7 Days" },
  { days: 14, label: "14 Days" },
  { days: 30, label: "30 Days" },
  { days: 60, label: "60 Days" },
] as const;

export const SPONSORED_PROMOTION_PERIOD_OPTIONS = [
  { days: 3, label: "+3 days" },
  { days: 5, label: "+5 days" },
  { days: 7, label: "+7 days" },
  { days: 14, label: "+14 days" },
  { days: 30, label: "+1 month" },
] as const;

/** @deprecated Use BANNER_PROMOTION_PERIOD_OPTIONS or SPONSORED_PROMOTION_PERIOD_OPTIONS */
export const PROMOTION_PERIOD_OPTIONS = SPONSORED_PROMOTION_PERIOD_OPTIONS;

export type BannerPromotionPeriodDays =
  (typeof BANNER_PROMOTION_PERIOD_OPTIONS)[number]["days"];

export type SponsoredPromotionPeriodDays =
  (typeof SPONSORED_PROMOTION_PERIOD_OPTIONS)[number]["days"];

export type PromotionPeriodDays = BannerPromotionPeriodDays | SponsoredPromotionPeriodDays;

export function addPromotionDays(start: Date, days: PromotionPeriodDays): Date {
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return end;
}

const formatDisplayDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function formatScheduleRange(startsAt: string, endsAt: string): string {
  return `${formatDisplayDate(new Date(startsAt))} – ${formatDisplayDate(new Date(endsAt))}`;
}

export function campaignScheduleProgress(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export function formatPromotionEndDate(endsAt: string | null | undefined): string {
  if (!endsAt) return "—";
  const end = new Date(endsAt);
  if (Number.isNaN(end.getTime())) return "—";
  return formatDisplayDate(end);
}

export type PlatformAdReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export function sponsoredScheduleStatus(
  startsAt: string,
  endsAt: string,
  active: boolean,
): "Active" | "Scheduled" | "Inactive" {
  if (!active) return "Inactive";
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (now < start) return "Scheduled";
  if (now > end) return "Inactive";
  return "Active";
}

export function platformAdCampaignStatus(
  reviewStatus: PlatformAdReviewStatus,
  startsAt: string,
  endsAt: string,
  active: boolean,
): "Pending Review" | "Rejected" | "Active" | "Scheduled" | "Inactive" {
  if (reviewStatus === "PENDING") return "Pending Review";
  if (reviewStatus === "REJECTED") return "Rejected";
  return sponsoredScheduleStatus(startsAt, endsAt, active);
}

export function toDateInputValue(iso?: string | null): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return new Date(iso).toISOString().slice(0, 10);
}

export function inferPromotionDaysFromRange(
  startsAt: string,
  endsAt: string,
  options: readonly { days: number }[] = BANNER_PROMOTION_PERIOD_OPTIONS,
): number {
  const days = Math.round(
    (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 86400000,
  );
  const match = options.find((o) => o.days === days);
  return match?.days ?? options[0]?.days ?? 7;
}
