"use client";

import { Icon } from "@/components/ui/icon";
import { LOGO_URL } from "@/lib/assets";
import { cn } from "@/lib/utils";

export type JobListingPreviewProps = {
  title: string;
  companyName: string;
  companyLogoUrl?: string | null;
  companyVerified?: boolean;
  category?: string;
  employmentType?: string;
  workArrangement?: string;
  experienceLevel?: string;
  city?: string;
  salaryType: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
};

function formatPreviewSalary({
  salaryType,
  salaryMin,
  salaryMax,
  salaryCurrency,
}: Pick<
  JobListingPreviewProps,
  "salaryType" | "salaryMin" | "salaryMax" | "salaryCurrency"
>): string {
  if (salaryType === "Negotiable") return "Negotiable";
  const min = salaryMin ? Number(salaryMin) : null;
  const max = salaryMax ? Number(salaryMax) : null;
  if (!min && !max) return "Salary not set";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: salaryCurrency || "LKR",
      maximumFractionDigits: 0,
      notation: n >= 100000 ? "compact" : "standard",
    }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function JobListingPreview({
  title,
  companyName,
  companyLogoUrl,
  companyVerified = false,
  category,
  employmentType,
  workArrangement,
  experienceLevel,
  city,
  salaryType,
  salaryMin,
  salaryMax,
  salaryCurrency,
}: JobListingPreviewProps) {
  const displayTitle = title.trim() || "Job title preview";
  const displayCompany = companyName.trim() || "Company name";
  const location = city?.trim() || "Location";
  const salaryLabel = formatPreviewSalary({
    salaryType,
    salaryMin,
    salaryMax,
    salaryCurrency,
  });

  const tags = [category, employmentType, workArrangement, experienceLevel].filter(
    Boolean,
  ) as string[];

  return (
    <aside className="lg:w-1/4">
      <div className="sticky top-28 space-y-4">
        <div className="space-y-4 rounded-lg border border-outline-variant bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary p-2">
                {companyLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    src={companyLogoUrl}
                    className="h-full w-full rounded object-contain"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    src={LOGO_URL}
                    className="h-full w-full object-contain brightness-0 invert"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                {companyVerified ? (
                  <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                    Verified Enterprise
                    <Icon
                      name="verified"
                      filled
                      className="!text-[14px] text-primary ![font-variation-settings:'FILL'_1,'wght'_400,'GRAD'_0,'opsz'_20]"
                    />
                  </span>
                ) : (
                  <span className="truncate text-label-sm text-on-surface-variant">
                    {displayCompany}
                  </span>
                )}
                <h4 className="line-clamp-2 text-[16px] font-label-bold text-on-surface">
                  {displayTitle}
                </h4>
              </div>
            </div>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              className="shrink-0 text-outline"
            >
              <Icon name="bookmark" />
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-bold text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 text-[12px]">
            <div className="flex min-w-0 items-center gap-1 text-on-surface-variant">
              <Icon name="location_on" className="shrink-0 text-[16px]" />
              <span className="truncate">{location}</span>
            </div>
            <div className={cn("shrink-0 font-bold text-primary", !salaryMin && !salaryMax && salaryType !== "Negotiable" && "text-on-surface-variant")}>
              {salaryLabel}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-primary/5 bg-surface-container-low p-6">
          <div className="flex items-center gap-2">
            <Icon name="lightbulb" className="text-[20px] text-primary" />
            <h4 className="font-label-bold text-on-surface">Expert Advice</h4>
          </div>
          <ul className="space-y-2 text-[12px] leading-relaxed text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              Listings with a clear salary range see higher engagement from qualified candidates.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              Clear requirements help candidates self-qualify before applying.
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
