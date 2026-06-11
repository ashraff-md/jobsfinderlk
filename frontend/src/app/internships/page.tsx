import { InternshipsPage } from "@/components/pages/internships-page";
import type { JobsSearchResponse } from "@/lib/api/types";
import { serverFetch } from "@/lib/api/server";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Internships in Sri Lanka",
  description:
    "Find internship and graduate opportunities for students and fresh graduates across Sri Lanka.",
  path: "/internships",
});

export default async function Page() {
  const [featuredRes, listRes] = await Promise.all([
    serverFetch<JobsSearchResponse>("/jobs?employmentType=Internship&featured=true&limit=1"),
    serverFetch<JobsSearchResponse>("/jobs?employmentType=Internship&limit=24"),
  ]);

  const featured = featuredRes?.items[0] ?? listRes?.items[0] ?? null;
  const initialJobs = listRes?.items.filter((job) => job.id !== featured?.id) ?? [];

  return <InternshipsPage initialJobs={initialJobs} initialFeatured={featured} />;
}
