"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FeaturedJobCard } from "@/components/jobs/featured-job-card";
import { JobSearchBar } from "@/components/jobs/job-search-bar";
import { JobSearchResultCard } from "@/components/jobs/job-search-result-card";
import { JobSearchFiltersSidebar } from "@/components/jobs/job-search-filters-sidebar";
import { SiteFooter } from "@/components/layout/site-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Icon } from "@/components/ui/icon";
import { searchJobs, searchPublishedJobs } from "@/lib/api/jobs";
import { jobToSponsoredCardItem } from "@/lib/jobs/map-job-to-featured-card";
import type { FeaturedJobCardItem } from "@/lib/jobs/featured-jobs";
import {
  buildJobSearchParams,
  DEFAULT_JOB_SEARCH_FILTERS,
  formatActiveFiltersSummary,
  type JobSearchFilters,
} from "@/lib/jobs/job-search-filters";
import type { Job } from "@/lib/api/types";

export function JobsSearchPage() {
  const urlSearchParams = useSearchParams();
  const [filters, setFilters] = useState<JobSearchFilters>(DEFAULT_JOB_SEARCH_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sponsoredJobs, setSponsoredJobs] = useState<FeaturedJobCardItem[]>([]);
  const [total, setTotal] = useState(0);
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
    setFilters((prev) => ({
      ...prev,
      ...(q ? { q } : {}),
      ...(cities.length ? { cities } : {}),
      ...(categories.length ? { categories } : {}),
    }));
    setDebouncedQ(q);
  }, [urlSearchParams]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQ(filters.q), 400);
    return () => window.clearTimeout(id);
  }, [filters.q]);

  const searchParams = useMemo(
    () => buildJobSearchParams({ ...filters, q: debouncedQ }, { limit: 20 }),
    [filters, debouncedQ],
  );

  const patchFilters = useCallback((patch: Partial<JobSearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_JOB_SEARCH_FILTERS);
  }, []);

  const filtersSummary = useMemo(() => formatActiveFiltersSummary(filters), [filters]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await searchJobs(searchParams);
        if (!cancelled) {
          setJobs(data.items);
          setTotal(data.total);
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
      try {
        const featured = await searchPublishedJobs({ featured: true, limit: 3 });
        let items = featured.items;
        if (items.length < 3) {
          const fallback = await searchPublishedJobs({ limit: 3 });
          const seen = new Set(items.map((j) => j.id));
          for (const job of fallback.items) {
            if (items.length >= 3) break;
            if (!seen.has(job.id)) {
              items = [...items, job];
              seen.add(job.id);
            }
          }
        }
        if (!cancelled) {
          setSponsoredJobs(items.slice(0, 3).map((job) => jobToSponsoredCardItem(job)));
        }
      } catch {
        if (!cancelled) setSponsoredJobs([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <PublicHeader />

      <main className="mx-auto flex w-full max-w-container-max flex-col gap-gutter px-margin-mobile py-12 md:flex-row md:px-margin-desktop">
        <aside className="w-full shrink-0 md:w-80">
          <div className="sticky top-28 space-y-6">
            <JobSearchFiltersSidebar
              filters={filters}
              onChange={patchFilters}
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
          </div>
        </aside>

        <section className="grow space-y-gutter">
          <JobSearchBar
            value={filters.q}
            onChange={(q) => patchFilters({ q })}
          />

          {sponsoredJobs.length > 0 && (
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {sponsoredJobs.map((job) => (
                  <FeaturedJobCard key={job.href ?? job.title} job={job} titleLineClamp={3} />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-headline-md font-bold text-primary">
                {loading ? "Loading jobs…" : `Showing ${total} Job${total === 1 ? "" : "s"}`}
              </h2>
              <p className="text-label-sm text-outline">Based on your filters: {filtersSummary}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap text-label-sm text-outline">Sort by:</span>
              <select className="rounded border-outline-variant bg-surface-container-low px-4 py-2 text-label-sm font-bold text-primary focus:border-primary focus:ring-primary">
                <option>Most Relevant</option>
                <option>Newest First</option>
                <option>Highest Salary</option>
              </select>
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {jobs.map((job) => (
                <JobSearchResultCard key={job.slug} job={job} />
              ))}
            </div>
          )}

          {!loading && jobs.length > 0 && (
            <div className="flex justify-center py-16">
              <p className="text-label-sm font-medium text-outline">End of results</p>
            </div>
          )}
        </section>
      </main>

      <SiteFooter variant="dark" />
    </div>
  );
}
