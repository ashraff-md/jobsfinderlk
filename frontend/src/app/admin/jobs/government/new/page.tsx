import type { Metadata } from "next";
import { AdminGovernmentJobPage } from "@/components/pages/admin-government-job-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/jobs/government/new"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminGovernmentJobNewPage() {
  return <AdminGovernmentJobPage />;
}
