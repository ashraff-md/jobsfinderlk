import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetailPage } from "@/components/pages/job-detail-page";
import { JsonLd } from "@/components/seo/json-ld";
import { serverFetch } from "@/lib/api/server";
import type { Job } from "@/lib/api/types";
import { buildBreadcrumbJsonLd, buildJobPostingJsonLd } from "@/lib/seo/json-ld";
import { buildJobMetadata } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/seo/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await serverFetch<Job>(`/jobs/${slug}`);
  if (!job) return { title: "Job Not Found" };
  return buildJobMetadata(job);
}

export default async function JobSlugPage({ params }: Props) {
  const { slug } = await params;
  const job = await serverFetch<Job>(`/jobs/${slug}`);
  if (!job) notFound();

  const siteUrl = getSiteUrl();

  return (
    <>
      <JsonLd
        data={[
          buildJobPostingJsonLd(job, siteUrl),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Jobs", path: "/jobs" },
            { name: job.title, path: `/jobs/${job.slug}` },
          ]),
        ]}
      />
      <JobDetailPage job={job} />
    </>
  );
}
