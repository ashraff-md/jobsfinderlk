"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  PricingCtaBand,
  PricingHero,
  PricingInfoCard,
  PricingSection,
  PricingSectionHeader,
  pricingBtnPrimary,
  pricingBtnOutline,
  pricingCard,
  pricingShadow,
  pricingTablePrice,
} from "@/components/pages/pricing/pricing-theme";
import { PRICING_BANNER_CTA_IMG } from "@/lib/assets";
import { cn } from "@/lib/utils";

const PLACEMENTS = [
  {
    icon: "home",
    title: "Homepage",
    description:
      "First-touch visibility for general brand awareness among the widest possible audience of professionals and students.",
  },
  {
    icon: "search",
    title: "Job Search",
    description:
      "Capture the attention of active seekers exactly when they are filtering for their next career milestone.",
  },
  {
    icon: "description",
    title: "Job Details",
    description:
      "Premium exposure alongside industry-specific descriptions, targeting niche professionals in highly relevant sectors.",
  },
] as const;

const MEDIUM_BANNER_PRICING = [
  { days: "07 Days", price: 3000, badge: undefined },
  { days: "14 Days", price: 5500, badge: undefined },
  { days: "30 Days", price: 10000, badge: "MOST POPULAR" as const },
  { days: "60 Days", price: 18000, badge: undefined },
] as const;

const VERTICAL_BANNER_PRICING = [
  { days: "07 Days", price: 4500, badge: undefined },
  { days: "14 Days", price: 8000, badge: undefined },
  { days: "30 Days", price: 14500, badge: undefined },
  { days: "60 Days", price: 22000, badge: "BEST VALUE" as const },
] as const;

const CREATIVE_REQUIREMENTS = [
  "High-resolution JPG or PNG format required.",
  "Minimum 300 DPI for sharp text rendering.",
  "Destination URL must be HTTPS secure.",
  "Ad content must comply with Sri Lankan labor laws.",
] as const;

function checkoutHref(
  bannerType: string,
  days: string,
  price: number,
  aspect: "wide" | "tall",
) {
  const params = new URLSearchParams({
    product: "banner-advertising",
    plan: `${bannerType} — ${days}`,
    duration: days,
    price: String(price),
    aspect,
  });
  return `/pricing/checkout?${params.toString()}`;
}

function PricingTable({
  title,
  subtitle,
  rows,
  bannerType,
  aspect,
}: {
  title: string;
  subtitle: string;
  rows: readonly { days: string; price: number; badge?: string }[];
  bannerType: string;
  aspect: "wide" | "tall";
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-outline-variant", pricingShadow)}>
      <div className="border-b border-outline-variant bg-surface-container-low p-8">
        <h4 className="font-headline-md text-headline-md text-on-surface">{title}</h4>
        <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          {subtitle}
        </p>
      </div>
      <div className="divide-y divide-outline-variant bg-surface-container-lowest">
        {rows.map((row) => (
          <Link
            key={row.days}
            href={checkoutHref(bannerType, row.days, row.price, aspect)}
            className={cn(
              "flex justify-between p-6 transition-colors hover:bg-surface-container-low",
              row.badge && "bg-secondary/5",
            )}
          >
            <span className="flex items-center gap-2 font-label-bold text-on-surface">
              {row.days}
              {row.badge && (
                <span className="whitespace-nowrap rounded-full bg-secondary px-2 py-0.5 text-[10px] text-on-secondary">
                  {row.badge}
                </span>
              )}
            </span>
            <span className={pricingTablePrice}>LKR {row.price.toLocaleString("en-LK")}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BannerAdvertisingSection() {
  return (
    <div className="space-y-24">
      <PricingHero
        badge="Enterprise Advertising"
        title="Amplifying Your Brand Where the Nation's Top Talent Convenes"
        description="High-impact banner placements across Sri Lanka's premium recruitment ecosystem. Target executive talent and decision-makers with clinical precision."
        primaryAction={
          <a href="#banner-pricing" className={pricingBtnPrimary}>
            View Pricing
          </a>
        }
        secondaryAction={
          <a href="#banner-placements" className={pricingBtnOutline}>
            Explore Placements
          </a>
        }
        visual={
          <div className="grid grid-cols-1 gap-4">
            {PLACEMENTS.slice(0, 2).map((placement) => (
              <PricingInfoCard
                key={placement.title}
                icon={placement.icon}
                title={placement.title}
                description={placement.description}
              />
            ))}
          </div>
        }
      />

      <PricingSection variant="muted">
        <div className="grid grid-cols-1 items-stretch gap-gutter lg:grid-cols-12">
          <div className={cn("lg:col-span-7", pricingCard, "bg-surface-container-lowest p-8 md:p-12")}>
            <h3 className="mb-8 font-headline-lg text-headline-lg text-on-surface">
              Ad Inventory Architecture
            </h3>
            <div className="space-y-8">
              <div className="flex gap-stack-md">
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-on-surface-variant">
                  3:2
                </div>
                <div>
                  <h4 className="mb-1 font-label-bold text-label-bold text-on-surface">
                    Medium Banner (3x2 Ratio)
                  </h4>
                  <p className="font-label-sm text-on-surface-variant">
                    Optimized for search result integration. High click-through potential with focused
                    messaging.
                  </p>
                </div>
              </div>
              <div className="flex gap-stack-md">
                <div className="flex h-48 w-24 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-on-surface-variant">
                  2:5
                </div>
                <div>
                  <h4 className="mb-1 font-label-bold text-label-bold text-on-surface">
                    Vertical Banner (2x5 Ratio)
                  </h4>
                  <p className="font-label-sm text-on-surface-variant">
                    Commanding presence on the sidebar of job details pages. Best for long-form brand
                    imagery.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={cn(pricingCard, "relative flex flex-col justify-center p-8 md:p-12 lg:col-span-5")}>
            <Icon name="sync" className="mb-6 text-5xl text-secondary" />
            <h3 className="mb-6 font-headline-md text-headline-md text-on-surface">Rotation Policy</h3>
            <p className="mb-6 leading-relaxed text-on-surface-variant">
              To ensure maximum fairness and diverse brand exposure, we implement a strict{" "}
              <span className="font-bold text-on-surface">6-second rotation</span> algorithm. Our
              delivery network guarantees{" "}
              <span className="font-bold text-on-surface">equal distribution</span> across all active
              campaigns.
            </p>
            <div className="flex items-center gap-2 font-label-bold text-secondary">
              <Icon name="verified" className="text-sm" filled />
              No Preferential Treatment Policy
            </div>
          </div>
        </div>
      </PricingSection>

      <PricingSection id="banner-pricing">
        <PricingSectionHeader
          title="Investment Framework"
          description="Scalable solutions for startups to institutional recruiters."
        />
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
          <PricingTable
            title="Medium Banner (3x2)"
            subtitle="Dynamic Grid Placement"
            rows={MEDIUM_BANNER_PRICING}
            bannerType="Medium Banner (3x2)"
            aspect="wide"
          />
          <PricingTable
            title="Vertical Banner (2x5)"
            subtitle="High-Impact Sidebar"
            rows={VERTICAL_BANNER_PRICING}
            bannerType="Vertical Banner (2x5)"
            aspect="tall"
          />
        </div>
      </PricingSection>

      <PricingSection id="banner-placements">
        <PricingSectionHeader
          title="Strategic Placements"
          description="Premium inventory across the highest-traffic surfaces in our recruitment ecosystem."
        />
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {PLACEMENTS.map((placement) => (
            <PricingInfoCard
              key={placement.title}
              icon={placement.icon}
              title={placement.title}
              description={placement.description}
            />
          ))}
        </div>
      </PricingSection>

      <PricingSection variant="muted">
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-2">
          <div>
            <h3 className="mb-8 font-headline-lg text-headline-lg text-on-surface">Ready to Launch?</h3>
            <ul className="mb-10 space-y-4">
              {CREATIVE_REQUIREMENTS.map((req) => (
                <li key={req} className="flex items-center gap-4 text-on-surface-variant">
                  <Icon name="check_circle" className="text-secondary" />
                  <span className="font-body-md text-body-md">{req}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/pricing/checkout?product=banner-advertising&plan=Medium+Banner+%283x2%29+%E2%80%94+30+Days&duration=30+Days&price=10000&aspect=wide"
              className={pricingBtnPrimary}
            >
              Book Your Placement Now
            </Link>
          </div>
          <div className="hidden overflow-hidden rounded-xl border border-outline-variant lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Corporate advertising dashboard"
              className="h-[400px] w-full object-cover opacity-80"
              src={PRICING_BANNER_CTA_IMG}
            />
          </div>
        </div>
      </PricingSection>

      <PricingCtaBand
        title="Need a Custom Campaign?"
        description="Our team can help you design multi-placement packages tailored to your brand goals and recruitment calendar."
        action={
          <Link href="/contact" className={pricingBtnPrimary}>
            Contact Sales
          </Link>
        }
      />
    </div>
  );
}
