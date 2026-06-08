import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutPage } from "@/components/pages/checkout-page";

export const metadata: Metadata = {
  title: "Secure Checkout | JobsFinder.lk",
  description: "Complete your JobsFinder.lk recruitment package purchase securely.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CheckoutPage />
    </Suspense>
  );
}
