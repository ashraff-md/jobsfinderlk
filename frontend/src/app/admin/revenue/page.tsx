import type { Metadata } from "next";
import { AdminRevenuePage } from "@/components/pages/admin-revenue-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/revenue"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminRevenueRoute() {
  return <AdminRevenuePage />;
}
