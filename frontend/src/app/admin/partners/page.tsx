import type { Metadata } from "next";
import { AdminPartnersPage } from "@/components/pages/admin-partners-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/partners"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminPartnersRoute() {
  return <AdminPartnersPage />;
}
