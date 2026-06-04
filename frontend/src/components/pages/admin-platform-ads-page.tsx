"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import {
  createAdminSponsoredAd,
  deleteAdminSponsoredAd,
  getAdminBannerSlots,
  getAdminJobs,
  getAdminSponsoredAds,
  patchAdminSponsoredAd,
  reorderAdminSponsoredAds,
  updateAdminBannerSlot,
  type AdminBannerSlot,
  type AdminBannerSlide,
  type AdminSponsoredAd,
} from "@/lib/api/admin";
import type { BannerAspectRatio, Job } from "@/lib/api/types";
import { buildCompanyLogoDraft } from "@/lib/companies/company-logo";
import { cn } from "@/lib/utils";

type AdsTab = "wide" | "tall" | "sponsored";

const TAB_ASPECT: Record<Exclude<AdsTab, "sponsored">, BannerAspectRatio> = {
  wide: "RATIO_3_2",
  tall: "RATIO_2_5",
};

const TAB_LABELS: Record<AdsTab, string> = {
  wide: "Banner ads (3:2)",
  tall: "Banner ads (2:5)",
  sponsored: "Sponsored jobs",
};

function emptySlide(): AdminBannerSlide {
  return { href: "/jobs", alt: "", imageUrl: "" };
}

function normalizeSlides(slides: AdminBannerSlide[]): AdminBannerSlide[] {
  const sorted = [...slides].sort((a, b) => (a as { sortOrder?: number }).sortOrder ?? 0);
  while (sorted.length < 3) sorted.push(emptySlide());
  return sorted.slice(0, 3);
}

export function AdminPlatformAdsPage() {
  const [tab, setTab] = useState<AdsTab>("wide");
  const [slots, setSlots] = useState<AdminBannerSlot[]>([]);
  const [sponsored, setSponsored] = useState<AdminSponsoredAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [draftSlides, setDraftSlides] = useState<AdminBannerSlide[]>([]);
  const [savingSlot, setSavingSlot] = useState(false);
  const [jobQuery, setJobQuery] = useState("");
  const [jobResults, setJobResults] = useState<Job[]>([]);
  const [jobSearchLoading, setJobSearchLoading] = useState(false);
  const [sponsoredBusy, setSponsoredBusy] = useState(false);

  const loadBanners = useCallback(async (aspect: BannerAspectRatio) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminBannerSlots(aspect);
      setSlots(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load banner slots");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSponsored = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminSponsoredAds();
      setSponsored(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sponsored ads");
      setSponsored([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "sponsored") {
      void loadSponsored();
      return;
    }
    void loadBanners(TAB_ASPECT[tab]);
  }, [tab, loadBanners, loadSponsored]);

  const startEditSlot = (slot: AdminBannerSlot) => {
    setEditingSlotId(slot.id);
    setDraftSlides(normalizeSlides(slot.slides));
  };

  const saveSlot = async (slot: AdminBannerSlot) => {
    setSavingSlot(true);
    setError(null);
    try {
      const updated = await updateAdminBannerSlot(slot.id, {
        slides: draftSlides.map((slide) => ({
          href: slide.href,
          alt: slide.alt,
          imageUrl: slide.imageUrl ?? undefined,
        })),
      });
      setSlots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSlotId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save banner");
    } finally {
      setSavingSlot(false);
    }
  };

  const toggleSlotActive = async (slot: AdminBannerSlot) => {
    try {
      const updated = await updateAdminBannerSlot(slot.id, { active: !slot.active });
      setSlots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update slot");
    }
  };

  const onSlideImage = async (index: number, file: File) => {
    try {
      const draft = await buildCompanyLogoDraft(file);
      setDraftSlides((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], imageUrl: draft.dataUrl };
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid image");
    }
  };

  const searchJobs = async () => {
    const q = jobQuery.trim();
    if (q.length < 2) return;
    setJobSearchLoading(true);
    try {
      const res = await getAdminJobs({ q, status: "PUBLISHED", limit: 8 });
      const sponsoredIds = new Set(sponsored.map((a) => a.jobId));
      setJobResults(res.items.filter((j) => !sponsoredIds.has(j.id)));
    } catch {
      setJobResults([]);
    } finally {
      setJobSearchLoading(false);
    }
  };

  const addSponsored = async (jobId: string) => {
    setSponsoredBusy(true);
    setError(null);
    try {
      const list = await createAdminSponsoredAd(jobId);
      setSponsored(list);
      setJobResults((prev) => prev.filter((j) => j.id !== jobId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add sponsored job");
    } finally {
      setSponsoredBusy(false);
    }
  };

  const moveSponsored = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sponsored.length) return;
    const jobIds = sponsored.map((a) => a.jobId);
    [jobIds[index], jobIds[target]] = [jobIds[target], jobIds[index]];
    setSponsoredBusy(true);
    try {
      const list = await reorderAdminSponsoredAds(jobIds);
      setSponsored(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reorder");
    } finally {
      setSponsoredBusy(false);
    }
  };

  const toggleSponsoredActive = async (ad: AdminSponsoredAd) => {
    setSponsoredBusy(true);
    try {
      const list = await patchAdminSponsoredAd(ad.id, !ad.active);
      setSponsored(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update sponsored ad");
    } finally {
      setSponsoredBusy(false);
    }
  };

  const removeSponsored = async (id: string) => {
    setSponsoredBusy(true);
    try {
      const list = await deleteAdminSponsoredAd(id);
      setSponsored(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove sponsored ad");
    } finally {
      setSponsoredBusy(false);
    }
  };

  return (
    <RecruiterAdminShell activeNav="platform-ads">
      <AdminPageCanvas className="md:px-margin-desktop">
        <div className="mb-stack-lg">
          <h1 className="text-headline-lg tracking-tight text-primary">Platform Ads</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Manage homepage and jobs page banner carousels (3 slides each) and sponsored job
            placements.
          </p>
        </div>

        <div className="mb-stack-md flex flex-wrap gap-2 border-b border-outline-variant pb-4">
          {(Object.keys(TAB_LABELS) as AdsTab[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "rounded-lg px-4 py-2 text-label-sm font-bold transition-colors",
                tab === key
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
              )}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-stack-md rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-body-sm text-error">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-body-md text-on-surface-variant">Loading…</p>
        ) : tab === "sponsored" ? (
          <div className="space-y-stack-lg">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
              <h2 className="mb-4 text-title-md text-primary">Add sponsored job</h2>
              <div className="flex flex-wrap gap-3">
                <input
                  type="search"
                  value={jobQuery}
                  onChange={(e) => setJobQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void searchJobs()}
                  placeholder="Search published jobs by title…"
                  className="min-w-[240px] flex-1 rounded-lg border border-outline-variant bg-surface-bright px-4 py-2 text-body-md"
                />
                <button
                  type="button"
                  disabled={jobSearchLoading}
                  onClick={() => void searchJobs()}
                  className="rounded-lg bg-primary px-5 py-2 font-label-bold text-on-primary disabled:opacity-50"
                >
                  Search
                </button>
              </div>
              {jobResults.length > 0 && (
                <ul className="mt-4 divide-y divide-outline-variant rounded-lg border border-outline-variant">
                  {jobResults.map((job) => (
                    <li
                      key={job.id}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div>
                        <p className="font-label-bold text-primary">{job.title}</p>
                        <p className="text-label-sm text-on-surface-variant">
                          {job.company.name}
                          {job.city ? ` · ${job.city}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={sponsoredBusy}
                        onClick={() => void addSponsored(job.id)}
                        className="rounded-lg border border-primary px-3 py-1.5 text-label-sm font-bold text-primary hover:bg-primary/5 disabled:opacity-50"
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    {["Job", "Company", "Order", "Active", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-label-sm uppercase tracking-widest text-on-surface-variant"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {sponsored.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-body-md text-on-surface-variant">
                        No sponsored jobs yet. Search above to add published listings.
                      </td>
                    </tr>
                  ) : (
                    sponsored.map((ad, index) => (
                      <tr key={ad.id} className="hover:bg-surface-container-low">
                        <td className="px-6 py-4 font-label-bold text-primary">{ad.job.title}</td>
                        <td className="px-6 py-4 text-body-sm">{ad.job.company.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              disabled={sponsoredBusy || index === 0}
                              onClick={() => void moveSponsored(index, -1)}
                              className="rounded p-1 hover:bg-surface-container disabled:opacity-30"
                              aria-label="Move up"
                            >
                              <Icon name="arrow_upward" className="text-[18px]" />
                            </button>
                            <button
                              type="button"
                              disabled={sponsoredBusy || index === sponsored.length - 1}
                              onClick={() => void moveSponsored(index, 1)}
                              className="rounded p-1 hover:bg-surface-container disabled:opacity-30"
                              aria-label="Move down"
                            >
                              <Icon name="arrow_downward" className="text-[18px]" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            disabled={sponsoredBusy}
                            onClick={() => void toggleSponsoredActive(ad)}
                            className={cn(
                              "rounded-full px-3 py-1 text-label-sm font-bold",
                              ad.active
                                ? "bg-secondary/15 text-secondary"
                                : "bg-surface-container text-on-surface-variant",
                            )}
                          >
                            {ad.active ? "On" : "Off"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            disabled={sponsoredBusy}
                            onClick={() => void removeSponsored(ad.id)}
                            className="text-label-sm font-bold text-error hover:underline disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-title-md text-primary">{slot.label}</h2>
                    <p className="mt-1 font-mono text-label-sm text-on-surface-variant">
                      {slot.key}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleSlotActive(slot)}
                      className={cn(
                        "rounded-full px-3 py-1 text-label-sm font-bold",
                        slot.active
                          ? "bg-secondary/15 text-secondary"
                          : "bg-surface-container text-on-surface-variant",
                      )}
                    >
                      {slot.active ? "Slot active" : "Slot inactive"}
                    </button>
                    {editingSlotId !== slot.id ? (
                      <button
                        type="button"
                        onClick={() => startEditSlot(slot)}
                        className="rounded-lg bg-primary px-4 py-2 font-label-bold text-on-primary"
                      >
                        Edit slides
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={savingSlot}
                          onClick={() => void saveSlot(slot)}
                          className="rounded-lg bg-primary px-4 py-2 font-label-bold text-on-primary disabled:opacity-50"
                        >
                          {savingSlot ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSlotId(null)}
                          className="rounded-lg border border-outline-variant px-4 py-2 font-label-bold"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingSlotId === slot.id ? (
                  <div className="grid gap-6 md:grid-cols-3">
                    {draftSlides.map((slide, slideIndex) => (
                      <div
                        key={slideIndex}
                        className="space-y-3 rounded-lg border border-outline-variant p-4"
                      >
                        <p className="text-label-sm font-bold uppercase text-on-surface-variant">
                          Slide {slideIndex + 1}
                        </p>
                        {slide.imageUrl ? (
                          <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-surface-container">
                            <Image
                              src={slide.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex aspect-[3/2] items-center justify-center rounded-lg bg-surface-container text-label-sm text-on-surface-variant">
                            No image
                          </div>
                        )}
                        <label className="block">
                          <span className="text-label-sm text-on-surface-variant">Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="mt-1 block w-full text-label-sm"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void onSlideImage(slideIndex, file);
                            }}
                          />
                        </label>
                        <label className="block">
                          <span className="text-label-sm text-on-surface-variant">Link (href)</span>
                          <input
                            value={slide.href}
                            onChange={(e) =>
                              setDraftSlides((prev) => {
                                const next = [...prev];
                                next[slideIndex] = { ...next[slideIndex], href: e.target.value };
                                return next;
                              })
                            }
                            className="mt-1 w-full rounded border border-outline-variant px-3 py-2 text-body-sm"
                          />
                        </label>
                        <label className="block">
                          <span className="text-label-sm text-on-surface-variant">Alt text</span>
                          <input
                            value={slide.alt}
                            onChange={(e) =>
                              setDraftSlides((prev) => {
                                const next = [...prev];
                                next[slideIndex] = { ...next[slideIndex], alt: e.target.value };
                                return next;
                              })
                            }
                            className="mt-1 w-full rounded border border-outline-variant px-3 py-2 text-body-sm"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {normalizeSlides(slot.slides).map((slide, i) => (
                      <div key={i} className="overflow-hidden rounded-lg border border-outline-variant">
                        {slide.imageUrl ? (
                          <div className="relative aspect-[3/2]">
                            <Image
                              src={slide.imageUrl}
                              alt={slide.alt}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="aspect-[3/2] bg-surface-container" />
                        )}
                        <p className="truncate px-3 py-2 text-label-sm">{slide.alt || slide.href}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
