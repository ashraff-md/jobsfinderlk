import type { Metadata } from "next";
import { EmployerSettingsPage } from "@/components/pages/employer-settings-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/employer/settings"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function EmployerSettingsRoute() {
  return <EmployerSettingsPage />;
}
