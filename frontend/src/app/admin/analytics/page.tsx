import type { Metadata } from "next";
import { AdminAnalyticsPage } from "@/components/pages/admin-analytics-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/analytics"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminAnalyticsRoute() {
  return <AdminAnalyticsPage />;
}
