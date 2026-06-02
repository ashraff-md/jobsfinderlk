import type { Metadata } from "next";
import { SeekerApplicationsPage } from "@/components/pages/seeker-applications-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/dashboard/applications"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function ApplicationsPage() {
  return <SeekerApplicationsPage />;
}
