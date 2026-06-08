import {
  BANNER_PROMOTION_PERIOD_OPTIONS,
  SPONSORED_PROMOTION_PERIOD_OPTIONS,
  addPromotionDays,
  formatScheduleRange,
  toDateInputValue,
  type BannerPromotionPeriodDays,
  type SponsoredPromotionPeriodDays,
} from "@/lib/platform-ads/sponsored-schedule";
import { cn } from "@/lib/utils";

type PromotionScheduleMode = "banner" | "sponsored";

type PromotionScheduleFieldsProps = {
  startDate: string;
  onStartDateChange: (value: string) => void;
  promotionDays: number;
  onPromotionDaysChange: (days: number) => void;
  mode?: PromotionScheduleMode;
};

export function PromotionScheduleFields({
  startDate,
  onStartDateChange,
  promotionDays,
  onPromotionDaysChange,
  mode = "sponsored",
}: PromotionScheduleFieldsProps) {
  const options =
    mode === "banner" ? BANNER_PROMOTION_PERIOD_OPTIONS : SPONSORED_PROMOTION_PERIOD_OPTIONS;

  const promotionEndPreview = formatScheduleRange(
    new Date(startDate).toISOString(),
    addPromotionDays(new Date(startDate), promotionDays as BannerPromotionPeriodDays).toISOString(),
  );

  return (
    <>
      <label className="block">
        <span className="mb-2 block font-label-bold">Start date</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full rounded-lg border border-outline-variant p-3 text-body-md focus:border-secondary focus:outline-none"
        />
      </label>

      <div>
        <span className="mb-2 block font-label-bold">Promotion period</span>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.days}
              type="button"
              onClick={() => onPromotionDaysChange(option.days)}
              className={cn(
                "rounded-lg border px-4 py-2 text-label-sm font-bold transition-colors",
                promotionDays === option.days
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-outline-variant text-on-surface-variant hover:border-secondary/50",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-label-sm text-on-surface-variant">
          Runs until:{" "}
          <span className="font-label-bold text-on-surface">{promotionEndPreview}</span>
        </p>
      </div>
    </>
  );
}

export function inferBannerPromotionDaysFromRange(
  startsAt: string,
  endsAt: string,
): BannerPromotionPeriodDays {
  const days = Math.round(
    (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 86400000,
  );
  const match = BANNER_PROMOTION_PERIOD_OPTIONS.find((o) => o.days === days);
  return (match?.days ?? 7) as BannerPromotionPeriodDays;
}

export function inferSponsoredPromotionDaysFromRange(
  startsAt: string,
  endsAt: string,
): SponsoredPromotionPeriodDays {
  const days = Math.round(
    (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 86400000,
  );
  const match = SPONSORED_PROMOTION_PERIOD_OPTIONS.find((o) => o.days === days);
  return (match?.days ?? 7) as SponsoredPromotionPeriodDays;
}

export { toDateInputValue };
