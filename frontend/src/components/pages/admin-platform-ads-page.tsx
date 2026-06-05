"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAdTypeModal } from "@/components/admin/platform-ads/admin-ad-type-modal";
import { CampaignStatusBadge } from "@/components/admin/platform-ads/campaign-status-badge";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import {
  getAdminBannerCampaigns,
  getAdminSponsoredAds,
  type AdminBannerCampaign,
  type AdminSponsoredAd,
} from "@/lib/api/admin";
import type { CampaignStatus, PlatformCampaignRow } from "@/lib/platform-ads/admin-config";
import {
  formatPromotionEndDate,
  formatScheduleRange,
  sponsoredScheduleStatus,
} from "@/lib/platform-ads/sponsored-schedule";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatViews(count: number) {
  return count.toLocaleString();
}

function buildCampaignRows(
  bannerCampaigns: AdminBannerCampaign[],
  sponsored: AdminSponsoredAd[],
): PlatformCampaignRow[] {
  const bannerRows: PlatformCampaignRow[] = bannerCampaigns.map((campaign) => ({
    id: campaign.id,
    advertiser: campaign.label,
    sublabel: campaign.alt || "Banner campaign",
    initials: initials(campaign.label),
    adType: campaign.aspectRatio === "RATIO_3_2" ? "Banner 3x2" : "Banner 2x5",
    status: sponsoredScheduleStatus(campaign.startsAt, campaign.endsAt, campaign.active),
    timeline: formatScheduleRange(campaign.startsAt, campaign.endsAt),
    promotionEndDate: formatPromotionEndDate(campaign.endsAt),
    views: campaign.viewCount ?? 0,
    ctr: "—",
    editHref: `/admin/platform-ads/new?type=${campaign.aspectRatio === "RATIO_3_2" ? "wide" : "tall"}&bannerCampaignId=${campaign.id}`,
  }));

  const sponsoredRows: PlatformCampaignRow[] = sponsored.map((ad) => ({
    id: ad.id,
    advertiser: ad.job.company.name,
    sublabel: `Job · ${ad.job.title.slice(0, 40)}${ad.job.title.length > 40 ? "…" : ""}`,
    initials: initials(ad.job.company.name),
    adType: "Sponsored",
    status: sponsoredScheduleStatus(ad.startsAt, ad.endsAt, ad.active),
    timeline: formatScheduleRange(ad.startsAt, ad.endsAt),
    promotionEndDate: formatPromotionEndDate(ad.endsAt),
    views: ad.viewCount ?? 0,
    ctr: "—",
    editHref: `/admin/platform-ads/new?type=sponsored&sponsoredId=${ad.id}&jobId=${ad.jobId}`,
  }));

  return [...sponsoredRows, ...bannerRows];
}

const AD_TYPE_FILTERS = [
  { value: "all", label: "All ad types" },
  { value: "Banner 3x2", label: "Banner 3×2" },
  { value: "Banner 2x5", label: "Banner 2×5" },
  { value: "Sponsored", label: "Sponsored" },
] as const;

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "Inactive", label: "Inactive" },
] as const;

const STAT_CARDS = [
  { icon: "campaign", iconClass: "bg-secondary-container text-white", label: "Active campaigns" },
  { icon: "visibility", iconClass: "bg-surface-container text-secondary", label: "Total impressions", sub: "Past 30 days" },
  { icon: "ads_click", iconClass: "bg-surface-container text-secondary", label: "Average CTR", sub: "Standard performance" },
  { icon: "payments", iconClass: "bg-primary-container text-white", label: "Revenue (LKR)", sub: "Projected: 28K" },
] as const;

const TABLE_COLUMNS = [
  "Advertiser",
  "Ad Type",
  "Status",
  "Timeline",
  "Promotion end",
  "Views",
  "CTR",
  "",
] as const;

export function AdminPlatformAdsPage() {
  const [bannerCampaigns, setBannerCampaigns] = useState<AdminBannerCampaign[]>([]);
  const [sponsored, setSponsored] = useState<AdminSponsoredAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [adTypeFilter, setAdTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adTypeModalOpen, setAdTypeModalOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [banners, ads] = await Promise.all([
        getAdminBannerCampaigns(),
        getAdminSponsoredAds(),
      ]);
      setBannerCampaigns(banners);
      setSponsored(ads);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load platform ads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const campaigns = useMemo(
    () => buildCampaignRows(bannerCampaigns, sponsored),
    [bannerCampaigns, sponsored],
  );

  const filteredCampaigns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (adTypeFilter !== "all" && c.adType !== adTypeFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.advertiser.toLowerCase().includes(q) ||
        c.sublabel.toLowerCase().includes(q) ||
        c.adType.toLowerCase().includes(q) ||
        c.promotionEndDate.toLowerCase().includes(q)
      );
    });
  }, [campaigns, searchQuery, adTypeFilter, statusFilter]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || adTypeFilter !== "all" || statusFilter !== "all";

  const activeCount = campaigns.filter((c) => c.status === "Active").length;
  const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0);

  return (
    <RecruiterAdminShell activeNav="platform-ads">
      <AdminAdTypeModal open={adTypeModalOpen} onClose={() => setAdTypeModalOpen(false)} />
      <AdminPageCanvas className="md:px-margin-desktop">
        <div className="mb-stack-lg flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-headline-lg tracking-tight text-on-surface">
              Ads Performance Overview
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Real-time metrics for current advertising inventory.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-secondary bg-surface-container-lowest px-6 py-2.5 font-label-bold text-secondary transition-colors hover:bg-surface-container"
            >
              Generate Revenue Report
            </button>
            <button
              type="button"
              onClick={() => setAdTypeModalOpen(true)}
              className="flex items-center rounded-lg bg-secondary px-6 py-2.5 font-label-bold text-on-secondary shadow-sm transition-opacity hover:opacity-90"
            >
              <Icon name="add" className="mr-2 text-[18px]" />
              Create New Ad Campaign
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-stack-md rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-body-sm text-error">
            {error}
          </p>
        )}

        <div className="mb-4 grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map((card, index) => (
            <div
              key={card.label}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-colors hover:border-secondary"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", card.iconClass)}>
                  <Icon name={card.icon} className="text-[22px]" />
                </div>
              </div>
              <p className="text-[11px] font-label-bold uppercase tracking-wider text-on-surface-variant">
                {card.label}
              </p>
              <h3 className="text-headline-md font-bold text-on-surface">
                {index === 0
                  ? String(activeCount)
                  : index === 1
                    ? formatViews(totalViews)
                    : index === 2
                      ? "4.2%"
                      : "24,500"}
              </h3>
              {"sub" in card && card.sub && (
                <p className="mt-2 text-label-sm italic text-on-surface-variant">{card.sub}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mb-gutter flex flex-nowrap items-center gap-3 overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
          <div className="relative min-w-[min(100%,280px)] flex-1">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns, advertisers…"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
          <select
            value={adTypeFilter}
            onChange={(e) => setAdTypeFilter(e.target.value)}
            className="shrink-0 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-label-sm outline-none focus:ring-secondary"
            aria-label="Filter by ad type"
          >
            {AD_TYPE_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="shrink-0 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-label-sm outline-none focus:ring-secondary"
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setAdTypeFilter("all");
                setStatusFilter("all");
              }}
              className="shrink-0 font-label-bold text-secondary hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant p-6">
            <h2 className="text-xl font-bold text-on-surface">Campaign Management</h2>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-secondary-container/20 px-3 py-1 text-label-sm font-label-bold text-secondary">
                {loading ? "…" : `${filteredCampaigns.length} shown`}
              </span>
              <button type="button" className="rounded-lg p-2 hover:bg-surface-container" aria-label="Export">
                <Icon name="download" className="text-on-surface-variant" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-xs font-label-bold uppercase tracking-wider text-on-surface-variant">
                <tr>
                  {TABLE_COLUMNS.map((h) => (
                    <th key={h || "actions"} className="px-6 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-6 py-10 text-on-surface-variant">
                      Loading campaigns…
                    </td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-6 py-10 text-on-surface-variant">
                      No campaigns match your filters.{" "}
                      <button
                        type="button"
                        onClick={() => setAdTypeModalOpen(true)}
                        className="font-label-bold text-secondary hover:underline"
                      >
                        Create one
                      </button>
                      .
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((row) => (
                    <tr key={row.id} className="group transition-colors hover:bg-surface-container-low">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded bg-surface-container text-xs font-bold text-secondary">
                            {row.initials}
                          </div>
                          <div>
                            <p className="font-label-bold text-on-surface">{row.advertiser}</p>
                            <p className="text-[10px] text-on-surface-variant">{row.sublabel}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{row.adType}</td>
                      <td className="px-6 py-4">
                        <CampaignStatusBadge status={row.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant">{row.timeline}</td>
                      <td className="px-6 py-4 text-sm font-label-bold text-on-surface">
                        {row.promotionEndDate}
                      </td>
                      <td className="px-6 py-4 text-sm font-label-bold tabular-nums text-on-surface">
                        {formatViews(row.views)}
                      </td>
                      <td className="px-6 py-4 font-label-bold">{row.ctr}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={row.editHref}
                          className="inline-flex rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-secondary"
                          aria-label={`Edit ${row.advertiser}`}
                        >
                          <Icon name="edit" className="text-[20px]" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center border-t border-outline-variant bg-surface-container-lowest p-4">
            <button
              type="button"
              onClick={() => setAdTypeModalOpen(true)}
              className="text-sm font-label-bold text-secondary hover:underline"
            >
              Create New Campaign
            </button>
          </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
