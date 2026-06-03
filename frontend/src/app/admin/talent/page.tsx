import type { Metadata } from "next";
import { AdminTalentPoolPage } from "@/components/pages/admin-talent-pool-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/talent"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminTalentRoute() {
  return <AdminTalentPoolPage />;
}
