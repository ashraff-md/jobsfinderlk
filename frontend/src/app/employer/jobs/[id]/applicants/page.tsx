import type { Metadata } from "next";
import { CandidatePipelinePage } from "@/components/pages/candidate-pipeline-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/employer/jobs/[id]/applicants"];

export const metadata: Metadata = {
  title: meta.title,
};

export default async function ApplicantPipelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CandidatePipelinePage id={id} />;
}
