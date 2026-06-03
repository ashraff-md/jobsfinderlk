import type { ReactNode } from "react";
import { RequirePortalAuth } from "@/components/auth/require-portal-auth";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return <RequirePortalAuth portal="employer">{children}</RequirePortalAuth>;
}
