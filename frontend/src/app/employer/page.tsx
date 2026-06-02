import type { Metadata } from "next";
import { EmployerDashboardPage } from "@/components/pages/employer-dashboard-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/employer"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function EmployerPage() {
  return <EmployerDashboardPage />;
}
