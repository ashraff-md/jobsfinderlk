import { LandingPage } from "@/components/pages/landing-page";
import type { JobCategory, JobsSearchResponse, PlatformPartner } from "@/lib/api/types";
import { serverFetch } from "@/lib/api/server";
import { buildJobCardSlides } from "@/lib/jobs/map-job-to-featured-card";
import { buildPageMetadata } from "@/lib/seo/metadata";

const HOME_OPPORTUNITIES_CARDS_PER_SLIDE = 12;
const HOME_OPPORTUNITIES_SLIDE_COUNT = 3;

export const metadata = buildPageMetadata({
  title: "Jobs in Sri Lanka",
  description:
    "Find your next career move on JobsFinder.lk. Search job vacancies across Sri Lanka, apply online, and connect with top employers.",
  path: "/",
});

export default async function HomePage() {
  const jobLimit = HOME_OPPORTUNITIES_CARDS_PER_SLIDE * HOME_OPPORTUNITIES_SLIDE_COUNT;
  const [jobsRes, categories, partners] = await Promise.all([
    serverFetch<JobsSearchResponse>(`/jobs?limit=${jobLimit}`),
    serverFetch<JobCategory[]>("/jobs/categories"),
    serverFetch<PlatformPartner[]>("/partners"),
  ]);

  const initialJobSlides = buildJobCardSlides(
    jobsRes?.items ?? [],
    HOME_OPPORTUNITIES_CARDS_PER_SLIDE,
    HOME_OPPORTUNITIES_SLIDE_COUNT,
  );

  return (
    <LandingPage
      initialJobSlides={initialJobSlides}
      initialCategories={categories ?? []}
      initialPartners={partners ?? []}
    />
  );
}
