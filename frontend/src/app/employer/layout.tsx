import type { ReactNode } from "react";
import { RequirePortalAuth } from "@/components/auth/require-portal-auth";
import { EmployerPortalLayout } from "@/components/layout/employer-portal-layout";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <RequirePortalAuth portal="employer">
      <EmployerPortalLayout>{children}</EmployerPortalLayout>
    </RequirePortalAuth>
  );
}
