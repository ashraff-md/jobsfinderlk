import type { Metadata } from "next";
import { AdminHubPage } from "@/components/pages/admin-hub-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminPage() {
  return <AdminHubPage />;
}
