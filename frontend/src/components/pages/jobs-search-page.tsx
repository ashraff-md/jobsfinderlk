"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HomeBannerAdsGrid } from "@/components/home/home-banner-ads-grid";
import { FeaturedJobCard } from "@/components/jobs/featured-job-card";
import { JobSearchBar } from "@/components/jobs/job-search-bar";
import { JobSearchResultCard } from "@/components/jobs/job-search-result-card";
import { SavedJobsProvider } from "@/components/jobs/saved-jobs-provider";
import { JobSearchFiltersSidebar } from "@/components/jobs/job-search-filters-sidebar";
import { PublicHeader } from "@/components/layout/public-header";
import { Icon } from "@/components/ui/icon";
import { searchJobs } from "@/lib/api/jobs";
import { JOB_SLIDE_INTERVAL_MS } from "@/lib/jobs/featured-jobs";
import type { FeaturedJobCardItem } from "@/lib/jobs/featured-jobs";
import { buildFeaturedCardSlides } from "@/lib/jobs/map-job-to-featured-card";
import { loadSponsoredJobCards } from "@/lib/platform-ads/load-sponsored";
import { recordSponsoredImpressions } from "@/lib/platform-ads/record-impressions";
import { SPONSORED_JOBS_BATCH_SIZE } from "@/lib/platform-ads/sponsored-rotation";
import {
  buildJobSearchParams,
  DEFAULT_JOB_SEARCH_FILTERS,
  type JobSearchFilters,
} from "@/lib/jobs/job-search-filters";
import type { Job } from "@/lib/api/types";

const JOBS_PER_PAGE_OPTIONS = [10, 20, 50] as const;
const SPONSORED_CARDS_PER_SLIDE = 2;
const SPONSORED_SLIDE_COUNT = 3;

function sidebarFilterFields(filters: JobSearchFilters): Omit<JobSearchFilters, "q"> {
  const { q: _q, ...rest } = filters;
  return rest;
}

export function JobsSearchPage() {
  const urlSearchParams = useSearchParams();
  const [filters, setFilters] = useState<JobSearchFilters>(DEFAULT_JOB_SEARCH_FILTERS);
  const [draftFilters, setDraftFilters] = useState<JobSearchFilters>(DEFAULT_JOB_SEARCH_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sponsoredSlides, setSponsoredSlides] = useState<FeaturedJobCardItem[][]>([]);
  const [sponsoredSlide, setSponsoredSlide] = useState(0);
  const [sponsoredCarouselPaused, setSponsoredCarouselPaused] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState<(typeof JOBS_PER_PAGE_OPTIONS)[number]>(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = urlSearchParams.get("q") ?? "";
    const cities = urlSearchParams.getAll("city").filter(Boolean);
    let categories = urlSearchParams.getAll("category").filter(Boolean);
    const legacyIndustry = urlSearchParams.get("industry");
    if (!categories.length && legacyIndustry) {
      categories = [legacyIndustry];
    }
    if (!q && !cities.length && !categories.length) return;
    const patch = {
      ...(q ? { q } : {}),
      ...(cities.length ? { cities } : {}),
      ...(categories.length ? { categories } : {}),
    };
    setPage(1);
    setFilters((prev) => ({ ...prev, ...patch }));
    setDraftFilters((prev) => ({ ...prev, ...patch }));
    setDebouncedQ(q);
  }, [urlSearchParams]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQ(filters.q), 400);
    return () => window.clearTimeout(id);
  }, [filters.q]);

  const searchParams = useMemo(
    () => buildJobSearchParams({ ...filters, q: debouncedQ }, { page, limit: jobsPerPage }),
    [filters, debouncedQ, page, jobsPerPage],
  );

  const patchFilters = useCallback((patch: Partial<JobSearchFilters>) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const patchDraftFilters = useCallback((patch: Partial<JobSearchFilters>) => {
    setDraftFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyFilters = useCallback(() => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...sidebarFilterFields(draftFilters) }));
  }, [draftFilters]);

  const resetFilters = useCallback(() => {
    setPage(1);
    setFilters(DEFAULT_JOB_SEARCH_FILTERS);
    setDraftFilters(DEFAULT_JOB_SEARCH_FILTERS);
  }, []);

  const hasUnappliedFilters = useMemo(() => {
    const applied = sidebarFilterFields(filters);
    const draft = sidebarFilterFields(draftFilters);
    return (Object.keys(applied) as (keyof typeof applied)[]).some(
      (key) => JSON.stringify(applied[key]) !== JSON.stringify(draft[key]),
    );
  }, [filters, draftFilters]);

  const resultsRangeLabel = useMemo(() => {
    if (loading || total === 0) return null;
    const start = (page - 1) * jobsPerPage + 1;
    const end = Math.min(page * jobsPerPage, total);
    return `${start}–${end} of ${total}`;
  }, [loading, total, page, jobsPerPage]);

  const handleJobsPerPageChange = useCallback((value: string) => {
    const next = Number(value);
    if (!JOBS_PER_PAGE_OPTIONS.includes(next as (typeof JOBS_PER_PAGE_OPTIONS)[number])) return;
    setJobsPerPage(next as (typeof JOBS_PER_PAGE_OPTIONS)[number]);
    setPage(1);
  }, []);

  const goToPage = useCallback((nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, pages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pages]);

  const paginationItems = useMemo(() => {
    if (pages <= 1) return [];
    if (pages <= 9) {
      return Array.from({ length: pages }, (_, index) => index + 1);
    }

    const pageSet = new Set([1, pages, page - 1, page, page + 1]);
    const sorted = [...pageSet].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
    const result: (number | "ellipsis")[] = [];

    sorted.forEach((p, index) => {
      if (index > 0 && p - sorted[index - 1] > 1) result.push("ellipsis");
      result.push(p);
    });

    return result;
  }, [page, pages]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await searchJobs(searchParams);
        if (!cancelled) {
          setJobs(data.items);
          setTotal(data.total);
          setPages(data.pages);
        }
      } catch {
        if (!cancelled) {
          setJobs([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const items = await loadSponsoredJobCards(SPONSORED_JOBS_BATCH_SIZE);
      if (!cancelled) {
        setSponsoredSlides(
          buildFeaturedCardSlides(items, SPONSORED_CARDS_PER_SLIDE, SPONSORED_SLIDE_COUNT),
        );
        setSponsoredSlide(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (sponsoredCarouselPaused || sponsoredSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setSponsoredSlide((current) => (current + 1) % sponsoredSlides.length);
    }, JOB_SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [sponsoredCarouselPaused, sponsoredSlides.length]);

  useEffect(() => {
    if (sponsoredSlide >= sponsoredSlides.length && sponsoredSlides.length > 0) {
      setSponsoredSlide(0);
    }
  }, [sponsoredSlide, sponsoredSlides.length]);

  useEffect(() => {
    const slide = sponsoredSlides[sponsoredSlide];
    if (!slide?.length) return;
    const ids = slide
      .map((job) => job.sponsoredAdId)
      .filter((id): id is string => Boolean(id));
    if (!ids.length) return;
    recordSponsoredImpressions(ids);
  }, [sponsoredSlide, sponsoredSlides]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <PublicHeader />

      <SavedJobsProvider>
      <main className="mx-auto flex w-full max-w-container-max flex-col gap-gutter px-margin-mobile py-12 md:flex-row md:px-margin-desktop">
        <aside className="w-full shrink-0 md:w-80">
          <div className="sticky top-28 space-y-6">
            <JobSearchFiltersSidebar
              filters={draftFilters}
              hasUnappliedChanges={hasUnappliedFilters}
              onChange={patchDraftFilters}
              onApply={applyFilters}
              onReset={resetFilters}
            />

            <div className="group relative overflow-hidden rounded-lg border border-primary/20 bg-primary-container p-6 text-on-primary">
              <div className="relative z-10">
                <Icon name="bolt" className="mb-3 rounded bg-white/10 p-2 text-white" />
                <h4 className="mb-2 text-[18px] font-semibold leading-tight text-white">
                  Get 2x faster responses
                </h4>
                <p className="mb-5 text-label-sm text-on-primary-container">
                  AI-optimized profiles appear at the top of recruiter searches.
                </p>
                <button
                  type="button"
                  className="w-full rounded bg-surface-container-lowest py-3 text-label-sm font-bold text-primary transition-all hover:bg-surface-container-low"
                >
                  Upgrade to Pro
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-white/5 blur-2xl transition-all duration-700 group-hover:bg-white/10" />
            </div>

            <HomeBannerAdsGrid variant="tall" />
          </div>
        </aside>

        <section className="grow space-y-gutter">
          <JobSearchBar
            value={filters.q}
            onChange={(q) => patchFilters({ q })}
          />

          {sponsoredSlides.length > 0 && (
            <div
              className="rounded-xl border border-primary/10 bg-primary/5 p-8"
              onMouseEnter={() => setSponsoredCarouselPaused(true)}
              onMouseLeave={() => setSponsoredCarouselPaused(false)}
            >
              <div className="w-full overflow-hidden">
                <div
                  className="flex w-full transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${sponsoredSlide * 100}%)` }}
                >
                  {sponsoredSlides.map((slide, slideIndex) => (
                    <div
                      key={slideIndex}
                      className="grid w-full min-w-full max-w-full shrink-0 basis-full grid-cols-1 gap-5 sm:grid-cols-2"
                    >
                      {slide.map((job) => (
                        <FeaturedJobCard key={job.href ?? `${job.title}-${slideIndex}`} job={job} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {sponsoredSlides.length > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    aria-label="Previous sponsored jobs"
                    onClick={() =>
                      setSponsoredSlide(
                        (current) => (current - 1 + sponsoredSlides.length) % sponsoredSlides.length,
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant transition-all hover:border-primary hover:bg-primary hover:text-on-primary"
                  >
                    <Icon name="chevron_left" />
                  </button>
                  <div className="flex items-center gap-2">
                    {sponsoredSlides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        aria-label={`Go to sponsored slide ${index + 1}`}
                        aria-current={sponsoredSlide === index ? "true" : undefined}
                        onClick={() => setSponsoredSlide(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          sponsoredSlide === index
                            ? "w-8 bg-primary"
                            : "w-2.5 bg-outline-variant/60 hover:bg-primary/40"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Next sponsored jobs"
                    onClick={() =>
                      setSponsoredSlide((current) => (current + 1) % sponsoredSlides.length)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant transition-all hover:border-primary hover:bg-primary hover:text-on-primary"
                  >
                    <Icon name="chevron_right" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-headline-md font-bold text-primary">
                {loading
                  ? "Loading jobs…"
                  : total === 0
                    ? "No jobs found"
                    : `Showing ${resultsRangeLabel} job${total === 1 ? "" : "s"}`}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-label-sm text-outline">Sort by:</span>
                <select className="rounded border-outline-variant bg-surface-container-low px-4 py-2 text-label-sm font-bold text-primary focus:border-primary focus:ring-primary">
                  <option>Most Relevant</option>
                  <option>Newest First</option>
                  <option>Highest Salary</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-label-sm text-outline">Jobs per page:</span>
                <select
                  value={jobsPerPage}
                  onChange={(e) => handleJobsPerPageChange(e.target.value)}
                  className="rounded border-outline-variant bg-surface-container-low px-4 py-2 text-label-sm font-bold text-primary focus:border-primary focus:ring-primary"
                  aria-label="Jobs per page"
                >
                  {JOBS_PER_PAGE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-container border-t-primary" />
            </div>
          )}
          {!loading && jobs.length === 0 && (
            <p className="py-12 text-center text-on-surface-variant">
              No jobs match these filters. Try adjusting requirements or reset filters.
            </p>
          )}
          {!loading && jobs.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {jobs.map((job) => (
                  <JobSearchResultCard key={job.slug} job={job} />
                ))}
              </div>

              {pages > 1 && (
                <nav
                  className="flex flex-wrap items-center justify-center gap-2 pt-8"
                  aria-label="Job results pagination"
                >
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="chevron_left" />
                  </button>
                  {paginationItems.map((item, index) =>
                    item === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1 text-label-sm text-outline"
                        aria-hidden
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        aria-label={`Page ${item}`}
                        aria-current={page === item ? "page" : undefined}
                        onClick={() => goToPage(item)}
                        className={`flex h-10 min-w-10 items-center justify-center rounded px-2 font-label-bold transition-colors ${
                          page === item
                            ? "bg-primary text-on-primary"
                            : "border border-outline-variant hover:bg-surface-container"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={page >= pages}
                    onClick={() => goToPage(page + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="chevron_right" />
                  </button>
                </nav>
              )}
            </>
          )}

          {!loading && <HomeBannerAdsGrid columns={2} className="w-full pt-4" />}
        </section>
      </main>
      </SavedJobsProvider>
    </div>
  );
}
