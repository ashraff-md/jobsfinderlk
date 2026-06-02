"use client";

import Link from "next/link";
import { useState } from "react";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { Icon } from "@/components/ui/icon";
import { PRICING_TESTIMONIAL_IMG } from "@/lib/assets";
import { cn } from "@/lib/utils";

type PlanTab = "seekers" | "recruiters";

const SEEKER_PLANS = [
  {
    label: "Standard Access",
    name: "Individual Free",
    price: "$0",
    period: "/lifetime",
    features: [
      "Standard Job Applications",
      "Basic Resume Builder",
      "Email Job Alerts",
    ],
    cta: "Start for Free",
    featured: false,
  },
  {
    label: "Accelerated Search",
    name: "Individual Pro",
    price: "$19",
    period: "/month",
    badge: "MOST POPULAR",
    features: [
      { text: "AI Priority Matching", highlight: true },
      "Unlimited AI Mock Interviews",
      "See 'Who Viewed Your Profile'",
      "Direct Message Recruiters",
    ],
    cta: "Get Pro Monthly",
    featured: true,
  },
];

const RECRUITER_PLANS = [
  {
    label: "Growing Teams",
    name: "Business Standard",
    price: "$299",
    period: "/month",
    features: [
      "5 Active Job Postings",
      "AI-Powered Applicant Screening",
      "Basic Analytics Dashboard",
    ],
    cta: "Start Hiring",
    featured: false,
  },
  {
    label: "Full-Stack Recruitment",
    name: "Enterprise Plan",
    price: "Custom",
    period: "/annual",
    badge: "ENTERPRISE SCALE",
    features: [
      { text: "Predictive Candidate Ranking", highlight: true },
      "Unlimited Premium Postings",
      "Custom ATS Integration",
      "Dedicated Success Manager",
    ],
    cta: "Contact Sales",
    featured: true,
  },
];

const AI_FEATURES = [
  {
    icon: "auto_awesome",
    title: "Priority Matching",
    description:
      "Our proprietary neural network analyzes 200+ data points to ensure your application sits at the top of a recruiter's stack.",
  },
  {
    icon: "monitoring",
    title: "Candidate Ranking",
    description:
      "Automated ranking systems that evaluate skills, cultural fit, and potential impact before you even open a resume.",
  },
  {
    icon: "forum",
    title: "AI Interviewer",
    description:
      "Practice with a LLM-trained specialist that adapts to the specific job description and provides instant feedback.",
  },
];

function PlanCard({
  plan,
}: {
  plan: (typeof SEEKER_PLANS)[number] | (typeof RECRUITER_PLANS)[number];
}) {
  if (plan.featured) {
    return (
      <div className="relative z-10 flex scale-105 flex-col rounded-xl bg-primary p-stack-lg text-on-primary shadow-[0_24px_48px_-12px_rgba(13,28,46,0.1)]">
        {"badge" in plan && plan.badge && (
          <div className="absolute -top-4 right-6 rounded-full bg-secondary px-3 py-1 font-label-sm text-label-sm text-on-secondary">
            {plan.badge}
          </div>
        )}
        <div className="mb-stack-lg">
          <span className="font-label-sm text-label-sm uppercase tracking-wider opacity-80">
            {plan.label}
          </span>
          <h3 className="mt-2 font-headline-md text-headline-md">{plan.name}</h3>
          <div className="mt-4">
            <span className="font-headline-xl text-headline-xl">{plan.price}</span>
            <span className="font-label-bold text-label-bold opacity-80">{plan.period}</span>
          </div>
        </div>
        <ul className="mb-10 flex-grow space-y-4">
          {plan.features.map((f) => {
            const text = typeof f === "string" ? f : f.text;
            const highlight = typeof f !== "string" && f.highlight;
            return (
              <li key={text} className="flex items-center gap-3">
                <Icon
                  name={highlight ? "bolt" : "check_circle"}
                  className="text-secondary-fixed"
                  filled={highlight}
                />
                <span className={cn("font-body-md text-body-md", highlight && "font-bold")}>
                  {text}
                </span>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="w-full rounded-lg bg-on-primary py-4 font-label-bold text-label-bold text-primary transition-all hover:opacity-90"
        >
          {plan.cta}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg transition-all hover:border-secondary">
      <div className="mb-stack-lg">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          {plan.label}
        </span>
        <h3 className="mt-2 font-headline-md text-headline-md">{plan.name}</h3>
        <div className="mt-4">
          <span className="font-headline-xl text-headline-xl">{plan.price}</span>
          <span className="font-label-bold text-label-bold text-on-surface-variant">{plan.period}</span>
        </div>
      </div>
      <ul className="mb-10 flex-grow space-y-4">
        {plan.features.map((f) => {
          const text = typeof f === "string" ? f : f.text;
          return (
            <li key={text} className="flex items-center gap-3">
              <Icon name="check_circle" className="text-secondary text-[20px]" />
              <span className="font-body-md text-body-md">{text}</span>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="w-full rounded-lg border border-primary py-4 font-label-bold text-label-bold text-primary transition-colors hover:bg-surface-container-low"
      >
        {plan.cta}
      </button>
    </div>
  );
}

export function PricingPage() {
  const [tab, setTab] = useState<PlanTab>("seekers");
  const plans = tab === "seekers" ? SEEKER_PLANS : RECRUITER_PLANS;

  const toggleActive =
    "rounded-lg bg-surface-container-lowest font-label-bold text-label-bold text-primary shadow-sm";
  const toggleInactive =
    "font-label-bold text-label-bold text-on-surface-variant transition-all hover:bg-surface-container-low";

  return (
    <PublicPageLayout>
      <main className="mx-auto max-w-container-max px-margin-mobile pb-24 pt-32 md:px-margin-desktop">
        <section className="mb-16 text-center">
          <h1 className="mb-4 font-headline-xl text-headline-xl text-primary">
            Precision Pricing for Every Ambition
          </h1>
          <p className="mx-auto max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
            Elevate your professional journey with our AI-driven recruitment ecosystem. From
            high-growth startups to executive job seekers.
          </p>
          <div className="mt-stack-lg inline-flex rounded-xl bg-surface-container p-1">
            <button
              type="button"
              onClick={() => setTab("seekers")}
              className={cn(
                "rounded-lg px-8 py-3 transition-all",
                tab === "seekers" ? toggleActive : toggleInactive,
              )}
            >
              For Job Seekers
            </button>
            <button
              type="button"
              onClick={() => setTab("recruiters")}
              className={cn(
                "rounded-lg px-8 py-3 transition-all",
                tab === "recruiters" ? toggleActive : toggleInactive,
              )}
            >
              For Recruiters
            </button>
          </div>
        </section>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-gutter md:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <section className="mt-32">
          <h2 className="mb-12 text-center font-headline-lg text-headline-lg">
            Next-Generation AI Intelligence
          </h2>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {AI_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-4 rounded-xl bg-surface-container-low p-stack-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Icon name={feature.icon} />
                </div>
                <h4 className="font-headline-md text-headline-md">{feature.title}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mt-32 h-[400px] overflow-hidden rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Recruitment Professional"
            className="absolute inset-0 h-full w-full object-cover opacity-20 grayscale"
            src={PRICING_TESTIMONIAL_IMG}
          />
          <div className="absolute inset-0 flex items-center bg-gradient-to-r from-primary/90 to-transparent px-stack-lg md:px-32">
            <div className="max-w-xl text-on-primary">
              <h2 className="mb-6 font-headline-lg text-headline-lg">Trusted by 15,000+ Leaders</h2>
              <p className="mb-8 font-body-lg text-body-lg opacity-80">
                &quot;JobsFinder.lk cut our hiring time by 40%. The AI ranking is scary-accurate and
                saved our HR team hundreds of manual hours.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary" />
                <div>
                  <p className="font-label-bold text-label-bold">Sarah Chen</p>
                  <p className="text-label-sm opacity-70">Head of Talent, NexaCorp</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {tab === "recruiters" && (
          <p className="mt-8 text-center">
            <Link href="/contact" className="font-label-bold text-label-bold text-secondary hover:underline">
              Contact Sales for enterprise pricing →
            </Link>
          </p>
        )}
      </main>
    </PublicPageLayout>
  );
}
