"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { getAccessToken, getStoredUser } from "@/lib/api/auth";
import type { UserRole } from "@/lib/api/types";
import { freePlanCta } from "@/lib/employer/free-plan-cta";
import {
  PricingCtaBand,
  PricingHero,
  PricingSection,
  PricingSectionHeader,
  pricingBtnCard,
  pricingBtnCardDefault,
  pricingBtnCardFeatured,
  pricingBtnOutline,
  pricingBtnPrimary,
  pricingCard,
  pricingFeaturedBadge,
  pricingFeaturedCard,
  pricingPriceAmount,
  pricingPricePrefix,
  pricingShadow,
} from "@/components/pages/pricing/pricing-theme";
import { PRICING_JOB_LISTINGS_HERO_IMG } from "@/lib/assets";
import { cn } from "@/lib/utils";

const PACKAGES = [
  {
    name: "Professional Duo",
    slots: "2 Active Job Slots",
    featured: false,
    price: 1500,
    features: ["Premium Visibility", "Applicant Tracking", "Social Media Blast"],
  },
  {
    name: "Growth Suite",
    slots: "5 Active Job Slots",
    featured: true,
    badge: "MOST POPULAR",
    price: 3500,
    features: ["Featured Listing Status", "Enhanced Analytics", "Email Alert Priority"],
  },
  {
    name: "Expansion Plan",
    slots: "10 Active Job Slots",
    featured: false,
    price: 6500,
    features: ["Bulk Slot Discount", "Candidate CRM Tools", "Dedicated Support"],
  },
  {
    name: "Institutional",
    slots: "20 Active Job Slots",
    featured: false,
    price: 12000,
    features: ["Enterprise Dashboard", "Employer Branding Kit", "Priority Search Match"],
  },
] as const;

function formatLkr(amount: number) {
  return amount.toLocaleString("en-LK");
}

function checkoutHref(name: string, price: number) {
  const params = new URLSearchParams({
    product: "job-listings",
    plan: name,
    price: String(price),
  });
  return `/pricing/checkout?${params.toString()}`;
}

export function JobListingsSection() {
  const [freePlanAction, setFreePlanAction] = useState(() =>
    freePlanCta(false, null),
  );

  useEffect(() => {
    const isLoggedIn = Boolean(getAccessToken() && getStoredUser());
    const role = (getStoredUser()?.role ?? null) as UserRole | null;
    setFreePlanAction(freePlanCta(isLoggedIn, role));
  }, []);

  return (
    <div className="space-y-24">
      <PricingHero
        badge="Recruitment Excellence"
        title="Scale Your Executive Team with Precision."
        description="From high-volume operational roles to specialized leadership headhunting, our listing tiers are designed to match your recruitment velocity with institutional-grade tools."
        primaryAction={
          <a href="#job-listings-pricing" className={pricingBtnPrimary}>
            View Pricing Packages
          </a>
        }
        secondaryAction={
          <a href="#job-listings-free" className={pricingBtnOutline}>
            Start Free Trial
          </a>
        }
        visual={
          <>
            <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Executive recruitment workspace"
              className="relative z-10 aspect-video w-full rounded-xl border border-outline-variant object-cover"
              src={PRICING_JOB_LISTINGS_HERO_IMG}
            />
          </>
        }
      />

      <PricingSection id="job-listings-pricing">
        <PricingSectionHeader
          title="Strategic Listing Packages"
          description="Select the volume that best aligns with your hiring cycle. All premium packages include featured placement and enhanced analytics."
        />

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((pkg) => {
            const content = (
              <>
                {pkg.featured && "badge" in pkg && (
                  <div className={pricingFeaturedBadge}>{pkg.badge}</div>
                )}
                <div className="mb-6">
                  <h4 className="font-headline-md text-headline-md text-on-surface">{pkg.name}</h4>
                  <p className="font-label-bold text-label-sm text-on-surface-variant">{pkg.slots}</p>
                </div>
                <div className="mb-8">
                  <span className={pricingPricePrefix}>LKR </span>
                  <span className={pricingPriceAmount}>{formatLkr(pkg.price)}</span>
                </div>
                <ul className="mb-10 flex-grow space-y-4">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Icon name="check_circle" className="text-[20px] text-secondary" />
                      <span className="font-body-md text-on-surface-variant">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={checkoutHref(pkg.name, pkg.price)}
                  className={cn(
                    pricingBtnCard,
                    pkg.featured ? pricingBtnCardFeatured : pricingBtnCardDefault,
                  )}
                >
                  {pkg.featured ? "Purchase Now" : "Buy Now"}
                </Link>
              </>
            );

            return (
              <div
                key={pkg.name}
                className={cn(
                  "flex flex-col",
                  pkg.featured ? cn(pricingFeaturedCard, pricingShadow) : cn(pricingCard, pricingShadow),
                )}
              >
                {content}
              </div>
            );
          })}
        </div>
      </PricingSection>

      <PricingSection id="job-listings-free" variant="muted">
        <div className="flex flex-col items-center justify-between gap-12 md:flex-row">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="mb-4 font-headline-lg text-headline-lg text-on-surface">
              Experience the Interface.
            </h3>
            <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
              Our Entry Tier allows you to experience the platform&apos;s efficiency without immediate
              commitment. Perfect for single, non-urgent vacancies.
            </p>
            <div className="flex flex-wrap justify-center gap-6 md:justify-start">
              <div className="flex items-center gap-2">
                <Icon name="bolt" className="text-on-surface-variant" />
                <span className="font-label-bold text-label-bold">1 Active Job</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="calendar_today" className="text-on-surface-variant" />
                <span className="font-label-bold text-label-bold">7 Days Listing</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="visibility" className="text-on-surface-variant" />
                <span className="font-label-bold text-label-bold">Standard Visibility</span>
              </div>
            </div>
          </div>
          <div>
            <Link href={freePlanAction.href} className={pricingBtnPrimary}>
              {freePlanAction.label}
            </Link>
            <p className="mt-3 text-center font-label-sm text-on-surface-variant">
              No credit card required.
            </p>
          </div>
        </div>
      </PricingSection>

      <PricingCtaBand
        title="Volume Hiring for Scale-ups."
        description="Managing over 20 vacancies? Our Enterprise Solutions provide custom API integrations, white-labeled candidate portals, and dedicated account management for high-velocity talent acquisition."
        action={
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className={pricingBtnPrimary}>
              Contact Sales
            </Link>
            <button type="button" className={pricingBtnOutline}>
              Enterprise One-Sheet
            </button>
          </div>
        }
      />
    </div>
  );
}
