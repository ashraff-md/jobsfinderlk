"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckoutBillingFields } from "@/components/checkout/checkout-billing-fields";
import { CheckoutPaymentMethods } from "@/components/checkout/checkout-payment-methods";
import { CheckoutPromoCodeSection } from "@/components/checkout/checkout-promo-code-section";
import {
  BannerCheckoutFields,
  GuestContactFields,
} from "@/components/pages/pricing/banner-checkout-fields";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { Icon } from "@/components/ui/icon";
import { getAccessToken, getProfile, getStoredUser } from "@/lib/api/auth";
import {
  recordEmployerPurchaseApi,
  type EmployerAdCampaignPayload,
} from "@/lib/api/employer-billing";
import { parsePromotionDaysFromDuration } from "@/lib/employer/employer-campaigns";
import {
  calculateCheckoutTotal,
  formatCheckoutLkr,
  type AppliedPromoCode,
  type CheckoutPaymentType,
} from "@/lib/checkout/checkout-utils";
import type { PurchaseProduct } from "@/lib/employer/purchases";

export function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") ?? "Growth Suite";
  const duration = searchParams.get("duration") ?? "";
  const product = (searchParams.get("product") ?? "job-listings") as PurchaseProduct;
  const aspectParam = searchParams.get("aspect");
  const bannerAspect: "wide" | "tall" = aspectParam === "tall" ? "tall" : "wide";
  const basePrice = Number(searchParams.get("price") ?? 10000);

  const isBannerCheckout = product === "banner-advertising";

  const [paymentType, setPaymentType] = useState<CheckoutPaymentType>("card");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileLoading, setProfileLoading] = useState(isBannerCheckout);

  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCompany, setGuestCompany] = useState("");
  const [guestAddress, setGuestAddress] = useState("");

  const [campaignName, setCampaignName] = useState("");
  const [destinationPath, setDestinationPath] = useState("/jobs");
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkDataUrl, setArtworkDataUrl] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromoCode | null>(null);
  const [completing, setCompleting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    setIsLoggedIn(Boolean(token));

    if (!token) {
      setProfileLoading(false);
      return;
    }

    void getProfile()
      .then((profile) => {
        setGuestEmail(profile.email);
        const employer = profile.employerUsers?.[0];
        if (employer) {
          setCompanyName(employer.company.name);
          setGuestName(employer.fullName?.trim() ?? "");
          setGuestPhone(employer.contactNo?.trim() ?? "");
        } else if (profile.adminProfile) {
          const name = [profile.adminProfile.firstName, profile.adminProfile.lastName]
            .filter(Boolean)
            .join(" ");
          setGuestName(name);
          setGuestPhone(profile.adminProfile.contactNo?.trim() ?? "");
        }
      })
      .catch(() => {
        const stored = getStoredUser();
        if (stored?.email) setGuestEmail(stored.email);
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const subtotal = Number.isFinite(basePrice) ? basePrice : 10000;
  const checkoutTotals = useMemo(
    () => calculateCheckoutTotal(subtotal, appliedPromo?.discountAmount ?? 0),
    [appliedPromo?.discountAmount, subtotal],
  );

  useEffect(() => {
    setAppliedPromo(null);
  }, [product, subtotal]);

  const productLabel =
    product === "sponsored-jobs"
      ? "Sponsored Jobs"
      : product === "banner-advertising"
        ? "Banner Advertising"
        : "Job Listings";

  const handleCompletePurchase = async () => {
    setCheckoutError(null);
    if (!getAccessToken() || !getStoredUser()?.id) {
      setCheckoutError("Sign in as a recruiter to complete your purchase and track job slots.");
      return;
    }

    let adCampaign: EmployerAdCampaignPayload | undefined;
    if (isBannerCheckout) {
      const promotionDays = parsePromotionDaysFromDuration(duration);
      if (!campaignName.trim() || !artworkDataUrl || !promotionDays) {
        setCheckoutError("Complete your banner campaign details before checkout.");
        return;
      }
      adCampaign = {
        aspectRatio: bannerAspect === "tall" ? "RATIO_2_5" : "RATIO_3_2",
        label: campaignName.trim(),
        href: destinationPath.trim() || "/jobs",
        imageUrl: artworkDataUrl,
        promotionDays,
        startsAt: new Date().toISOString().slice(0, 10),
      };
    }

    setCompleting(true);
    try {
      await recordEmployerPurchaseApi({
        product,
        plan,
        duration: duration || undefined,
        subtotal,
        total: checkoutTotals.total,
        promoCode: appliedPromo?.code,
        paymentMethod: paymentType,
        adCampaign,
      });
      window.dispatchEvent(new Event("employer-purchases-updated"));
      router.push("/employer/settings#billing");
    } catch {
      setCheckoutError("Could not record your purchase. Please try again.");
      setCompleting(false);
    }
  };

  const handleArtworkChange = (dataUrl: string | null, previewUrl: string | null) => {
    setArtworkDataUrl(dataUrl);
    setArtworkPreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return previewUrl;
    });
  };

  return (
    <PublicPageLayout>
      <div className="border-b border-outline-variant bg-surface">
        <div className="mx-auto flex h-16 max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop">
          <Link href="/pricing" className="font-label-bold text-label-bold text-secondary hover:underline">
            ← Back to Pricing
          </Link>
          <div className="flex items-center gap-stack-md">
            <Icon name="lock" className="text-outline" />
            <span className="font-label-bold text-label-bold text-on-surface-variant">
              Secure Institutional Checkout
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto min-h-screen max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-gutter">
          <div className="space-y-stack-lg lg:col-span-7">
            {isBannerCheckout && !profileLoading && (
              <>
                {!isLoggedIn ? (
                  <GuestContactFields
                    fullName={guestName}
                    onFullNameChange={setGuestName}
                    email={guestEmail}
                    onEmailChange={setGuestEmail}
                    phone={guestPhone}
                    onPhoneChange={setGuestPhone}
                    company={guestCompany}
                    onCompanyChange={setGuestCompany}
                    address={guestAddress}
                    onAddressChange={setGuestAddress}
                  />
                ) : (
                  <section className="rounded-lg border border-outline-variant bg-surface-container-low p-stack-md">
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Signed in as{" "}
                      <span className="font-label-bold text-on-surface">{guestEmail}</span>.
                    </p>
                  </section>
                )}

                <BannerCheckoutFields
                  aspect={bannerAspect}
                  campaignName={campaignName}
                  onCampaignNameChange={setCampaignName}
                  destinationPath={destinationPath}
                  onDestinationPathChange={setDestinationPath}
                  artworkPreview={artworkPreview}
                  onArtworkChange={handleArtworkChange}
                  error={bannerError}
                  onError={setBannerError}
                />
              </>
            )}

            <CheckoutPromoCodeSection
              product={product}
              subtotal={subtotal}
              appliedPromo={appliedPromo}
              onAppliedPromoChange={setAppliedPromo}
            />

            <CheckoutBillingFields
              companyName={isBannerCheckout && !isLoggedIn ? guestCompany : companyName}
              onCompanyNameChange={
                isBannerCheckout && !isLoggedIn ? setGuestCompany : setCompanyName
              }
              address={isBannerCheckout && !isLoggedIn ? guestAddress : address}
              onAddressChange={isBannerCheckout && !isLoggedIn ? setGuestAddress : setAddress}
              vatNumber={vatNumber}
              onVatNumberChange={setVatNumber}
              postalCode={postalCode}
              onPostalCodeChange={setPostalCode}
            />

            <CheckoutPaymentMethods
              paymentType={paymentType}
              onPaymentTypeChange={setPaymentType}
              idPrefix="pricing-"
            />
          </div>

          <aside className="mt-stack-lg lg:col-span-5 lg:mt-0">
            <div className="sticky top-28 rounded-lg border border-outline-variant bg-surface-container-low p-stack-lg">
              <h3 className="mb-stack-lg border-b border-outline-variant pb-stack-sm font-headline-md text-headline-md">
                Order Summary
              </h3>
              <div className="mb-stack-lg space-y-stack-md">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-label-bold text-label-bold">{plan}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{productLabel}</p>
                    {duration && (
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{duration}</p>
                    )}
                    {isBannerCheckout && artworkDataUrl && (
                      <p className="font-label-sm text-label-sm text-secondary">Banner artwork attached</p>
                    )}
                  </div>
                  <span className="font-label-bold">{formatCheckoutLkr(subtotal)}</span>
                </div>
              </div>
              <div className="mb-stack-lg space-y-stack-sm border-t border-outline-variant pt-stack-md">
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span>{formatCheckoutLkr(subtotal)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between font-body-md text-body-md">
                    <span className="text-on-surface-variant">Promo ({appliedPromo.code})</span>
                    <span className="text-secondary">
                      - {formatCheckoutLkr(appliedPromo.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">VAT (8%)</span>
                  <span>{formatCheckoutLkr(checkoutTotals.vat)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-outline pt-2">
                  <span className="font-headline-md text-headline-md">Total</span>
                  <span className="font-headline-md text-headline-md text-primary">
                    {formatCheckoutLkr(checkoutTotals.total)}
                  </span>
                </div>
              </div>
              {checkoutError && (
                <p className="mb-stack-md rounded-lg border border-error/30 bg-error-container/30 px-4 py-3 text-sm text-error">
                  {checkoutError}
                </p>
              )}
              <button
                type="button"
                disabled={completing}
                onClick={handleCompletePurchase}
                className="flex w-full cursor-pointer items-center justify-center gap-stack-md rounded-lg bg-primary py-4 font-headline-md text-on-primary transition-all hover:bg-opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="lock" filled />
                {completing ? "Processing…" : "Complete Purchase"}
              </button>
              <div className="mt-stack-lg space-y-stack-md border-t border-outline-variant pt-stack-md">
                <div className="flex items-center gap-stack-md opacity-70">
                  <Icon name="verified_user" className="text-on-surface-variant" />
                  <span className="font-label-bold text-[11px] uppercase tracking-wider">
                    PCI DSS Compliant Infrastructure
                  </span>
                </div>
                <div className="flex items-center gap-stack-md opacity-70">
                  <Icon name="shield" className="text-on-surface-variant" />
                  <span className="font-label-bold text-[11px] uppercase tracking-wider">
                    256-Bit SSL Encrypted Connection
                  </span>
                </div>
              </div>
              <div className="mt-stack-lg flex items-center gap-4 rounded border border-secondary-container/20 bg-surface-container p-stack-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon name="verified" className="text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-label-bold text-label-sm leading-tight">Institutional Guarantee</p>
                  <p className="text-[10px] text-on-surface-variant">
                    Your transaction is protected by JobsFinder&apos;s enterprise security framework.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </PublicPageLayout>
  );
}
