"use client";

import { Icon } from "@/components/ui/icon";
import type { CompanyLogoDraft } from "@/lib/companies/company-logo";
import type { LifeAtImageDraft } from "@/lib/companies/life-at-images";
import { cn } from "@/lib/utils";

export type CompanyRegistrationPreviewProps = {
  companyName: string;
  industry: string;
  companyType: string;
  address: string;
  city: string;
  description: string;
  website: string;
  logo: CompanyLogoDraft | null;
  lifeAtImages: LifeAtImageDraft[];
};

export function CompanyRegistrationPreview({
  companyName,
  industry,
  companyType,
  address,
  city,
  description,
  website,
  logo,
  lifeAtImages,
}: CompanyRegistrationPreviewProps) {
  const displayName = companyName.trim() || "Company name";
  const displayLocation =
    [address.trim(), city.trim()].filter(Boolean).join(", ") || "Location";
  const excerpt =
    description.trim().slice(0, 160) ||
    "Your company description will appear on your public profile and job listings.";

  const tags = [industry, companyType].filter(Boolean) as string[];

  return (
    <aside className="w-full shrink-0 lg:w-1/4">
      <div className="sticky top-28 space-y-4">
        <div className="space-y-4 rounded-lg border border-outline-variant bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-low">
              {logo?.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  src={logo.previewUrl}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Icon name="domain" className="text-[28px] text-on-surface-variant" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-label-sm text-on-surface-variant">Employer profile</span>
              <h4 className="line-clamp-2 text-[16px] font-label-bold text-on-surface">
                {displayName}
              </h4>
              {website.trim() ? (
                <p className="mt-1 truncate text-[11px] text-primary">{website.trim()}</p>
              ) : null}
            </div>
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

          <p className="line-clamp-4 text-[12px] leading-relaxed text-on-surface-variant">
            {excerpt}
            {description.trim().length > 160 ? "…" : ""}
          </p>

          {lifeAtImages.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {lifeAtImages.slice(0, 3).map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  alt=""
                  src={image.previewUrl}
                  className="aspect-square w-full rounded object-cover"
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 border-t border-outline-variant/30 pt-3 text-[12px] text-on-surface-variant">
            <Icon name="location_on" className="shrink-0 text-[16px]" />
            <span className="truncate">{displayLocation}</span>
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
              A clear logo and industry help candidates recognize your brand in search results.
            </li>
            <li
              className={cn(
                "flex items-start gap-2",
                lifeAtImages.length === 0 && "opacity-80",
              )}
            >
              <span className="mt-1 text-primary">•</span>
              Culture photos increase trust before candidates apply to your roles.
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
