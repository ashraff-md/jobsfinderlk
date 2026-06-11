import type { ReactNode } from "react";
import { AdminAuthGuard } from "@/components/auth/admin-auth-guard";
import { PRIVATE_ROBOTS_METADATA } from "@/lib/seo/metadata";

export const metadata = PRIVATE_ROBOTS_METADATA;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
