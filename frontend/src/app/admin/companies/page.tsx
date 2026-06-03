import type { Metadata } from "next";
import { AdminCompaniesPage } from "@/components/pages/admin-companies-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/companies"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminCompaniesRoute() {
  return <AdminCompaniesPage />;
}
