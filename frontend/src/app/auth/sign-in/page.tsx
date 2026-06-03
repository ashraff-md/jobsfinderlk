import { Suspense } from "react";
import { AuthSignInPage } from "@/components/pages/auth-sign-in-page";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <AuthSignInPage />
    </Suspense>
  );
}
