import type { Metadata } from "next";
import { AdminPostJobPage } from "@/components/pages/admin-post-job-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/jobs/new"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminPostJobRoute() {
  return <AdminPostJobPage />;
}
