import type { Metadata } from "next";
import { AdminSettingsPage } from "@/components/pages/admin-settings-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/settings"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminSettingsRoute() {
  return <AdminSettingsPage />;
}
