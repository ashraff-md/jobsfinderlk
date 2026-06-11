import type { Metadata } from "next";
import { AdminBlogFormPage } from "@/components/pages/admin-blog-form-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/blogs/new"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function AdminCreateBlogRoute() {
  return <AdminBlogFormPage />;
}
