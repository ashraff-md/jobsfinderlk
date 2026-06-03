import type { ReactNode } from "react";
import { RequirePortalAuth } from "@/components/auth/require-portal-auth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RequirePortalAuth portal="admin">{children}</RequirePortalAuth>;
}
