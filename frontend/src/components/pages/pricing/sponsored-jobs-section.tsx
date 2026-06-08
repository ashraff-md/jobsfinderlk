"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  PricingCtaBand,
  PricingHero,
  PricingInfoCard,
  PricingSection,
  PricingSectionHeader,
  pricingBtnCard,
  pricingBtnCardDefault,
  pricingBtnCardFeatured,
  pricingBtnPrimary,
  pricingCard,
  pricingFeaturedBadge,
  pricingFeaturedCard,
  pricingPriceAmount,
  pricingPricePrefix,
  pricingShadow,
} from "@/components/pages/pricing/pricing-theme";
import { PRICING_SPONSORED_SOCIAL_IMG } from "@/lib/assets";
import { cn } from "@/lib/utils";

const PLACEMENTS = [
  {
    icon: "home",
    title: "Homepage",
    description: "Prime real estate above the fold for maximum brand authority.",
  },
  {
    icon: "search",
    title: "Search Results",
    description: "Pinned at the top of relevant candidate queries, always relevant.",
  },
  {
    icon: "auto_awesome",
    title: "Similar Jobs",
    description: "Intercept candidates viewing competitor listings instantly.",
  },
  {
    icon: "share",
    title: "Social Push",
    description: "Multi-channel distribution across premium professional networks.",
  },
] as const;

const SPONSORSHIP_TIERS = [
  {
    label: "Short Burst",
    days: "02 Days",
    price: 1000,
    featured: false,
    features: [
      { text: "Homepage Placement", included: true },
      { text: "Search Result Pinned", included: true },
      { text: "Social Media Push", included: false },
    ],
  },
  {
    label: "Standard",
    days: "05 Days",
    price: 2000,
    featured: false,
    features: [
      { text: "Homepage Placement", included: true },
      { text: "Search Result Pinned", included: true },
      { text: "Social Media Push", included: false },
    ],
  },
  {
    label: "Weekly High",
    days: "07 Days",
    price: 3000,
    featured: true,
    badge: "Recommended",
    features: [
      { text: "Homepage Placement", included: true },
      { text: "Search Result Pinned", included: true },
      { text: "Mobile App Notification", included: true },
    ],
  },
  {
    label: "Elite Package",
    days: "14 Days",
    price: 5500,
    featured: false,
    features: [
      { text: "Full Site Sponsorship", included: true, icon: "stars" },
      { text: "Social Media Campaign", included: true, icon: "share", highlight: true },
      { text: "Premium Candidate Filter", included: true },
    ],
  },
  {
    label: "Executive",
    days: "30 Days",
    price: 10000,
    featured: false,
    features: [
      { text: "Full Site Sponsorship", included: true, icon: "stars" },
      { text: "Social Media Campaign", included: true, icon: "share", highlight: true },
      { text: "Dedicated Support", included: true },
    ],
  },
] as const;

const SOCIAL_CHANNELS = [
  { icon: "ads_click", label: "Targeted Facebook Ad Campaigns" },
  { icon: "work", label: "LinkedIn Talent Network Placement" },
  { icon: "photo_camera", label: "Instagram Visual Story Ads" },
] as const;

function checkoutHref(label: string, days: string, price: number) {
  const params = new URLSearchParams({
    product: "sponsored-jobs",
    plan: `${label} (${days})`,
    duration: days,
    price: String(price),
  });
  return `/pricing/checkout?${params.toString()}`;
}

export function SponsoredJobsSection() {
  return (
    <div className="space-y-24">
      <PricingHero
        badge="Premium Visibility"
        title={
          <>
            Elevate Your Vacancy to the <span className="text-secondary">Executive Tier.</span>
          </>
        }
        description="JobsFinder.lk Sponsored Jobs ensure your opportunity is seen by the highest-caliber talent across our entire ecosystem."
        primaryAction={
          <a href="#sponsored-jobs-pricing" className={pricingBtnPrimary}>
            View Pricing
          </a>
        }
        visual={
          <div className="grid grid-cols-2 gap-4">
            {PLACEMENTS.map((placement, index) => (
              <PricingInfoCard
                key={placement.title}
                icon={placement.icon}
                title={placement.title}
                description={placement.description}
                className={cn(index % 2 === 1 && "md:translate-y-8")}
              />
            ))}
          </div>
        }
      />

      <PricingSection id="sponsored-jobs-pricing">
        <PricingSectionHeader
          title="Sponsorship Tiers"
          description="Strategic investment options for various recruitment cycles."
        />
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {SPONSORSHIP_TIERS.map((tier) => (
            <div
              key={tier.days}
              className={cn(
                "group flex flex-col justify-between",
                tier.featured
                  ? cn(pricingFeaturedCard, pricingShadow)
                  : cn(pricingCard, pricingShadow),
              )}
            >
              {tier.featured && "badge" in tier && (
                <div className={pricingFeaturedBadge}>{tier.badge}</div>
              )}
              <div>
                <p className="mb-2 font-label-bold text-label-sm uppercase text-secondary">
                  {tier.label}
                </p>
                <h4 className="mb-4 font-headline-md text-headline-md text-on-surface">{tier.days}</h4>
                <div className="mb-6">
                  <span className={pricingPricePrefix}>LKR </span>
                  <span className={pricingPriceAmount}>
                    {tier.price.toLocaleString("en-LK")}
                  </span>
                  <span className="font-label-sm text-label-sm italic text-on-surface-variant">
                    {" "}
                    / vacancy
                  </span>
                </div>
                <ul className="space-y-3 font-label-sm text-label-sm text-on-surface-variant">
                  {tier.features.map((feature) => (
                    <li
                      key={feature.text}
                      className={cn(
                        "flex items-center gap-2",
                        !feature.included && "opacity-30",
                        "highlight" in feature && feature.highlight && "font-bold text-secondary",
                      )}
                    >
                      <Icon
                        name={
                          feature.included
                            ? ("icon" in feature && feature.icon) || "check_circle"
                            : "block"
                        }
                        className={cn("text-[18px]", feature.included && "text-secondary")}
                      />
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={checkoutHref(tier.label, tier.days, tier.price)}
                className={cn(
                  pricingBtnCard,
                  "mt-8",
                  tier.featured ? pricingBtnCardFeatured : pricingBtnCardDefault,
                )}
              >
                Select Plan
              </Link>
            </div>
          ))}
        </div>
      </PricingSection>

      <PricingSection variant="muted">
        <div className="mx-auto max-w-2xl space-y-stack-md text-center">
          <Icon name="balance" className="text-[48px] text-secondary" />
          <h3 className="font-headline-lg text-headline-lg text-on-surface">
            Our Institutional Fairness Protocol
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We maintain a level playing field for all sponsors through high-frequency algorithmic
            rotation.
          </p>
          <div className="mt-12 grid gap-8 text-left md:grid-cols-2">
            <div className={cn(pricingCard, "flex gap-4 p-6")}>
              <Icon name="timer" className="text-secondary" filled />
              <div>
                <h4 className="mb-1 font-label-bold text-label-bold">3-Second Rotation</h4>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  The &quot;Featured&quot; placement rotates every 3 seconds, ensuring every sponsored
                  post receives identical impression quality over time.
                </p>
              </div>
            </div>
            <div className={cn(pricingCard, "flex gap-4 p-6")}>
              <Icon name="equalizer" className="text-secondary" filled />
              <div>
                <h4 className="mb-1 font-label-bold text-label-bold">Visual Parity</h4>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  No sponsor can purchase larger cards or different colors. We preserve institutional
                  aesthetic standards for all recruiters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PricingSection>

      <PricingSection variant="muted">
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <h3 className="font-headline-lg text-headline-lg text-on-surface">
              Beyond the Platform:{" "}
              <span className="text-secondary">Global Reach Integration</span>
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Our premium sponsorship tiers extend your reach into the walled gardens of professional
              social networks through automated programmatic placement.
            </p>
            <div className="space-y-4">
              {SOCIAL_CHANNELS.map((channel) => (
                <div key={channel.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <Icon name={channel.icon} className="text-[20px]" />
                  </div>
                  <p className="font-label-bold text-label-bold">{channel.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-outline-variant lg:col-span-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Social media promotion across professional networks"
              className="h-full w-full object-cover"
              src={PRICING_SPONSORED_SOCIAL_IMG}
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/70 to-transparent p-8 md:p-12">
              <p className="font-headline-md text-headline-md text-on-primary">
                Reach 50,000+ targeted professionals across Sri Lanka.
              </p>
            </div>
          </div>
        </div>
      </PricingSection>

      <PricingCtaBand
        title="Start Your Institutional Search Today."
        description="Join over 2,000 top companies in Sri Lanka who rely on JobsFinder.lk for their talent acquisition needs."
        action={
          <Link href="/employer/jobs/new" className={pricingBtnPrimary}>
            Sponsor Your Vacancy Now
          </Link>
        }
        footnote="No hidden fees. Instant activation upon verification."
      />
    </div>
  );
}
