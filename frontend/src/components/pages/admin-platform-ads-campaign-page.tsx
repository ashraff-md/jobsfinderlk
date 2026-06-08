"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  PromotionScheduleFields,
  inferBannerPromotionDaysFromRange,
  inferSponsoredPromotionDaysFromRange,
  toDateInputValue,
} from "@/components/admin/platform-ads/promotion-schedule-fields";
import { PublishedJobSearchField } from "@/components/admin/platform-ads/published-job-search-field";
import { SelectedJobDetailsCard } from "@/components/admin/platform-ads/selected-job-details-card";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import {
  createAdminBannerCampaign,
  createAdminSponsoredAd,
  getAdminBannerCampaign,
  getAdminBannerSlots,
  getAdminJob,
  getAdminSponsoredAds,
  updateAdminBannerCampaign,
  updateAdminSponsoredAd,
  type BannerAspectRatio,
  type PromotionPeriodDays,
} from "@/lib/api/admin";
import type { Job } from "@/lib/api/types";
import { buildBannerArtworkDraft } from "@/lib/platform-ads/banner-artwork";
import {
  formatBannerDestinationForInput,
  normalizeBannerDestinationUrl,
} from "@/lib/platform-ads/banner-destination";
import { BANNER_SLIDES_PER_POSITION } from "@/lib/platform-ads/banner-rotation";
import { cn } from "@/lib/utils";

type AdTypeKey = "wide" | "tall" | "sponsored";

const BANNER_ASPECT: Record<Exclude<AdTypeKey, "sponsored">, BannerAspectRatio> = {
  wide: "RATIO_3_2",
  tall: "RATIO_2_5",
};

const BANNER_PLACEMENT_NOTE: Record<Exclude<AdTypeKey, "sponsored">, string> = {
  wide: `Upload one banner. It joins the rotation pool for all 3×2 placements (${BANNER_SLIDES_PER_POSITION} shown at a time).`,
  tall: `Upload one banner. It joins the rotation pool for all 2×5 placements (${BANNER_SLIDES_PER_POSITION} shown at a time).`,
};

function FormSection({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
      <h3 className="mb-stack-md flex items-center gap-2 text-headline-md font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-label-bold text-on-primary-container">
          {step}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

const TYPE_LABELS: Record<AdTypeKey, string> = {
  wide: "Banner 3×2",
  tall: "Banner 2×5",
  sponsored: "Sponsored List",
};

export function AdminPlatformAdsCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = (searchParams.get("type") as AdTypeKey | null) ?? "sponsored";
  const adType: AdTypeKey =
    typeParam === "wide" || typeParam === "tall" || typeParam === "sponsored" ? typeParam : "sponsored";
  const jobIdParam = searchParams.get("jobId");
  const sponsoredIdParam = searchParams.get("sponsoredId");
  const bannerCampaignIdParam = searchParams.get("bannerCampaignId");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [campaignName, setCampaignName] = useState("");
  const [destinationPath, setDestinationPath] = useState("/jobs");
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [artworkDataUrl, setArtworkDataUrl] = useState<string | null>(null);
  const [placementCount, setPlacementCount] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [startDate, setStartDate] = useState(toDateInputValue());
  const [promotionDays, setPromotionDays] = useState<PromotionPeriodDays>(7);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const href = useMemo(
    () => normalizeBannerDestinationUrl(destinationPath),
    [destinationPath],
  );

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (adType === "sponsored") {
        let jobId = jobIdParam;
        if (sponsoredIdParam) {
          const ads = await getAdminSponsoredAds();
          const ad = ads.find((a) => a.id === sponsoredIdParam);
          if (ad) {
            jobId = ad.jobId;
            setStartDate(toDateInputValue(ad.startsAt));
            setPromotionDays(inferSponsoredPromotionDaysFromRange(ad.startsAt, ad.endsAt));
          }
        }
        if (jobId) {
          const job = await getAdminJob(jobId);
          if (job.status === "PUBLISHED") setSelectedJob(job);
        }
        return;
      }

      const aspect = BANNER_ASPECT[adType];
      const placements = await getAdminBannerSlots(aspect);
      setPlacementCount(placements.length);

      if (bannerCampaignIdParam) {
        const campaign = await getAdminBannerCampaign(bannerCampaignIdParam);
        setStartDate(toDateInputValue(campaign.startsAt));
        setPromotionDays(inferBannerPromotionDaysFromRange(campaign.startsAt, campaign.endsAt));
        setCampaignName(campaign.label);
        setDestinationPath(formatBannerDestinationForInput(campaign.href));
        if (campaign.imageUrl) setArtworkUrl(campaign.imageUrl);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load campaign data");
    } finally {
      setLoading(false);
    }
  }, [adType, bannerCampaignIdParam, jobIdParam, sponsoredIdParam]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const onArtworkFile = async (file: File) => {
    if (adType === "sponsored") return;
    const draft = await buildBannerArtworkDraft(file, adType);
    setArtworkUrl((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return draft.previewUrl;
    });
    setArtworkDataUrl(draft.dataUrl);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (adType === "sponsored") {
        if (!selectedJob) {
          setError("Search and select an active published job listing.");
          return;
        }
        if (selectedJob.status !== "PUBLISHED") {
          setError("Only published jobs can be sponsored.");
          return;
        }
        if (sponsoredIdParam) {
          await updateAdminSponsoredAd(sponsoredIdParam, {
            startsAt: startDate,
            promotionDays,
          });
        } else {
          await createAdminSponsoredAd({
            jobId: selectedJob.id,
            startsAt: startDate,
            promotionDays,
          });
        }
      } else {
        const image = artworkDataUrl ?? artworkUrl ?? undefined;
        if (!image) {
          setError("Upload banner artwork.");
          return;
        }
        const label = campaignName.trim() || "Campaign banner";
        if (bannerCampaignIdParam) {
          await updateAdminBannerCampaign(bannerCampaignIdParam, {
            label,
            href,
            alt: label,
            startsAt: startDate,
            promotionDays,
            ...(artworkDataUrl ? { imageUrl: artworkDataUrl } : {}),
          });
        } else {
          await createAdminBannerCampaign({
            aspectRatio: BANNER_ASPECT[adType],
            label,
            href,
            alt: label,
            imageUrl: image,
            startsAt: startDate,
            promotionDays,
          });
        }
      }
      router.push("/admin/platform-ads");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save campaign");
    } finally {
      setSubmitting(false);
    }
  };

  const previewImage =
    adType === "sponsored"
      ? selectedJob?.vacancyArtworkUrl ?? selectedJob?.company.logoUrl
      : artworkUrl;

  return (
    <RecruiterAdminShell activeNav="platform-ads">
      <AdminPageCanvas className="md:px-margin-desktop">
        <div className="mb-stack-lg flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-label-sm font-bold uppercase tracking-wide text-secondary">
              {TYPE_LABELS[adType]}
            </p>
            <h1 className="text-headline-lg tracking-tight text-primary">
              {sponsoredIdParam || bannerCampaignIdParam ? "Edit Campaign" : "Create Campaign"}
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              {adType === "sponsored"
                ? "Promote a published job with a fixed schedule."
                : BANNER_PLACEMENT_NOTE[adType]}
            </p>
            {adType !== "sponsored" && placementCount > 0 && (
              <p className="mt-1 text-label-sm font-bold text-secondary">
                {placementCount} on-site placement{placementCount === 1 ? "" : "s"} rotate{" "}
                {BANNER_SLIDES_PER_POSITION} active banners at 6 seconds each
              </p>
            )}
          </div>
          <div className="flex gap-stack-md">
            <Link
              href="/admin/platform-ads"
              className="rounded-lg border border-outline px-6 py-2 font-label-bold transition-colors hover:bg-surface-container"
            >
              Cancel
            </Link>
            <button
              type="button"
              disabled={submitting || loading}
              onClick={() => void submit()}
              className="rounded-lg bg-primary px-6 py-2 font-label-bold text-on-primary shadow-lg shadow-primary/10 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Schedule Campaign"}
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-stack-md rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-body-sm text-error">
            {error}
          </p>
        )}

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 space-y-8 lg:col-span-8">
            {adType === "sponsored" ? (
              <FormSection step={1} title="Sponsored job">
                <div className="space-y-stack-md">
                  <PublishedJobSearchField
                    selectedJob={selectedJob}
                    onSelect={setSelectedJob}
                    onClear={() => setSelectedJob(null)}
                    disabled={Boolean(sponsoredIdParam)}
                  />
                  {selectedJob && <SelectedJobDetailsCard job={selectedJob} />}
                  <PromotionScheduleFields
                    mode="sponsored"
                    startDate={startDate}
                    onStartDateChange={setStartDate}
                    promotionDays={promotionDays}
                    onPromotionDaysChange={setPromotionDays}
                  />
                </div>
              </FormSection>
            ) : (
              <>
                <FormSection step={1} title="Campaign details">
                  <div className="space-y-stack-md">
                    <label className="block">
                      <span className="mb-2 block font-label-bold">Campaign name</span>
                      <input
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="e.g., Q4 Tech hiring banner"
                        className="w-full rounded-lg border border-outline-variant p-3 text-body-md focus:border-secondary focus:outline-none"
                      />
                    </label>
                    <PromotionScheduleFields
                      mode="banner"
                      startDate={startDate}
                      onStartDateChange={setStartDate}
                      promotionDays={promotionDays}
                      onPromotionDaysChange={setPromotionDays}
                    />
                  </div>
                </FormSection>

                <FormSection step={2} title="Banner creative">
                  <div className="space-y-stack-md">
                    <p className="text-label-sm text-on-surface-variant">
                      Upload one banner image. On the site, each placement picks{" "}
                      {BANNER_SLIDES_PER_POSITION} different active campaigns from the pool and
                      rotates them every 6 seconds for equal exposure.
                    </p>
                    <div>
                      <span className="mb-2 block font-label-bold">Banner artwork</span>
                      <div
                        role="button"
                        tabIndex={0}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          const file = e.dataTransfer.files[0];
                          if (file) void onArtworkFile(file).catch((err) => setError(String(err)));
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                        className={cn(
                          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant p-10 transition-colors hover:bg-surface-container-low",
                          dragOver && "border-secondary bg-secondary/5",
                        )}
                      >
                        <Icon name="cloud_upload" className="mb-4 text-5xl text-outline" />
                        <p className="font-label-bold">Drag and drop your file here</p>
                        <p className="mt-1 text-label-sm text-on-surface-variant">
                          {adType === "wide"
                            ? "3×2 ratio recommended (e.g. 1200×800px). JPEG, PNG, or WebP up to 5MB."
                            : "2×5 ratio recommended. JPEG, PNG, or WebP up to 5MB."}
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void onArtworkFile(file).catch((err) => setError(String(err)));
                          }}
                        />
                      </div>
                      {artworkUrl && (
                        <div
                          className={cn(
                            "relative mt-4 max-w-md overflow-hidden rounded-lg",
                            adType === "wide" ? "aspect-[3/2]" : "aspect-[2/5]",
                          )}
                        >
                          <Image src={artworkUrl} alt="Preview" fill className="object-cover" unoptimized />
                        </div>
                      )}
                    </div>
                    <label className="block">
                      <span className="mb-2 block font-label-bold">Destination URL</span>
                      <input
                        value={destinationPath}
                        onChange={(e) => setDestinationPath(e.target.value)}
                        placeholder="https://yourcompany.com/careers or /jobs"
                        type="text"
                        className="w-full rounded-lg border border-outline-variant p-3 text-body-md focus:border-secondary focus:outline-none"
                      />
                      <p className="mt-2 text-label-sm text-on-surface-variant">
                        Internal pages or external HTTPS links are supported.
                      </p>
                    </label>
                  </div>
                </FormSection>
              </>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-28">
              <div className="overflow-hidden rounded-2xl bg-primary-container p-stack-lg text-on-primary-container shadow-xl">
                <h4 className="mb-6 flex items-center gap-2 text-label-bold uppercase tracking-widest opacity-80">
                  <Icon name="visibility" className="text-[16px]" />
                  Live Ad Preview
                </h4>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-surface-container-lowest p-1">
                  {adType === "sponsored" && selectedJob ? (
                    <div className="rounded-lg bg-white p-4">
                      {previewImage && (
                        <div className="relative mb-3 aspect-[3/2] overflow-hidden rounded-lg">
                          <Image src={previewImage} alt="" fill className="object-cover" unoptimized />
                          <span className="absolute left-3 top-3 rounded bg-primary/80 px-2 py-1 text-[10px] font-bold text-on-primary">
                            SPONSORED
                          </span>
                        </div>
                      )}
                      <h5 className="text-lg font-label-bold text-primary">{selectedJob.title}</h5>
                      <p className="mt-2 line-clamp-2 text-label-sm text-on-surface-variant">
                        {selectedJob.company.name}
                        {selectedJob.city ? ` · ${selectedJob.city}` : ""}
                      </p>
                    </div>
                  ) : previewImage ? (
                    <div
                      className={cn(
                        "relative w-full",
                        adType === "wide" ? "aspect-[3/2]" : "aspect-[2/5]",
                      )}
                    >
                      <Image src={previewImage} alt="" fill className="rounded-lg object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="flex aspect-[3/2] items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                      Upload artwork
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
