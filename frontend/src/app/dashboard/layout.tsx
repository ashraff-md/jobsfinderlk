import type { ReactNode } from "react";
import { RequirePortalAuth } from "@/components/auth/require-portal-auth";
import { PRIVATE_ROBOTS_METADATA } from "@/lib/seo/metadata";

export const metadata = PRIVATE_ROBOTS_METADATA;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <RequirePortalAuth portal="seeker">{children}</RequirePortalAuth>;
}
