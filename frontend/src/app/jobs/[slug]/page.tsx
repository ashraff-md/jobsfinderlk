import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetailPage } from "@/components/pages/job-detail-page";
import { serverFetch } from "@/lib/api/server";
import type { Job } from "@/lib/api/types";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/jobs/[slug]"];

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await serverFetch<Job>(`/jobs/${slug}`);
  return { title: `${job?.title ?? slug} — ${meta.title}` };
}

export default async function JobSlugPage({ params }: Props) {
  const { slug } = await params;
  const job = await serverFetch<Job>(`/jobs/${slug}`);
  if (!job) notFound();
  return <JobDetailPage job={job} />;
}
