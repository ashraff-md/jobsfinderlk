import type { Metadata } from "next";
import { SeekerDashboardPage } from "@/components/pages/seeker-dashboard-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/dashboard"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function DashboardPage() {
  return <SeekerDashboardPage />;
}
