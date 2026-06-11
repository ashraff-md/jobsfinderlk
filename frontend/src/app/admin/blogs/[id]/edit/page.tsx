import type { Metadata } from "next";
import { AdminBlogFormPage } from "@/components/pages/admin-blog-form-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/admin/blogs/[id]/edit"];

export const metadata: Metadata = {
  title: meta.title,
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditBlogRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminBlogFormPage postId={id} />;
}
