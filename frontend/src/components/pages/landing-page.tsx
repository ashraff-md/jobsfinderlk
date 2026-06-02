"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FeaturedJobCard } from "@/components/jobs/featured-job-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Icon } from "@/components/ui/icon";
import { JOB_CARD_SLIDES, JOB_SLIDE_INTERVAL_MS } from "@/lib/jobs/featured-jobs";

const MARQUEE_COMPANIES = [
  "DIALOG",
  "WSO2",
  "VIRTUSA",
  "SYSCO LABS",
  "AXIATA",
  "MAS HOLDINGS",
];

const PREMIUM_SECTORS = ["Banking", "Technology", "Manufacturing", "FMCG"];

const JOB_CATEGORIES = [
  { name: "Information Technology", icon: "computer", count: "1,240", href: "/jobs?q=Information+Technology" },
  { name: "Banking & Finance", icon: "account_balance", count: "860", href: "/jobs?category=Finance" },
  { name: "Engineering", icon: "engineering", count: "720", href: "/jobs?q=Engineering" },
  { name: "Marketing", icon: "campaign", count: "540", href: "/jobs?q=Marketing" },
  { name: "Sales", icon: "storefront", count: "680", href: "/jobs?q=Sales" },
  { name: "Healthcare", icon: "medical_services", count: "410", href: "/jobs?q=Healthcare" },
  { name: "Education", icon: "school", count: "320", href: "/jobs?q=Education" },
  { name: "Hospitality", icon: "travel_explore", count: "290", href: "/jobs?q=Hospitality" },
  { name: "Human Resources", icon: "groups", count: "180", href: "/jobs?q=Human+Resources" },
  { name: "Design", icon: "palette", count: "260", href: "/jobs?q=Design" },
  { name: "Operations", icon: "precision_manufacturing", count: "390", href: "/jobs?q=Operations" },
  { name: "Government", icon: "account_balance_wallet", count: "150", href: "/jobs?q=Government" },
] as const;

function animateValue(
  element: HTMLElement,
  start: number,
  end: number,
  duration: number,
  suffix: string,
) {
  let startTimestamp: number | null = null;

  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const val = Math.floor(progress * (end - start) + start);
    element.textContent = `${val.toLocaleString()}${suffix}`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

export function LandingPage() {
  const router = useRouter();
  const [heroQuery, setHeroQuery] = useState("");
  const statsSectionRef = useRef<HTMLElement>(null);

  const submitHeroSearch = () => {
    const q = heroQuery.trim();
    router.push(q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs");
  };
  const statJobsRef = useRef<HTMLDivElement>(null);
  const statCompaniesRef = useRef<HTMLDivElement>(null);
  const statMatchesRef = useRef<HTMLDivElement>(null);
  const statsAnimatedRef = useRef(false);
  const [jobSlide, setJobSlide] = useState(0);
  const [jobCarouselPaused, setJobCarouselPaused] = useState(false);

  useEffect(() => {
    if (jobCarouselPaused) return;

    const timer = window.setInterval(() => {
      setJobSlide((current) => (current + 1) % JOB_CARD_SLIDES.length);
    }, JOB_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [jobCarouselPaused]);

  useEffect(() => {
    const section = statsSectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimatedRef.current) {
            statsAnimatedRef.current = true;
            if (statJobsRef.current) {
              animateValue(statJobsRef.current, 0, 12400, 2500, "+");
            }
            if (statCompaniesRef.current) {
              animateValue(statCompaniesRef.current, 0, 850, 2500, "+");
            }
            if (statMatchesRef.current) {
              animateValue(statMatchesRef.current, 0, 94, 2500, "%");
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface selection:bg-primary/10">
      <PublicHeader />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary px-margin-mobile pb-32 pt-24 text-on-primary md:px-margin-desktop">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl space-y-10 text-center">
            <h1 className="text-[44px] font-headline-xl font-extrabold leading-[1.1] md:text-[64px]">
              The Authority in <br className="hidden md:block" /> Professional{" "}
              <span className="text-secondary-fixed">Recruitment.</span>
            </h1>
            <p className="mx-auto max-w-2xl font-body-lg leading-relaxed text-white/70">
              Connecting skilled professionals with verified employers through a modern, trusted,
              and efficient hiring platform.
            </p>
            <form
              className="relative mx-auto mt-12 max-w-3xl"
              onSubmit={(e) => {
                e.preventDefault();
                submitHeroSearch();
              }}
            >
              <div className="flex items-center rounded-xl border border-white/20 bg-white p-2 shadow-2xl">
                <Icon name="search" className="ml-4 text-primary/40" />
                <input
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  className="flex-grow border-none bg-transparent px-4 font-body-md text-on-surface placeholder:text-outline/60 focus:ring-0"
                  placeholder="Search by role, company, or expertise..."
                  type="search"
                  aria-label="Search jobs"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-primary px-10 py-4 font-label-bold text-on-primary transition-all hover:bg-primary/90"
                >
                  <span>Discover Matches</span>
                  <Icon name="auto_awesome" className="text-[18px]" />
                </button>
              </div>
            </form>
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              <span className="font-label-bold text-white/40">Premium Sectors:</span>
              {PREMIUM_SECTORS.map((sector) => (
                <Link
                  key={sector}
                  href="/jobs"
                  className="border-b border-white/20 pb-0.5 text-white/80 transition-colors hover:text-white"
                >
                  {sector}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Vacancies */}
        <section className="w-full bg-background px-margin-mobile py-24 md:px-margin-desktop">
          <div className="mx-auto max-w-container-max">
            <div className="mb-16 flex flex-col items-baseline justify-between gap-4 md:flex-row">
              <div className="space-y-2">
                <h2 className="font-headline-xl text-primary">
                  High-Caliber <span className="text-secondary">Opportunities</span>
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Curated roles for established professionals.
                </p>
              </div>
              <Link
                href="/jobs"
                className="flex items-center gap-2 font-label-bold text-primary hover:underline"
              >
                Explore all executive roles
                <Icon name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>

            <div
              onMouseEnter={() => setJobCarouselPaused(true)}
              onMouseLeave={() => setJobCarouselPaused(false)}
            >
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${jobSlide * 100}%)` }}
              >
                {JOB_CARD_SLIDES.map((slide, slideIndex) => (
                  <div
                    key={slideIndex}
                    className="grid w-full shrink-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    {slide.map((job) => (
                      <FeaturedJobCard key={`${job.title}-${job.company}`} job={job} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Previous jobs"
                onClick={() =>
                  setJobSlide(
                    (current) => (current - 1 + JOB_CARD_SLIDES.length) % JOB_CARD_SLIDES.length,
                  )
                }
                className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant transition-all hover:border-primary hover:bg-primary hover:text-on-primary"
              >
                <Icon name="chevron_left" />
              </button>
              <div className="flex items-center gap-2">
                {JOB_CARD_SLIDES.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={jobSlide === index ? "true" : undefined}
                    onClick={() => setJobSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      jobSlide === index ? "w-8 bg-primary" : "w-2.5 bg-outline-variant/60 hover:bg-primary/40"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Next jobs"
                onClick={() => setJobSlide((current) => (current + 1) % JOB_CARD_SLIDES.length)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant transition-all hover:border-primary hover:bg-primary hover:text-on-primary"
              >
                <Icon name="chevron_right" />
              </button>
            </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="w-full bg-surface-container-low px-margin-mobile py-24 md:px-margin-desktop">
          <div className="mx-auto max-w-container-max">
            <div className="mb-12 flex flex-col items-baseline justify-between gap-4 md:flex-row">
              <div className="space-y-2">
                <h2 className="font-headline-xl text-primary">
                  Browse by <span className="text-secondary">Category</span>
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Explore opportunities across every major industry and profession.
                </p>
              </div>
              <Link
                href="/jobs"
                className="flex items-center gap-2 font-label-bold text-primary hover:underline"
              >
                View all categories
                <Icon name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {JOB_CATEGORIES.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group flex flex-col items-center rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-5 text-center transition-all hover:border-primary hover:shadow-sm"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                    <Icon name={category.icon} className="text-2xl" />
                  </div>
                  <h3 className="mb-1 text-sm font-bold leading-snug text-primary">{category.name}</h3>
                  <p className="text-[11px] font-label-bold text-on-surface-variant">
                    {category.count}+ jobs
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Logo Marquee */}
        <section className="border-y border-outline-variant/30 bg-surface-container-lowest py-16">
          <div className="mx-auto mb-10 max-w-container-max px-margin-mobile text-center md:mb-12 md:px-margin-desktop">
            <h2 className="font-headline-xl text-primary">
              Trusted by <span className="text-secondary">Leading Employers</span>
            </h2>
            <p className="mt-2 font-body-md text-on-surface-variant">
              Organizations across Sri Lanka hire exceptional talent on JobsFinder.lk
            </p>
          </div>
          <div className="marquee">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1}
                className="marquee-content"
              >
                {MARQUEE_COMPANIES.map((name) => (
                  <div
                    key={`${copy}-${name}`}
                    className="flex cursor-default items-center gap-3 opacity-40 transition-all hover:opacity-100"
                  >
                    <span className="text-xl font-extrabold tracking-tighter text-primary">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Industry Framework */}
        <section className="w-full bg-background px-margin-mobile py-24 md:px-margin-desktop">
          <div className="mx-auto max-w-container-max">
            <div className="mb-20 space-y-4 text-center">
              <h2 className="font-headline-xl text-primary">
                Strategic <span className="text-secondary">Ecosystems</span>
              </h2>
              <p className="mx-auto max-w-2xl font-body-md text-on-surface-variant">
                Precision-targeted talent acquisition across fundamental growth sectors.
              </p>
            </div>
            <div className="grid h-auto grid-cols-1 gap-8 md:h-[500px] md:grid-cols-12">
              <div className="group relative executive-shadow cursor-pointer overflow-hidden rounded-xl bg-primary p-12 text-on-primary md:col-span-7">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Professional workstation"
                  className="absolute inset-0 h-full w-full object-cover opacity-20 transition-transform duration-1000 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRYq9D7y8isAmQf4a_-bA1wy61pxxx-Qk1C4sUyF0HqT8zB-aIfwEpFJI2Mo53hN2tjYltcqh-LCry9krgWU5DxEXpgMEVQOUNpX3LzpBT-jVSgPRGzqaS5cNnZuzxrGnesQTQ0Y8ldIHOTMZyqbNVpPyUivdV5dLN8ZBQEJhfKKGb1l8oiffgDN_yraSX_TKdhJL8ix4v144m1b5-xEYiajHG4zHMplU_rFkOXJCeFsFl0FkpBLMry-G7nBTsnwm8HPDOx7feH8o1"
                />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="max-w-md space-y-6">
                    <Icon name="terminal" className="text-5xl text-secondary-fixed" />
                    <h3 className="text-headline-lg font-headline-xl font-extrabold tracking-tight">
                      Information & Global Technology
                    </h3>
                    <p className="font-body-lg text-white/70">
                      Powering the next decade of digital innovation with the world&apos;s most
                      capable engineers and visionary tech leaders.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 font-label-bold text-secondary-fixed">
                    <span>Explore Tech Portfolio</span>
                    <Icon name="north_east" />
                  </div>
                </div>
              </div>
              <div className="grid grid-rows-2 gap-8 md:col-span-5">
                <div className="group flex cursor-pointer flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 transition-all hover:border-primary">
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/5 text-primary">
                      <Icon name="account_balance" className="text-3xl" />
                    </div>
                    <span className="text-sm font-label-bold text-primary/40">450+ Active Briefs</span>
                  </div>
                  <div>
                    <h3 className="mb-2 font-headline-md text-primary">
                      Banking & Financial Services
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      Institutional banking, Fintech, and Investment management.
                    </p>
                  </div>
                </div>
                <div className="group flex cursor-pointer flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 transition-all hover:border-primary">
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/5 text-primary">
                      <Icon name="medical_services" className="text-3xl" />
                    </div>
                    <span className="text-sm font-label-bold text-primary/40">180+ Active Briefs</span>
                  </div>
                  <div>
                    <h3 className="mb-2 font-headline-md text-primary">
                      Healthcare & Life Sciences
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      Senior medical leadership and pharmaceutical excellence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authority Stats */}
        <section
          ref={statsSectionRef}
          className="w-full bg-surface-container-low px-margin-mobile py-24 md:px-margin-desktop"
        >
          <div className="relative mx-auto max-w-container-max overflow-hidden rounded-xl bg-primary p-16 text-center text-on-primary shadow-2xl md:p-24">
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)",
                  backgroundPosition: "0 0, 15px 15px",
                  backgroundSize: "30px 30px",
                }}
              />
            </div>
            <div className="relative z-10 grid grid-cols-1 gap-16 md:grid-cols-3">
              <div className="space-y-4">
                <div
                  ref={statJobsRef}
                  className="text-[64px] font-extrabold leading-none tracking-tighter"
                >
                  0+
                </div>
                <div className="text-xs font-label-bold uppercase tracking-widest text-white/60">
                  Vetted Executive Roles
                </div>
              </div>
              <div className="space-y-4">
                <div
                  ref={statCompaniesRef}
                  className="text-[64px] font-extrabold leading-none tracking-tighter text-secondary-fixed"
                >
                  0+
                </div>
                <div className="text-xs font-label-bold uppercase tracking-widest text-white/60">
                  Partner Organizations
                </div>
              </div>
              <div className="space-y-4">
                <div
                  ref={statMatchesRef}
                  className="text-[64px] font-extrabold leading-none tracking-tighter"
                >
                  0%
                </div>
                <div className="text-xs font-label-bold uppercase tracking-widest text-white/60">
                  Placement Success Rate
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full bg-surface-container-lowest px-margin-mobile py-32 md:px-margin-desktop">
          <div className="mx-auto flex max-w-container-max flex-col items-center gap-24 md:flex-row">
            <div className="w-full space-y-10 md:w-1/2">
              <h2 className="font-headline-xl text-primary">
                Executive <span className="text-secondary">Endorsements</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-1 text-secondary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} name="star" filled />
                  ))}
                </div>
                <blockquote className="text-[22px] font-body-lg font-medium italic leading-relaxed text-primary/90">
                  &ldquo;JobsFinder.lk provided a level of insight and professional alignment
                  I&apos;ve never encountered in traditional search firms. Within weeks, I was
                  matched with a role that perfectly fits my strategic vision.&rdquo;
                </blockquote>
                <div className="flex items-center gap-5 pt-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Kasun Perera"
                    className="h-16 w-16 rounded-lg border border-outline-variant object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbsYcO0H0VO2jFbb-2ckLEyv98zdf39owwapyY3lbCq8KWXIVY9sQIBxRjEBdaKe3KhI1DZCLnEKKPGx3aqS6A87qQZMAhmDnoLXJFmnlnguVlxX0kF99vJnvOjuwTmmhxxty_t3SVWCGQvCPMowLg4hubKa7YqEJ3dnQ5gCgl0qe-K3huYsD36VfJwebRzRjk-caRQYWifAK-vdX1FDVCm_gtr2UWMP2zCObq_FtvLXe8X1-z45TsgvtYJd8ChDgmIYQwlgjzJmx8"
                  />
                  <div>
                    <div className="text-lg font-extrabold text-primary">Kasun Perera</div>
                    <div className="text-xs font-label-bold uppercase tracking-wider text-on-surface-variant">
                      Managing Director, APAC Region
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-10">
                <button
                  type="button"
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-outline-variant transition-all hover:border-primary hover:bg-primary hover:text-on-primary"
                >
                  <Icon name="chevron_left" />
                </button>
                <button
                  type="button"
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-outline-variant transition-all hover:border-primary hover:bg-primary hover:text-on-primary"
                >
                  <Icon name="chevron_right" />
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 -z-10 translate-x-4 translate-y-4 rounded-xl bg-primary" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Leadership team"
                  className="executive-shadow w-full rounded-xl border-8 border-white"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXhmIhSCxBCrkXfc3zFQinGJpSP8w4TuLvu5C2pHCJpJBzfKDTWA1VS-vXoJNTyJma69HQTsyAhVa5oCM8d07xZZtYU4jrDTQzOHZqHVcwNKR39WXq2mh6cYg7FOC14jdSllj7xL0bHGvrbyVp3_9U7rxQcdYaLpKrc060JpbAxvrF4eXqn0uJG0BcYiROsTzbt0hup3-UP8ZuYkXjcgbmot0X-_yqGN1fqfnIl8DlTWMNsV7RU2zbKgqevhWg4beqDBeU3HCxxzhv"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full bg-background px-margin-mobile py-24 md:px-margin-desktop">
          <div className="mx-auto max-w-4xl space-y-12 text-center">
            <h2 className="text-4xl font-headline-xl text-primary md:text-5xl">
              Define Your Professional Future.
            </h2>
            <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
              Whether seeking your next leadership milestone or building an elite team, partner with
              the authorities in talent matching.
            </p>
            <div className="flex flex-col justify-center gap-6 pt-6 md:flex-row">
              <Link
                href="/auth/sign-up"
                className="rounded-lg bg-primary px-12 py-5 font-extrabold text-on-primary shadow-xl transition-all hover:-translate-y-1 hover:bg-primary/90"
              >
                Apply for Membership
              </Link>
              <Link
                href="/employer"
                className="rounded-lg border border-outline-variant bg-surface-container-lowest px-12 py-5 font-extrabold text-primary transition-all hover:bg-surface-container-low"
              >
                Request Executive Search
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter variant="light" />
    </div>
  );
}
