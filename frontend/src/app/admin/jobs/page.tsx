import type { Metadata } from "next";
import { AdminJobsApprovalPage } from "@/components/pages/admin-jobs-approval-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/jobs"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminJobsPage() {
  return <AdminJobsApprovalPage />;
}
