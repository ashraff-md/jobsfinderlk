import type { Metadata } from "next";
import { PricingPage } from "@/components/pages/pricing-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/pricing"];

export const metadata: Metadata = {
  title: `${meta.title} | JobsFinder.lk`,
  description: "Pricing plans for job seekers and recruiters.",
};

export default function Page() {
  return <PricingPage />;
}
