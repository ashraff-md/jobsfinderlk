import type { Metadata } from "next";
import { Suspense } from "react";
import { JobsSearchPage } from "@/components/pages/jobs-search-page";
import { JsonLd } from "@/components/seo/json-ld";
import { PaginationLinks } from "@/components/seo/pagination-links";
import type { JobsSearchResponse } from "@/lib/api/types";
import { serverFetch } from "@/lib/api/server";
import {
  buildJobsSearchApiPath,
  getJobsPaginationPaths,
  parseJobSearchParamsFromUrl,
} from "@/lib/jobs/job-search-filters";
import { buildItemListJsonLd } from "@/lib/seo/json-ld";
import { buildJobsSearchMetadata } from "@/lib/seo/metadata";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const parsed = parseJobSearchParamsFromUrl(params);
  return buildJobsSearchMetadata(parsed);
}

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams;
  const parsed = parseJobSearchParamsFromUrl(params);
  const data = await serverFetch<JobsSearchResponse>(
    buildJobsSearchApiPath(parsed.filters, { page: parsed.page, limit: parsed.limit }),
  );

  const jobs = data?.items ?? [];
  const totalPages = data?.pages ?? 1;
  const pagination = getJobsPaginationPaths(parsed, totalPages);

  return (
    <>
      <PaginationLinks prevPath={pagination.prev} nextPath={pagination.next} />
      {jobs.length > 0 ? (
        <JsonLd data={buildItemListJsonLd(jobs, "Job search results on JobsFinder.lk")} />
      ) : null}
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-container border-t-primary" />
          </div>
        }
      >
        <JobsSearchPage
          initialFilters={parsed.filters}
          initialPage={parsed.page}
          initialJobsPerPage={parsed.limit}
          initialJobs={jobs}
          initialTotal={data?.total ?? 0}
          initialPages={totalPages}
        />
      </Suspense>
    </>
  );
}
