import type { Metadata } from "next";
import { EmployerJobListingsPage } from "@/components/pages/employer-job-listings-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/employer/jobs"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function EmployerJobListingsRoute() {
  return <EmployerJobListingsPage />;
}
