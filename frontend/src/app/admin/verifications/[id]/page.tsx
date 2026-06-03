import type { Metadata } from "next";
import { AdminVerificationDetailPage } from "@/components/pages/admin-verification-detail-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/verifications/[id]"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminVerificationDetailRoute() {
  return <AdminVerificationDetailPage />;
}
