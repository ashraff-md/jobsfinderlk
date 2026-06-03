import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthAdminSignInPage } from "@/components/pages/auth-admin-sign-in-page";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthAdminSignInPage />
    </Suspense>
  );
}
