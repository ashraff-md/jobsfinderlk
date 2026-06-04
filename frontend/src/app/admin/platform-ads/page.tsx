import { AdminPlatformAdsPage } from "@/components/pages/admin-platform-ads-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/platform-ads"];

export const metadata = {
  title: meta.title,
};

export default function Page() {
  return <AdminPlatformAdsPage />;
}
