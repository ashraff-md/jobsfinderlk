"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HomeBannerAdsGrid } from "@/components/home/home-banner-ads-grid";
import { JobSearchFiltersSidebar } from "@/components/jobs/job-search-filters-sidebar";
import { JobSearchResultCard } from "@/components/jobs/job-search-result-card";
import { SavedJobsProvider } from "@/components/jobs/saved-jobs-provider";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { Icon } from "@/components/ui/icon";
import { formatSalary, searchJobs } from "@/lib/api/jobs";
import type { Job } from "@/lib/api/types";
import { INTERNSHIPS_HERO_IMG } from "@/lib/assets";
import { formatJobClosingDate } from "@/lib/jobs/application-deadline";
import {
  filterJobsByInternshipDuration,
  INTERNSHIP_DURATION_OPTIONS,
  type InternshipDuration,
} from "@/lib/jobs/internship-filters";
import {
  getJobEmployerLogo,
  getJobEmployerName,
  getJobLocationLabel,
} from "@/lib/jobs/job-employer-name";
import {
  buildJobSearchParams,
  DEFAULT_JOB_SEARCH_FILTERS,
  type JobSearchFilters,
} from "@/lib/jobs/job-search-filters";

type InternshipsPageProps = {
  initialJobs: Job[];
  initialFeatured: Job | null;
};

const INTERNSHIP_FILTERS_DEFAULT: JobSearchFilters = {
  ...DEFAULT_JOB_SEARCH_FILTERS,
  employmentType: "Internship",
};

function sidebarFilterFields(filters: JobSearchFilters): Omit<JobSearchFilters, "q"> {
  const { q: _q, ...rest } = filters;
  return rest;
}

function hasActiveSearchOrFilters(
  q: string,
  duration: InternshipDuration,
  filters: JobSearchFilters,
): boolean {
  if (q.trim()) return true;
  if (duration !== "all") return true;
  const applied = sidebarFilterFields(filters);
  return (Object.keys(applied) as (keyof typeof applied)[]).some((key) => {
    const value = applied[key];
    if (key === "employmentType") return false;
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  });
}

function FeaturedInternshipCard({ job }: { job: Job }) {
  const employerName = getJobEmployerName(job);
  const employerLogo = getJobEmployerLogo(job);
  const location = getJobLocationLabel(job);
  const tags = [job.category, job.workArrangement, job.experienceLevel].filter(
    Boolean,
  ) as string[];

  return (
    <div className="group flex flex-col items-start gap-8 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 transition-all hover:border-secondary lg:flex-row">
      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container">
        {employerLogo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img alt="" className="h-16 w-16 rounded-md object-contain" src={employerLogo} />
        ) : (
          <span className="text-2xl font-bold text-primary">{employerName.charAt(0)}</span>
        )}
      </div>
      <div className="flex-1">
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-secondary-container px-3 py-1 font-label-sm text-label-sm text-on-secondary-container"
            >
              {tag}
            </span>
          ))}
          <span className="rounded bg-surface-container-highest px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
            Internship
          </span>
        </div>
        <h3 className="mb-2 font-headline-md text-headline-md text-primary">{job.title}</h3>
        <p className="mb-6 max-w-3xl font-body-md text-body-md text-on-surface-variant">
          {job.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 280) ||
            `Join ${employerName} for hands-on experience and mentorship in a professional environment.`}
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-outline">
            <Icon name="location_on" className="text-[20px]" />
            <span className="font-label-bold text-label-bold">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-outline">
            <Icon name="payments" className="text-[20px]" />
            <span className="font-label-bold text-label-bold">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
          </div>
          {job.applicationDeadline ? (
            <div className="flex items-center gap-2 text-outline">
              <Icon name="event" className="text-[20px]" />
              <span className="font-label-bold text-label-bold">
                Closes {formatJobClosingDate(job.applicationDeadline)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex w-full flex-col gap-3 lg:w-auto">
        <Link
          href={`/jobs/${job.slug}`}
          className="whitespace-nowrap rounded-lg bg-primary px-8 py-3 text-center font-label-bold text-label-bold text-on-primary transition-opacity hover:opacity-90"
        >
          Apply Now
        </Link>
        <div className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-8 py-3 font-label-bold text-label-bold text-on-surface transition-all hover:bg-surface-container">
          <SaveJobButton
            jobId={job.id}
            jobSlug={job.slug}
            showBorder={false}
            className="p-0 hover:bg-transparent"
          />
          <span>Save for Later</span>
        </div>
      </div>
    </div>
  );
}

export function InternshipsPage({ initialJobs, initialFeatured }: InternshipsPageProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [featured, setFeatured] = useState<Job | null>(initialFeatured);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [durationFilter, setDurationFilter] = useState<InternshipDuration>("all");
  const [filters, setFilters] = useState<JobSearchFilters>(INTERNSHIP_FILTERS_DEFAULT);
  const [draftFilters, setDraftFilters] = useState<JobSearchFilters>(INTERNSHIP_FILTERS_DEFAULT);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const searchParams = useMemo(
    () =>
      buildJobSearchParams(
        { ...filters, q: debouncedSearch, employmentType: "Internship" },
        { limit: 24 },
      ),
    [filters, debouncedSearch],
  );

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const [featuredRes, listRes] = await Promise.all([
        searchJobs({
          ...searchParams,
          featured: true,
          limit: 1,
        }),
        searchJobs(searchParams),
      ]);

      let nextFeatured = featuredRes.items[0] ?? listRes.items[0] ?? null;
      let listJobs = listRes.items.filter((job) => job.id !== nextFeatured?.id);

      if (durationFilter !== "all") {
        if (nextFeatured && !filterJobsByInternshipDuration([nextFeatured], durationFilter).length) {
          nextFeatured = null;
        }
        listJobs = filterJobsByInternshipDuration(listJobs, durationFilter);
      }

      setFeatured(nextFeatured);
      setJobs(listJobs);
    } catch {
      setFeatured(null);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [durationFilter, searchParams]);

  const isFiltered = useMemo(
    () => hasActiveSearchOrFilters(debouncedSearch, durationFilter, filters),
    [debouncedSearch, durationFilter, filters],
  );

  useEffect(() => {
    if (!isFiltered) {
      let nextFeatured = initialFeatured;
      let nextJobs = initialJobs;
      if (durationFilter !== "all") {
        if (nextFeatured && !filterJobsByInternshipDuration([nextFeatured], durationFilter).length) {
          nextFeatured = null;
        }
        nextJobs = filterJobsByInternshipDuration(nextJobs, durationFilter);
      }
      setFeatured(nextFeatured);
      setJobs(nextJobs);
      return;
    }
    void loadJobs();
  }, [durationFilter, initialFeatured, initialJobs, isFiltered, loadJobs]);

  const patchDraftFilters = useCallback((patch: Partial<JobSearchFilters>) => {
    setDraftFilters((prev) => ({ ...prev, ...patch, employmentType: "Internship" }));
  }, []);

  const applyFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      ...sidebarFilterFields(draftFilters),
      employmentType: "Internship",
    }));
  }, [draftFilters]);

  const resetFilters = useCallback(() => {
    setFilters(INTERNSHIP_FILTERS_DEFAULT);
    setDraftFilters(INTERNSHIP_FILTERS_DEFAULT);
    setSearchQuery("");
    setDurationFilter("all");
  }, []);

  const hasUnappliedFilters = useMemo(() => {
    const applied = sidebarFilterFields(filters);
    const draft = sidebarFilterFields(draftFilters);
    return (Object.keys(applied) as (keyof typeof applied)[]).some(
      (key) => JSON.stringify(applied[key]) !== JSON.stringify(draft[key]),
    );
  }, [draftFilters, filters]);

  const hasResults = featured !== null || jobs.length > 0;

  return (
    <PublicPageLayout>
      <SavedJobsProvider>
        <main className="w-full">
          <section className="relative overflow-hidden border-b border-outline-variant bg-surface-container-low px-margin-mobile pb-12 pt-6 md:px-margin-desktop md:pb-16 md:pt-8">
            <div className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-12 md:grid-cols-2">
              <div className="z-10">
                <span className="mb-4 inline-block rounded-full bg-secondary-fixed px-3 py-1 font-label-bold text-secondary">
                  University Program
                </span>
                <h1 className="mb-6 font-headline-xl text-headline-xl text-primary">
                  Launch Your Career Before Graduation.
                </h1>
                <p className="mb-8 max-w-lg font-body-lg text-body-lg text-on-surface-variant">
                  Connect with internship opportunities designed for Sri Lankan students. Your
                  first step into the professional world starts here.
                </p>
                <form
                  className="flex flex-col items-stretch gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm md:flex-row md:items-center"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (hasUnappliedFilters) applyFilters();
                  }}
                >
                  <div className="flex w-full flex-1 items-center border-b border-outline-variant pb-2 md:border-b-0 md:border-r md:pb-0 md:pr-4">
                    <Icon name="search" className="mr-2 shrink-0 text-outline" />
                    <input
                      className="w-full border-none bg-transparent font-body-md text-body-md focus:ring-0"
                      placeholder="Job title or skill..."
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  </div>
                  <div className="flex w-full items-center gap-2 md:w-auto md:border-r md:border-outline-variant md:pr-4">
                    <Icon name="schedule" className="shrink-0 text-outline" />
                    <select
                      value={durationFilter}
                      onChange={(event) =>
                        setDurationFilter(event.target.value as InternshipDuration)
                      }
                      className="w-full cursor-pointer border-none bg-transparent font-label-bold text-label-bold text-on-surface-variant focus:ring-0 md:w-auto"
                      aria-label="Internship duration"
                    >
                      {INTERNSHIP_DURATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full shrink-0 rounded-lg bg-secondary px-8 py-3 font-label-bold text-label-bold text-on-secondary transition-opacity hover:opacity-90 md:w-auto"
                  >
                    Find Opportunities
                  </button>
                </form>
              </div>
              <div className="relative hidden h-[420px] md:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Students working"
                  className="h-full w-full rounded-2xl object-cover shadow-lg"
                  src={INTERNSHIPS_HERO_IMG}
                />
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
            <div className="flex flex-col gap-gutter lg:flex-row lg:items-start">
              <aside className="w-full shrink-0 lg:w-72 xl:w-80">
                <div className="space-y-6 lg:sticky lg:top-24">
                  <JobSearchFiltersSidebar
                    filters={draftFilters}
                    hasUnappliedChanges={hasUnappliedFilters}
                    hideEmploymentType
                    onChange={patchDraftFilters}
                    onApply={applyFilters}
                    onReset={resetFilters}
                  />
                  <HomeBannerAdsGrid variant="tall" className="hidden lg:block" />
                </div>
              </aside>

              <div className="min-w-0 flex-1 space-y-stack-lg">
                {featured ? (
                  <section>
                    <div className="mb-stack-lg">
                      <h2 className="font-headline-lg text-headline-lg text-primary">
                        Internship of the Week
                      </h2>
                      <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                        Selected for outstanding mentorship and project exposure.
                      </p>
                    </div>
                    <FeaturedInternshipCard job={featured} />
                  </section>
                ) : null}

                <section>
                  <div className="mb-stack-md flex items-end justify-between gap-4">
                    <div>
                      <h2 className="font-headline-lg text-headline-lg text-primary">
                        Open Internships
                      </h2>
                      <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                        {loading
                          ? "Loading opportunities…"
                          : hasResults
                            ? "Browse current internship vacancies across Sri Lanka."
                            : "No internship listings right now. Check back soon."}
                      </p>
                    </div>
                    {jobs.length > 0 ? (
                      <span className="shrink-0 font-label-sm text-on-surface-variant">
                        {jobs.length} listing{jobs.length === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </div>

                  {loading ? (
                    <p className="rounded-xl border border-outline-variant bg-surface-container-lowest px-6 py-12 text-center text-on-surface-variant">
                      Loading internships…
                    </p>
                  ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                      {jobs.map((job) => (
                        <JobSearchResultCard key={job.id} job={job} />
                      ))}
                    </div>
                  ) : !featured ? (
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest px-6 py-12 text-center">
                      <Icon name="work" className="mb-3 text-4xl text-outline" />
                      <p className="font-label-bold text-on-surface">No internships found</p>
                      <p className="mt-2 text-body-md text-on-surface-variant">
                        Try adjusting your search, duration, or filters.
                      </p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-6 inline-flex rounded-lg bg-secondary px-6 py-2 font-label-bold text-on-secondary"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : null}
                </section>

                <HomeBannerAdsGrid columns={2} className="w-full" />
                <HomeBannerAdsGrid variant="tall" className="lg:hidden" />
              </div>
            </div>
          </div>
        </main>
      </SavedJobsProvider>
    </PublicPageLayout>
  );
}
