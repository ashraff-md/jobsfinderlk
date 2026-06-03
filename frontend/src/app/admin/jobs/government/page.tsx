import type { Metadata } from "next";
import { AdminGovernmentJobsPage } from "@/components/pages/admin-government-jobs-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/jobs/government"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminGovernmentJobsRoute() {
  return <AdminGovernmentJobsPage />;
}
