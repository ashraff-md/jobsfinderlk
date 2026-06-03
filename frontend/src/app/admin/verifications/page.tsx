import type { Metadata } from "next";
import { AdminVerificationsPage } from "@/components/pages/admin-verifications-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/verifications"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminVerificationsRoute() {
  return <AdminVerificationsPage />;
}
