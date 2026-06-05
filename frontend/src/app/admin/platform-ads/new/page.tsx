import { Suspense } from "react";
import { AdminPlatformAdsCampaignPage } from "@/components/pages/admin-platform-ads-campaign-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/platform-ads/new"];

export const metadata = {
  title: meta.title,
};

export default function Page() {
  return (
    <Suspense fallback={<p className="p-8 text-on-surface-variant">Loading…</p>}>
      <AdminPlatformAdsCampaignPage />
    </Suspense>
  );
}
