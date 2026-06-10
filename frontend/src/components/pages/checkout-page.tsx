"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BannerCheckoutFields,
  GuestContactFields,
} from "@/components/pages/pricing/banner-checkout-fields";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { Icon } from "@/components/ui/icon";
import { getAccessToken, getProfile, getStoredUser } from "@/lib/api/auth";
import {
  jobSlotsForPlan,
  recordEmployerPurchase,
  type PurchaseProduct,
} from "@/lib/employer/purchases";
import { cn } from "@/lib/utils";

type PaymentType = "card" | "bank" | "po";

const VAT_RATE = 0.08;

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-bright p-stack-md font-body-md text-body-md outline-none focus:border-primary focus:shadow-[0_0_0_1px_#0d1c2e]";

function formatLkr(amount: number) {
  return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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

  const [paymentType, setPaymentType] = useState<PaymentType>("card");
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
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  const productLabel =
    product === "sponsored-jobs"
      ? "Sponsored Jobs"
      : product === "banner-advertising"
        ? "Banner Advertising"
        : "Job Listings";

  const handleCompletePurchase = () => {
    setCheckoutError(null);
    const user = getStoredUser();
    if (!user?.id) {
      setCheckoutError("Sign in as a recruiter to complete your purchase and track job slots.");
      return;
    }

    setCompleting(true);
    try {
      recordEmployerPurchase({
        userId: user.id,
        product,
        plan,
        duration: duration || undefined,
        total,
        paymentMethod: paymentType,
        jobSlots: product === "job-listings" ? jobSlotsForPlan(plan) : undefined,
      });
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

            <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg">
              <div className="mb-stack-lg flex items-center gap-stack-md">
                <Icon name="business" className="text-secondary" />
                <h1 className="font-headline-md text-headline-md">Billing Information</h1>
              </div>
              <form className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="block font-label-bold text-label-bold">Company Name</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Acme Corp Institutional"
                    type="text"
                    value={isBannerCheckout && !isLoggedIn ? guestCompany : companyName}
                    onChange={(e) =>
                      isBannerCheckout && !isLoggedIn
                        ? setGuestCompany(e.target.value)
                        : setCompanyName(e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block font-label-bold text-label-bold">Headquarters Address</label>
                  <input
                    className={inputClass}
                    placeholder="Street, Building, Suite"
                    type="text"
                    value={isBannerCheckout && !isLoggedIn ? guestAddress : address}
                    onChange={(e) =>
                      isBannerCheckout && !isLoggedIn
                        ? setGuestAddress(e.target.value)
                        : setAddress(e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-label-bold text-label-bold">
                    VAT Number <span className="font-normal text-on-surface-variant">(Optional)</span>
                  </label>
                  <input
                    className={inputClass}
                    placeholder="TAX-1234567"
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-label-bold text-label-bold">Postal Code</label>
                  <input
                    className={inputClass}
                    placeholder="00100"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </form>
            </section>

            <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg">
              <div className="mb-stack-lg flex items-center gap-stack-md">
                <Icon name="payments" className="text-secondary" />
                <h2 className="font-headline-md text-headline-md">Payment Method</h2>
              </div>
              <div className="space-y-stack-md">
                <PaymentOption
                  id="card"
                  selected={paymentType === "card"}
                  onSelect={() => setPaymentType("card")}
                  icon="credit_card"
                  title="Credit / Debit Card"
                  badge={
                    <div className="flex gap-2">
                      <div className="h-5 w-8 rounded-sm bg-outline-variant" />
                      <div className="h-5 w-8 rounded-sm bg-outline-variant" />
                    </div>
                  }
                >
                  <div
                    className={cn(
                      "mt-2 grid grid-cols-1 gap-stack-md md:grid-cols-2",
                      paymentType !== "card" && "hidden",
                    )}
                  >
                    <div className="space-y-2 md:col-span-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">
                        Card Number
                      </label>
                      <input
                        className={inputClass}
                        placeholder="0000 0000 0000 0000"
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">
                        Expiry Date
                      </label>
                      <input className={inputClass} placeholder="MM / YY" type="text" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">CVV</label>
                      <input className={inputClass} placeholder="***" type="password" />
                    </div>
                  </div>
                </PaymentOption>

                <PaymentOption
                  id="bank"
                  selected={paymentType === "bank"}
                  onSelect={() => setPaymentType("bank")}
                  icon="account_balance"
                  title="Local Bank Transfer"
                >
                  <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">
                    Direct wire to our local HNB or Sampath Bank accounts. Details provided after
                    confirmation.
                  </p>
                </PaymentOption>

                <PaymentOption
                  id="po"
                  selected={paymentType === "po"}
                  onSelect={() => setPaymentType("po")}
                  icon="description"
                  title="Institutional Purchase Order (PO)"
                  badge={
                    <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-[10px] font-bold text-on-secondary-fixed">
                      NET-30
                    </span>
                  }
                >
                  <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">
                    For established corporate partners. Subject to credit verification.
                  </p>
                </PaymentOption>
              </div>
            </section>
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
                  <span className="font-label-bold">{formatLkr(subtotal)}</span>
                </div>
              </div>
              <div className="mb-stack-lg space-y-stack-sm border-t border-outline-variant pt-stack-md">
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span>{formatLkr(subtotal)}</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md">
                  <span className="text-on-surface-variant">VAT (8%)</span>
                  <span>{formatLkr(vat)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-outline pt-2">
                  <span className="font-headline-md text-headline-md">Total</span>
                  <span className="font-headline-md text-headline-md text-primary">
                    {formatLkr(total)}
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

function PaymentOption({
  id,
  selected,
  onSelect,
  icon,
  title,
  badge,
  children,
}: {
  id: string;
  selected: boolean;
  onSelect: () => void;
  icon: string;
  title: string;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="relative">
      <input
        checked={selected}
        className="peer sr-only"
        id={id}
        name="payment_type"
        onChange={onSelect}
        type="radio"
      />
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer flex-col rounded-lg border border-outline-variant p-stack-md transition-all hover:bg-surface-container-low",
          selected && "border-secondary bg-surface-container-low",
        )}
      >
        <div className="mb-stack-md flex items-center justify-between">
          <div className="flex items-center gap-stack-md">
            <Icon name={icon} />
            <span className="font-label-bold text-label-bold">{title}</span>
          </div>
          {badge}
        </div>
        {children}
      </label>
    </div>
  );
}
