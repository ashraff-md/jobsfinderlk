import type { Metadata } from "next";
import { SeekerSettingsPage } from "@/components/pages/seeker-settings-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/dashboard/settings"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function SettingsPage() {
  return <SeekerSettingsPage />;
}
