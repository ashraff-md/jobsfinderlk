import type { Metadata } from "next";
import { EmployerCreateAdCampaignPage } from "@/components/pages/employer-create-ad-campaign-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/employer/ads/new"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function EmployerCreateAdCampaignRoute() {
  return <EmployerCreateAdCampaignPage />;
}
