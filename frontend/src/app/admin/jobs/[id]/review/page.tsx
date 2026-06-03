import type { Metadata } from "next";
import { AdminJobReviewPage } from "@/components/pages/admin-job-review-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/jobs/[id]/review"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminJobReviewRoute() {
  return <AdminJobReviewPage />;
}
