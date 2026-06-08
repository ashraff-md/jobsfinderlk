import type { Metadata } from "next";
import { AdminGovernmentJobPage } from "@/components/pages/admin-government-job-page";

export const metadata: Metadata = {
  title: "Edit Government Posting",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminGovernmentJobEditPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminGovernmentJobPage jobId={id} />;
}
