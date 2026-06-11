import type { Metadata } from "next";
import { AdminBlogsPage } from "@/components/pages/admin-blogs-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/blogs"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminBlogsRoute() {
  return <AdminBlogsPage />;
}
