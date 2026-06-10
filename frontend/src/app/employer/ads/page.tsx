import type { Metadata } from "next";
import { EmployerAdsPage } from "@/components/pages/employer-ads-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/employer/ads"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function EmployerAdsRoute() {
  return <EmployerAdsPage />;
}
