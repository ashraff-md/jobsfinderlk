"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LifeAtCompanyGallery } from "@/components/companies/life-at-company-gallery";
import {
  CompanySectionTitle,
  CompanySidebarTitle,
} from "@/components/companies/company-section-title";
import { HomeBannerAdsGrid } from "@/components/home/home-banner-ads-grid";
import { PublicHeader } from "@/components/layout/public-header";
import { Icon } from "@/components/ui/icon";
import { formatSalary } from "@/lib/api/jobs";
import type { CompanyDetail } from "@/lib/api/types";
import { formatCompanyHeadquarters } from "@/lib/companies/format-headquarters";

type CompanyProfilePageProps = {
  company: CompanyDetail;
};

const NAV_SECTIONS = [
  { id: "about", label: "About" },
  { id: "life", label: "Life at Company" },
  { id: "openings", label: "Current Openings" },
] as const;

function companyHeadline(company: CompanyDetail) {
  const industry = company.industry ?? company.companyType;
  const location = formatCompanyHeadquarters(company);
  const shortLocation =
    location !== "—"
      ? location.split(",").slice(-2).join(",").trim() || location
      : company.city ?? company.location ?? null;
  if (industry && shortLocation && shortLocation !== "—") return `${industry} · ${shortLocation}`;
  return industry ?? shortLocation ?? "Verified employer on JobsFinder.lk";
}

function jobLocationLabel(job: CompanyDetail["jobs"][number]) {
  return job.location ?? job.city ?? "Sri Lanka";
}

function formatWebsiteHref(website: string) {
  return /^https?:\/\//i.test(website) ? website : `https://${website.replace(/^\/+/, "")}`;
}

export function CompanyProfilePage({ company }: CompanyProfilePageProps) {
  const companyName = company.name;
  const [activeSection, setActiveSection] = useState<(typeof NAV_SECTIONS)[number]["id"]>("about");

  const coverImage = company.lifeAtCompanyImages?.[0] ?? null;
  const lifeImages = company.lifeAtCompanyImages ?? [];
  const openRoles = company._count?.jobs ?? company.jobs.length;
  const jobsSearchHref = `/jobs?q=${encodeURIComponent(company.name)}`;

  const navSections = useMemo(() => {
    const sections = [...NAV_SECTIONS];
    if (lifeImages.length === 0) {
      return sections.filter((section) => section.id !== "life");
    }
    return sections;
  }, [lifeImages.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) setActiveSection(id as (typeof NAV_SECTIONS)[number]["id"]);
          }
        });
      },
      { rootMargin: "-150px 0px -70% 0px", threshold: 0 },
    );

    navSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navSections]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <PublicHeader />

      <main>
        <section className="relative h-[400px] w-full overflow-hidden">
          {coverImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              alt={`${companyName} workplace`}
              className="h-full w-full object-cover"
              src={coverImage}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-secondary/80">
              {company.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  alt={`${companyName} logo`}
                  className="max-h-32 max-w-[240px] object-contain opacity-90"
                  src={company.logoUrl}
                />
              ) : (
                <Icon name="corporate_fare" className="text-8xl text-on-primary/40" />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full">
            <div className="mx-auto flex max-w-container-max flex-col items-start gap-stack-lg px-margin-mobile pb-stack-lg md:flex-row md:items-end md:px-margin-desktop">
              <div className="-mb-12 rounded-lg border border-outline-variant bg-surface-container-lowest p-2 shadow-xl">
                {company.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    alt={`${companyName} logo`}
                    className="h-32 w-32 rounded bg-white object-contain"
                    src={company.logoUrl}
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded bg-surface-container-low text-4xl font-bold text-primary">
                    {companyName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 pb-4 md:pt-0">
                {company.verified ? (
                  <p className="mb-2 font-label-bold text-[11px] uppercase tracking-[0.2em] text-on-primary/70">
                    Verified employer
                  </p>
                ) : null}
                <div className="mb-1 flex flex-wrap items-center gap-stack-sm">
                  <h1 className="text-3xl font-extrabold tracking-tight text-on-primary drop-shadow-sm md:text-4xl lg:text-[44px] lg:leading-[1.1]">
                    {companyName}
                  </h1>
                  {company.verified && (
                    <Icon
                      name="verified"
                      className="text-[22px] text-secondary drop-shadow-sm"
                      filled
                    />
                  )}
                </div>
                <p className="max-w-2xl font-body-lg text-body-lg text-primary-fixed-dim/95">
                  {companyHeadline(company)}
                </p>
                <p className="mt-3 inline-flex items-center rounded-full bg-on-primary/15 px-3 py-1 font-label-bold text-label-sm text-on-primary backdrop-blur-sm">
                  {openRoles} open role{openRoles === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-container-max grid-cols-12 gap-gutter px-margin-mobile pb-16 pt-8 md:px-margin-desktop md:pt-10">
          <aside className="col-span-12 space-y-stack-lg lg:col-span-3">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md">
              <nav className="space-y-1">
                {navSections.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={
                      activeSection === id
                        ? "block rounded-lg bg-secondary px-4 py-3 font-label-bold text-label-bold text-on-secondary transition-all"
                        : "block rounded-lg px-4 py-3 font-label-bold text-label-bold text-on-surface-variant transition-all hover:bg-surface-container-low"
                    }
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md">
              <CompanySidebarTitle title="Company Details" />
              <div className="space-y-4">
                <div>
                  <p className="mb-0.5 font-label-sm text-label-sm text-outline">Website</p>
                  {company.website ? (
                    <a
                      href={formatWebsiteHref(company.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-label-bold text-label-bold text-secondary hover:underline"
                    >
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <p className="font-body-md text-body-md text-on-surface-variant">—</p>
                  )}
                </div>
                <div>
                  <p className="mb-0.5 font-label-sm text-label-sm text-outline">Industry</p>
                  <p className="font-body-md text-body-md text-on-surface">
                    {company.industry ?? company.companyType ?? "—"}
                  </p>
                </div>
                {company.companyType ? (
                  <div>
                    <p className="mb-0.5 font-label-sm text-label-sm text-outline">Organization type</p>
                    <p className="font-body-md text-body-md text-on-surface">{company.companyType}</p>
                  </div>
                ) : null}
                <div>
                  <p className="mb-0.5 font-label-sm text-label-sm text-outline">Headquarters</p>
                  <p className="font-body-md text-body-md text-on-surface">
                    {formatCompanyHeadquarters(company)}
                  </p>
                </div>
              </div>
            </div>

            <HomeBannerAdsGrid variant="tall" columns={1} className="w-full" />
          </aside>

          <div className="col-span-12 space-y-12 lg:col-span-9">
            <section id="about">
              <CompanySectionTitle
                eyebrow="Overview"
                title={`About ${companyName}`}
                compact
              />
              <div className="space-y-4 whitespace-pre-wrap font-body-md text-body-md leading-relaxed text-on-surface-variant">
                <p>
                  {company.description?.trim() ||
                    `${companyName} is a verified employer on JobsFinder.lk.`}
                </p>
              </div>
            </section>

            {lifeImages.length > 0 ? (
              <section id="life">
                <CompanySectionTitle
                  eyebrow="Culture & workplace"
                  title={`Life at ${companyName}`}
                />
                <LifeAtCompanyGallery images={lifeImages} companyName={companyName} />
              </section>
            ) : null}

            <section id="openings">
              <CompanySectionTitle
                eyebrow="Careers"
                title="Current Openings"
                action={
                  company.jobs.length > 0 ? (
                    <Link
                      href={jobsSearchHref}
                      className="flex items-center gap-1 font-label-bold text-label-bold text-secondary hover:underline"
                    >
                      View All <Icon name="arrow_forward" />
                    </Link>
                  ) : undefined
                }
              />
              <div className="space-y-stack-md">
                {company.jobs.length === 0 && (
                  <div className="rounded-xl border border-outline-variant bg-surface-container-low p-stack-md text-on-surface-variant">
                    <p>No open roles at the moment.</p>
                    <Link href="/jobs" className="mt-3 inline-flex font-label-bold text-secondary hover:underline">
                      Browse other opportunities
                    </Link>
                  </div>
                )}
                {company.jobs.map((job) => (
                  <div
                    key={job.slug}
                    className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md transition-all hover:shadow-lg"
                  >
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <Link href={`/jobs/${job.slug}`}>
                          <h4 className="mb-1 text-xl font-extrabold tracking-tight text-navy-deep transition-colors group-hover:text-secondary md:text-2xl">
                            {job.title}
                          </h4>
                        </Link>
                        <div className="flex flex-wrap gap-4">
                          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                            <Icon name="location_on" className="text-[16px]" />
                            {jobLocationLabel(job)}
                          </span>
                          {job.employmentType ? (
                            <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                              <Icon name="schedule" className="text-[16px]" />
                              {job.employmentType}
                            </span>
                          ) : null}
                          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                            <Icon name="payments" className="text-[16px]" />
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="shrink-0 rounded bg-primary px-6 py-2 font-label-bold text-label-bold text-on-primary transition-all hover:opacity-90"
                      >
                        View Job
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <HomeBannerAdsGrid columns={2} className="w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}
