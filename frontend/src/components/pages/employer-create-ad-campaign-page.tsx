"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckoutBillingFields } from "@/components/checkout/checkout-billing-fields";
import { CheckoutPaymentMethods } from "@/components/checkout/checkout-payment-methods";
import { CheckoutPromoCodeSection } from "@/components/checkout/checkout-promo-code-section";
import { Icon } from "@/components/ui/icon";
import { getProfile } from "@/lib/api/auth";
import { recordEmployerPurchaseApi } from "@/lib/api/employer-billing";
import { getEmployerJobs } from "@/lib/api/jobs";
import type { EmployerJob } from "@/lib/api/types";
import {
  calculateCheckoutTotal,
  formatCheckoutLkr,
  type AppliedPromoCode,
  type CheckoutPaymentType,
} from "@/lib/checkout/checkout-utils";
import type { EmployerAdCampaignPayload } from "@/lib/api/employer-billing";
import {
  adTypeLabel,
  calculateCampaignTotal,
  campaignPurchaseMeta,
  campaignStartsAtIso,
  EMPLOYER_DURATION_OPTIONS,
  type EmployerAdType,
  type EmployerDurationDays,
} from "@/lib/employer/employer-campaigns";
import {
  bannerArtworkSizeHint,
  buildBannerArtworkDraft,
} from "@/lib/platform-ads/banner-artwork";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 4;

const AD_TYPE_OPTIONS: {
  type: EmployerAdType;
  label: string;
  sub: string;
  aspect?: "wide" | "tall";
}[] = [
  { type: "sponsored", label: "Sponsored Job", sub: "Top of search results" },
  { type: "banner-wide", label: "Display Banner", sub: "Sidebar placement (3:2)", aspect: "wide" },
  { type: "banner-tall", label: "Leaderboard Ad", sub: "Content flow (2:5)", aspect: "tall" },
];

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md outline-none transition-all focus:border-primary";

export function EmployerCreateAdCampaignPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [adType, setAdType] = useState<EmployerAdType>("sponsored");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [durationDays, setDurationDays] = useState<EmployerDurationDays>(30);
  const [complianceAccepted, setComplianceAccepted] = useState(false);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkDataUrl, setArtworkDataUrl] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentType, setPaymentType] = useState<CheckoutPaymentType>("card");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromoCode | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    getEmployerJobs()
      .then((list) => setJobs(list))
      .catch(() => setJobs([]));
  }, []);

  useEffect(() => {
    if (step !== TOTAL_STEPS) return;
    void getProfile()
      .then((profile) => {
        const employer = profile.employerUsers?.[0];
        if (employer?.company.name) setCompanyName(employer.company.name);
      })
      .catch(() => undefined);
  }, [step]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) ?? jobs[0],
    [jobs, selectedJobId],
  );

  const pricing = useMemo(
    () => calculateCampaignTotal(adType, durationDays),
    [adType, durationDays],
  );

  const checkoutTotals = useMemo(
    () => calculateCheckoutTotal(pricing.total, appliedPromo?.discountAmount ?? 0),
    [appliedPromo?.discountAmount, pricing.total],
  );

  useEffect(() => {
    setAppliedPromo(null);
  }, [adType, durationDays, pricing.total]);

  const purchaseMeta = useMemo(
    () => campaignPurchaseMeta({ adType, days: durationDays, campaignName }),
    [adType, campaignName, durationDays],
  );

  const previewAspect = adType === "banner-tall" ? "tall" : "wide";
  const previewTitle = selectedJob?.title ?? (campaignName || "Senior React Engineer");
  const previewCompany = selectedJob?.company?.name ?? "Your Company";
  const previewLocation = selectedJob?.location ?? selectedJob?.city ?? "Colombo";

  const onArtworkFile = async (file: File) => {
    setError(null);
    try {
      const aspect = adType === "banner-tall" ? "tall" : "wide";
      const draft = await buildBannerArtworkDraft(file, aspect);
      setArtworkPreview((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return draft.previewUrl;
      });
      setArtworkDataUrl(draft.dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not process banner image.");
    }
  };

  const validateStep = (targetStep: number): boolean => {
    if (targetStep > 1 && !campaignName.trim()) {
      setError("Enter a campaign name to continue.");
      return false;
    }
    if (targetStep > 2) {
      if (adType === "sponsored" && !selectedJob) {
        setError("Select a job to sponsor.");
        return false;
      }
      if (adType !== "sponsored" && !artworkDataUrl) {
        setError("Upload banner artwork to continue.");
        return false;
      }
    }
    if (targetStep > 3 && !complianceAccepted) {
      setError("Please accept the institutional verification statement.");
      return false;
    }
    setError(null);
    return true;
  };

  const goToStep = (next: number) => {
    if (next > step && !validateStep(next)) return;
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const proceedToPayment = () => {
    if (!complianceAccepted) {
      setError("Please accept the institutional verification statement.");
      return;
    }
    goToStep(TOTAL_STEPS);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== TOTAL_STEPS) return;
    if (!validateStep(TOTAL_STEPS)) return;

    setCompleting(true);
    setError(null);
    try {
      const startsAt = campaignStartsAtIso();
      const adCampaign: EmployerAdCampaignPayload =
        adType === "sponsored"
          ? {
              jobId: selectedJob!.id,
              promotionDays: durationDays,
              startsAt,
            }
          : {
              aspectRatio: adType === "banner-wide" ? "RATIO_3_2" : "RATIO_2_5",
              label: campaignName.trim(),
              href: destinationUrl.trim() || "/jobs",
              imageUrl: artworkDataUrl!,
              promotionDays: durationDays,
              startsAt,
            };

      await recordEmployerPurchaseApi({
        product: purchaseMeta.product,
        plan: purchaseMeta.plan,
        duration: purchaseMeta.duration,
        subtotal: pricing.total,
        total: checkoutTotals.total,
        promoCode: appliedPromo?.code,
        paymentMethod: paymentType,
        adCampaign,
      });
      window.dispatchEvent(new Event("employer-purchases-updated"));
      router.push("/employer/ads");
    } catch {
      setError("Could not complete your purchase. Please try again.");
      setCompleting(false);
    }
  };

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-[14px] text-on-surface-variant">
            <Link href="/employer/ads" className="hover:text-secondary">
              Campaigns
            </Link>
            <Icon name="chevron_right" className="text-[16px]" />
            <span className="font-bold text-primary">New Ad Submission</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-primary">Create New Campaign</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface text-[12px] font-bold",
                  step >= n
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-highest text-on-surface-variant",
                )}
              >
                {n}
              </div>
            ))}
          </div>
          <span className="font-label-bold text-label-bold text-on-surface-variant">
            {TOTAL_STEPS} Steps to Launch
          </span>
        </div>
      </header>

      {error && (
        <p className="mb-stack-md rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-body-sm text-error">
          {error}
        </p>
      )}

      <div className="grid grid-cols-12 items-start gap-6">
        <div className="col-span-12 space-y-6 lg:col-span-8">
          <form className="space-y-6" onSubmit={onSubmit}>
            {step === 1 && (
              <section className="space-y-6">
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                  <h3 className="mb-stack-md font-headline-md text-headline-md">Campaign Essentials</h3>
                  <div className="space-y-stack-md">
                    <div>
                      <label className="mb-2 block font-label-bold text-label-bold">
                        Campaign Name
                      </label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Q4 Executive Hiring Drive"
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                      />
                      <p className="mt-1 text-[12px] text-on-surface-variant">
                        Used for internal tracking and reporting only.
                      </p>
                    </div>

                    <div>
                      <p className="mb-4 font-label-bold text-label-bold">Ad Format Selection</p>
                      <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-3">
                        {AD_TYPE_OPTIONS.map((option) => {
                          const selected = adType === option.type;
                          return (
                            <button
                              key={option.type}
                              type="button"
                              onClick={() => {
                                setAdType(option.type);
                                setArtworkPreview((current) => {
                                  if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
                                  return null;
                                });
                                setArtworkDataUrl(null);
                              }}
                              className={cn(
                                "rounded-xl border-2 p-4 text-left transition-all hover:border-secondary",
                                selected
                                  ? "border-secondary bg-secondary/5"
                                  : "border-outline-variant",
                              )}
                            >
                              <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-surface-container">
                                {option.type === "sponsored" ? (
                                  <div className="w-4/5 rounded border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
                                    <div className="mb-2 h-2 w-12 rounded bg-secondary" />
                                    <div className="mb-1 h-1 w-full rounded bg-outline-variant" />
                                    <div className="h-1 w-2/3 rounded bg-outline-variant" />
                                  </div>
                                ) : option.type === "banner-wide" ? (
                                  <div className="flex h-24 w-16 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest shadow-sm">
                                    <span className="text-[10px] font-bold text-outline">3 × 2</span>
                                  </div>
                                ) : (
                                  <div className="flex h-12 w-32 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest shadow-sm">
                                    <span className="text-[10px] font-bold text-outline">2 × 5</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-center font-label-bold text-label-bold">
                                {option.label}
                              </p>
                              <p className="text-center text-[11px] text-on-surface-variant">
                                {option.sub}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-label-bold text-label-bold text-on-primary transition-all hover:opacity-90"
                  >
                    Next: Content &amp; Media
                    <Icon name="arrow_forward" />
                  </button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-6">
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                  <h3 className="mb-stack-md font-headline-md text-headline-md">
                    Ad Assets &amp; Content
                  </h3>
                  <div className="space-y-stack-lg">
                    {adType === "sponsored" ? (
                      <div>
                        <label className="mb-2 block font-label-bold text-label-bold">
                          Job to Sponsor
                        </label>
                        <select
                          className={inputClass}
                          value={selectedJobId || selectedJob?.id || ""}
                          onChange={(e) => setSelectedJobId(e.target.value)}
                        >
                          {jobs.length === 0 ? (
                            <option value="">No published jobs available</option>
                          ) : (
                            jobs.map((job) => (
                              <option key={job.id} value={job.id}>
                                {job.title}
                              </option>
                            ))
                          )}
                        </select>
                        {jobs.length === 0 && (
                          <p className="mt-2 text-[12px] text-on-surface-variant">
                            <Link
                              href="/employer/jobs/new"
                              className="font-label-bold text-secondary hover:underline"
                            >
                              Post a job
                            </Link>{" "}
                            before creating a sponsored campaign.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="mb-4 font-label-bold text-label-bold">Artwork Upload</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void onArtworkFile(file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low p-stack-lg text-center transition-all hover:bg-surface-container-high"
                        >
                          <Icon
                            name="cloud_upload"
                            className="mb-2 text-[48px] text-on-surface-variant"
                          />
                          <p className="font-label-bold text-label-bold">
                            Drag and drop your ad artwork
                          </p>
                          <p className="mt-1 text-[12px] text-on-surface-variant">
                            {bannerArtworkSizeHint(adType === "banner-tall" ? "tall" : "wide")}
                          </p>
                          <span className="mt-4 inline-block rounded border border-primary px-6 py-2 font-label-bold text-label-bold text-primary">
                            Browse Files
                          </span>
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block font-label-bold text-label-bold">
                        Destination URL
                      </label>
                      <input
                        className={inputClass}
                        placeholder="https://careers.company.com/job-123 or /jobs"
                        type="text"
                        value={destinationUrl}
                        onChange={(e) => setDestinationUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="flex items-center gap-2 rounded-lg bg-surface-container px-8 py-3 font-label-bold text-label-bold text-on-surface transition-all hover:bg-surface-container-high"
                  >
                    <Icon name="arrow_back" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-label-bold text-label-bold text-on-primary transition-all hover:opacity-90"
                  >
                    Next: Duration &amp; Billing
                    <Icon name="arrow_forward" />
                  </button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-6">
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                  <h3 className="mb-stack-md font-headline-md text-headline-md">Campaign Duration</h3>
                  <div className="grid grid-cols-2 gap-stack-sm sm:grid-cols-4">
                    {EMPLOYER_DURATION_OPTIONS.map((days) => {
                      const selected = durationDays === days;
                      return (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setDurationDays(days)}
                          className={cn(
                            "rounded-lg border p-4 text-center transition-all",
                            selected
                              ? "border-2 border-secondary bg-surface-container-high"
                              : "border-outline-variant hover:bg-surface-container-low",
                          )}
                        >
                          <p
                            className={cn(
                              "font-headline-md text-headline-md",
                              selected && "text-secondary",
                            )}
                          >
                            {days}
                          </p>
                          <p
                            className={cn(
                              "text-[12px] font-label-bold uppercase",
                              selected && "text-secondary",
                            )}
                          >
                            Days
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-[14px] text-on-surface-variant">
                    <Icon name="info" className="text-[18px]" />
                    Long-term campaigns (30+ days) qualify for a 15% institutional discount.
                  </p>
                </div>

                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                  <h3 className="mb-4 font-headline-md text-headline-md">
                    Institutional Verification
                  </h3>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={complianceAccepted}
                      onChange={(e) => setComplianceAccepted(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-outline-variant accent-primary"
                    />
                    <span className="font-body-md text-body-md text-on-surface">
                      I certify that this advertisement complies with the national recruitment
                      guidelines and fair hiring practices.
                    </span>
                  </label>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="flex items-center gap-2 rounded-lg bg-surface-container px-8 py-3 font-label-bold text-label-bold text-on-surface transition-all hover:bg-surface-container-high"
                  >
                    <Icon name="arrow_back" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={proceedToPayment}
                    className="flex items-center gap-2 rounded-lg bg-primary px-12 py-3 font-label-bold text-label-bold text-on-primary transition-all hover:opacity-90"
                  >
                    Proceed to Payment
                    <Icon name="payments" />
                  </button>
                </div>
              </section>
            )}

            {step === TOTAL_STEPS && (
              <section className="space-y-6">
                <CheckoutPromoCodeSection
                  product={purchaseMeta.product}
                  subtotal={pricing.total}
                  appliedPromo={appliedPromo}
                  onAppliedPromoChange={setAppliedPromo}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm"
                />

                <CheckoutBillingFields
                  companyName={companyName}
                  onCompanyNameChange={setCompanyName}
                  address={address}
                  onAddressChange={setAddress}
                  vatNumber={vatNumber}
                  onVatNumberChange={setVatNumber}
                  postalCode={postalCode}
                  onPostalCodeChange={setPostalCode}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm"
                />

                <CheckoutPaymentMethods
                  paymentType={paymentType}
                  onPaymentTypeChange={setPaymentType}
                  idPrefix="employer-"
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm"
                />

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="flex items-center gap-2 rounded-lg bg-surface-container px-8 py-3 font-label-bold text-label-bold text-on-surface transition-all hover:bg-surface-container-high"
                  >
                    <Icon name="arrow_back" />
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={completing}
                    className="flex items-center gap-2 rounded-lg bg-primary px-12 py-3 font-label-bold text-label-bold text-on-primary transition-all hover:opacity-90 disabled:opacity-60"
                  >
                    <Icon name="lock" filled />
                    {completing ? "Processing…" : "Complete Purchase"}
                  </button>
                </div>
              </section>
            )}
          </form>
        </div>

        <aside className="col-span-12 space-y-6 lg:col-span-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low p-stack-md">
              <span className="flex items-center gap-2 font-label-bold text-label-bold">
                <Icon name="visibility" className="text-[18px]" />
                Live Preview
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {adType === "banner-tall"
                  ? "2×5 Format"
                  : adType === "banner-wide"
                    ? "3×2 Format"
                    : "Sponsored"}
              </span>
            </div>
            <div className="p-stack-lg">
              <div
                className={cn(
                  "relative overflow-hidden rounded-lg border border-outline bg-surface-container-high",
                  previewAspect === "tall" ? "aspect-[2/5]" : "aspect-[3/2]",
                )}
              >
                {artworkPreview ? (
                  <Image
                    src={artworkPreview}
                    alt="Ad preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary/80 to-transparent p-4">
                    <h4 className="text-[18px] font-bold text-on-primary">{previewTitle}</h4>
                    <p className="text-[12px] text-on-primary/80">
                      {previewCompany} | {previewLocation}
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-stack-md text-center text-[12px] italic text-on-surface-variant">
                How your ad will appear to top candidates
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="border-b border-outline-variant bg-primary p-stack-md text-on-primary">
              <h3 className="font-label-bold text-label-bold">Investment Summary</h3>
            </div>
            <div className="space-y-4 p-stack-lg">
              <div className="flex items-center justify-between text-body-md">
                <span className="text-on-surface-variant">Ad Type: {adTypeLabel(adType)}</span>
                <span className="font-bold text-primary">LKR {pricing.base.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-body-md">
                <span className="text-on-surface-variant">Duration: {durationDays} Days</span>
                <span className="font-bold text-primary">—</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex items-center justify-between text-body-md">
                  <span className="text-on-surface-variant">Institutional Discount (15%)</span>
                  <span className="font-bold text-secondary">
                    - LKR {pricing.discount.toLocaleString()}
                  </span>
                </div>
              )}
              {step === TOTAL_STEPS && (
                <>
                  {appliedPromo && (
                    <div className="flex items-center justify-between text-body-md">
                      <span className="text-on-surface-variant">
                        Promo ({appliedPromo.code})
                      </span>
                      <span className="font-bold text-secondary">
                        - {formatCheckoutLkr(appliedPromo.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-body-md">
                    <span className="text-on-surface-variant">VAT (8%)</span>
                    <span className="font-bold text-primary">
                      {formatCheckoutLkr(checkoutTotals.vat)}
                    </span>
                  </div>
                </>
              )}
              <div className="my-2 h-px bg-outline-variant" />
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[12px] font-bold uppercase leading-none tracking-wider text-on-surface-variant">
                    {step === TOTAL_STEPS ? "Total Due" : "Total Investment"}
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    {step === TOTAL_STEPS ? "Incl. VAT" : "Excl. VAT until payment"}
                  </p>
                </div>
                <p className="font-headline-md text-headline-md text-primary">
                  {formatCheckoutLkr(
                    step === TOTAL_STEPS ? checkoutTotals.total : pricing.total,
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-secondary/20 bg-secondary-container/10 p-stack-lg">
            <Icon name="support_agent" className="text-secondary" />
            <div>
              <p className="font-label-bold text-label-bold text-secondary">Need creative help?</p>
              <p className="text-[12px] text-on-surface-variant">
                Our institutional design team can help format your artwork for maximum conversion.{" "}
                <Link href="/contact" className="font-bold text-secondary hover:underline">
                  Contact Account Manager
                </Link>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
