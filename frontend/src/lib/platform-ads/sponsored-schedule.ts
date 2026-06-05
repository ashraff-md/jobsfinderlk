export const PROMOTION_PERIOD_OPTIONS = [
  { days: 3, label: "+3 days" },
  { days: 5, label: "+5 days" },
  { days: 7, label: "+7 days" },
  { days: 14, label: "+14 days" },
  { days: 30, label: "+1 month" },
] as const;

export type PromotionPeriodDays = (typeof PROMOTION_PERIOD_OPTIONS)[number]["days"];

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

export function formatPromotionEndDate(endsAt: string | null | undefined): string {
  if (!endsAt) return "—";
  const end = new Date(endsAt);
  if (Number.isNaN(end.getTime())) return "—";
  return formatDisplayDate(end);
}

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

export function toDateInputValue(iso?: string | null): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return new Date(iso).toISOString().slice(0, 10);
}
