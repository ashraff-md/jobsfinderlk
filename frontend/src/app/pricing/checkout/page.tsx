import { Suspense } from "react";
import { CheckoutPage } from "@/components/pages/checkout-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Secure Checkout",
  description: "Complete your JobsFinder.lk recruitment package purchase securely.",
  path: "/pricing/checkout",
  noIndex: true,
});

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CheckoutPage />
    </Suspense>
  );
}
