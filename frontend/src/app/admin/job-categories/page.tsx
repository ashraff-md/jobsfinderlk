import type { Metadata } from "next";
import { AdminJobCategoriesPage } from "@/components/pages/admin-job-categories-page";
import { ROUTE_META } from "@/lib/routes";

export const metadata: Metadata = {
  title: ROUTE_META["/admin/job-categories"].title,
};

export default function Page() {
  return <AdminJobCategoriesPage />;
}
