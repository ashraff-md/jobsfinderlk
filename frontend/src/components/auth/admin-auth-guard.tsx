"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RequirePortalAuth } from "@/components/auth/require-portal-auth";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <RequirePortalAuth portal="admin">{children}</RequirePortalAuth>;
}
