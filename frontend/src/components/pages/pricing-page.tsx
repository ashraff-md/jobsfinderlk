"use client";

import { useState } from "react";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { BannerAdvertisingSection } from "@/components/pages/pricing/banner-advertising-section";
import { JobListingsSection } from "@/components/pages/pricing/job-listings-section";
import { SponsoredJobsSection } from "@/components/pages/pricing/sponsored-jobs-section";
import { cn } from "@/lib/utils";

type PricingTab = "job-listings" | "sponsored-jobs" | "banner-advertising";

const TABS: { key: PricingTab; label: string }[] = [
  { key: "job-listings", label: "Job Listings" },
  { key: "sponsored-jobs", label: "Sponsored Jobs" },
  { key: "banner-advertising", label: "Banner Advertising" },
];

export function PricingPage() {
  const [tab, setTab] = useState<PricingTab>("job-listings");

  const toggleActive =
    "rounded-lg bg-surface-container-lowest font-label-bold text-label-bold text-secondary shadow-sm";
  const toggleInactive =
    "rounded-lg font-label-bold text-label-bold text-on-surface-variant transition-all hover:bg-surface-container-low hover:text-on-surface";

  return (
    <PublicPageLayout>
      <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg pb-24 md:px-margin-desktop">
        <section className="mb-12 text-center">
          <h1 className="mb-4 font-headline-xl text-headline-xl text-primary">
            Recruitment Solutions & Pricing
          </h1>
          <p className="mx-auto max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
            From standard job listings to premium sponsorship and banner advertising — scale your
            hiring with institutional-grade tools built for Sri Lanka&apos;s top employers.
          </p>
          <div className="mt-stack-lg inline-flex flex-wrap justify-center gap-1 rounded-xl bg-surface-container p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-6 py-3 transition-all md:px-8",
                  tab === t.key ? toggleActive : toggleInactive,
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {tab === "job-listings" && <JobListingsSection />}
        {tab === "sponsored-jobs" && <SponsoredJobsSection />}
        {tab === "banner-advertising" && <BannerAdvertisingSection />}
      </main>
    </PublicPageLayout>
  );
}
