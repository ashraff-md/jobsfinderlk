import type { Metadata } from "next";
import { EmployerApplicationsPage } from "@/components/pages/employer-applications-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/employer/applications"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function EmployerApplicationsRoute() {
  return <EmployerApplicationsPage />;
}
