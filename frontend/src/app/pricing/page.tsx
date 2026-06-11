import { PricingPage } from "@/components/pages/pricing-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Recruitment Solutions & Pricing",
  description:
    "Job listing packages, sponsored job tiers, and banner advertising pricing for employers on JobsFinder.lk.",
  path: "/pricing",
});

export default function Page() {
  return <PricingPage />;
}
