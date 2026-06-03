import type { Metadata } from "next";
import { AdminGovernancePage } from "@/components/pages/admin-governance-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/governance"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminGovernanceRoute() {
  return <AdminGovernancePage />;
}
