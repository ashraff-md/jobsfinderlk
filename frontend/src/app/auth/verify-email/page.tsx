import { Suspense } from "react";
import { VerifyEmailPage } from "@/components/pages/verify-email-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPage />
    </Suspense>
  );
}
