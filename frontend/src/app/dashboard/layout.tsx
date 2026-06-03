import type { ReactNode } from "react";
import { RequirePortalAuth } from "@/components/auth/require-portal-auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <RequirePortalAuth portal="seeker">{children}</RequirePortalAuth>;
}
