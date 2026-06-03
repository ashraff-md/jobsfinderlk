import type { Metadata } from "next";
import { AdminCompanyDetailPage } from "@/components/pages/admin-company-detail-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/companies/[id]"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminCompanyDetailRoute() {
  return <AdminCompanyDetailPage />;
}
