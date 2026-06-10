"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAdTypeModal } from "@/components/admin/platform-ads/admin-ad-type-modal";
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
  platformAdCampaignStatus,
} from "@/lib/platform-ads/sponsored-schedule";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type AdsTab = "overview" | "active" | "pending" | "completed";

const TABS: { key: AdsTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending Review" },
  { key: "completed", label: "Completed" },
];

const STAT_CARDS = [
  {
    icon: "ads_click",
    iconClass: "text-secondary-container",
    tag: "TOTAL",
    label: "Active Ads",
    showProgress: true,
  },
  {
    icon: "pending_actions",
    iconClass: "text-error",
    tag: "URGENT",
    label: "Pending Approvals",
    showDelta: true,
  },
  {
    icon: "visibility",
    iconClass: "text-on-surface",
    tag: "TOTAL",
    label: "Total Impressions",
  },
  {
    icon: "trending_up",
    iconClass: "text-secondary",
    tag: "AVERAGE",
    label: "Avg. Views per Campaign",
  },
] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function scheduleProgress(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

function isExpiringSoon(endsAt: string): boolean {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  return end > now && end - now <= 24 * 60 * 60 * 1000;
}

function displayStatusForRow(
  status: CampaignStatus,
  adType: PlatformCampaignRow["adType"],
  endsAt: string,
): PlatformCampaignRow["displayStatus"] {
  if (status === "Pending Review") return "Scheduled";
  if (status === "Rejected") return "Rejected";
  if (status === "Scheduled") return "Scheduled";
  if (status === "Inactive") return "Inactive";
  if (isExpiringSoon(endsAt)) return "Expiring Today";
  if (adType === "Sponsored") return "Live";
  return "Rotating";
}

function formatCompactCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString();
}

function formatCompactImpressions(count: number) {
  return `${formatCompactCount(count)} Impr.`;
}

function formatCtr(clicks: number, views: number) {
  if (views <= 0) return "—";
  return `${((clicks / views) * 100).toFixed(1)}% CTR`;
}

function formatViewsCtaLine(views: number, clicks: number) {
  return `${formatCompactCount(views)} views · ${formatCompactCount(clicks)} CTA`;
}

function buildCampaignRows(
  bannerCampaigns: AdminBannerCampaign[],
  sponsored: AdminSponsoredAd[],
): PlatformCampaignRow[] {
  const bannerRows: PlatformCampaignRow[] = bannerCampaigns.map((campaign) => {
    const adType = campaign.aspectRatio === "RATIO_3_2" ? "Banner 3x2" : "Banner 2x5";
    const status = platformAdCampaignStatus(
      campaign.reviewStatus ?? "APPROVED",
      campaign.startsAt,
      campaign.endsAt,
      campaign.active,
    );
    return {
      id: campaign.id,
      campaignKind: "banner",
      reviewStatus: campaign.reviewStatus ?? "APPROVED",
      advertiser: campaign.label,
      sublabel: campaign.alt || "Banner campaign",
      initials: initials(campaign.label),
      adType,
      status,
      displayStatus: displayStatusForRow(status, adType, campaign.endsAt),
      typeIcon: campaign.aspectRatio === "RATIO_3_2" ? "rectangle" : "vertical_distribute",
      typeLabel: campaign.aspectRatio === "RATIO_3_2" ? "3×2 Banner" : "2×5 Banner",
      placement:
        campaign.aspectRatio === "RATIO_3_2" ? "Homepage, Job Details" : "Job Detail Sidebar",
      timeline: formatScheduleRange(campaign.startsAt, campaign.endsAt),
      promotionEndDate: formatPromotionEndDate(campaign.endsAt),
      startsAt: campaign.startsAt,
      endsAt: campaign.endsAt,
      scheduleProgress: scheduleProgress(campaign.startsAt, campaign.endsAt),
      views: campaign.viewCount ?? 0,
      clicks: campaign.clickCount ?? 0,
      ctr: formatCtr(campaign.clickCount ?? 0, campaign.viewCount ?? 0),
      editHref: `/admin/platform-ads/new?type=${campaign.aspectRatio === "RATIO_3_2" ? "wide" : "tall"}&bannerCampaignId=${campaign.id}`,
      viewHref: campaign.href.startsWith("/") ? campaign.href : campaign.href,
    };
  });

  const sponsoredRows: PlatformCampaignRow[] = sponsored.map((ad) => {
    const status = platformAdCampaignStatus(
      ad.reviewStatus ?? "APPROVED",
      ad.startsAt,
      ad.endsAt,
      ad.active,
    );
    return {
      id: ad.id,
      campaignKind: "sponsored",
      reviewStatus: ad.reviewStatus ?? "APPROVED",
      advertiser: ad.job.company.name,
      sublabel: ad.job.title,
      initials: initials(ad.job.company.name),
      adType: "Sponsored",
      status,
      displayStatus: displayStatusForRow(status, "Sponsored", ad.endsAt),
      typeIcon: "campaign",
      typeLabel: "Sponsored Job",
      placement: "Homepage, Search Results",
      timeline: formatScheduleRange(ad.startsAt, ad.endsAt),
      promotionEndDate: formatPromotionEndDate(ad.endsAt),
      startsAt: ad.startsAt,
      endsAt: ad.endsAt,
      scheduleProgress: scheduleProgress(ad.startsAt, ad.endsAt),
      views: ad.viewCount ?? 0,
      clicks: ad.clickCount ?? 0,
      ctr: formatCtr(ad.clickCount ?? 0, ad.viewCount ?? 0),
      editHref: `/admin/platform-ads/new?type=sponsored&sponsoredId=${ad.id}&jobId=${ad.jobId}`,
      viewHref: `/jobs/${ad.job.slug}`,
    };
  });

  return [...sponsoredRows, ...bannerRows];
}

function statusDotClass(displayStatus: PlatformCampaignRow["displayStatus"]) {
  if (displayStatus === "Live") return "bg-secondary animate-pulse";
  if (displayStatus === "Rotating") return "bg-secondary";
  if (displayStatus === "Expiring Today") return "bg-on-surface-variant opacity-40";
  if (displayStatus === "Scheduled") return "bg-amber-500";
  if (displayStatus === "Rejected") return "bg-error";
  return "bg-on-surface-variant opacity-40";
}

function CampaignStatusIndicator({ status }: { status: PlatformCampaignRow["displayStatus"] }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-2 w-2 rounded-full", statusDotClass(status))} />
      <span
        className={cn(
          "font-label-sm text-label-sm",
          status === "Expiring Today" || status === "Inactive" || status === "Rejected"
            ? "text-on-surface-variant opacity-60"
            : "text-primary",
        )}
      >
        {status}
      </span>
    </div>
  );
}

function scheduleStatusBadgeClass(status: CampaignStatus) {
  if (status === "Active") return "bg-secondary-container text-on-secondary-container";
  if (status === "Pending Review") return "bg-amber-100 text-amber-900";
  if (status === "Rejected") return "bg-error-container text-on-error-container";
  if (status === "Scheduled") return "bg-blue-100 text-blue-900";
  return "bg-surface-variant text-on-surface-variant";
}

function CampaignScheduleStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        scheduleStatusBadgeClass(status),
      )}
    >
      {status}
    </span>
  );
}

type StatusSummary = {
  total: number;
  active: number;
  pendingReview: number;
  scheduled: number;
  inactive: number;
};

export function AdminPlatformAdsPage() {
  const [bannerCampaigns, setBannerCampaigns] = useState<AdminBannerCampaign[]>([]);
  const [sponsored, setSponsored] = useState<AdminSponsoredAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [adTypeFilter, setAdTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<AdsTab>("overview");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
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

  const statusSummary = useMemo<StatusSummary>(() => {
    const active = campaigns.filter((c) => c.status === "Active").length;
    const pendingReview = campaigns.filter((c) => c.status === "Pending Review").length;
    const scheduled = campaigns.filter((c) => c.status === "Scheduled").length;
    const inactive = campaigns.filter((c) => c.status === "Inactive").length;
    return {
      total: campaigns.length,
      active,
      pendingReview,
      scheduled,
      inactive,
    };
  }, [campaigns]);

  const activeCount = statusSummary.active;
  const pendingCount = statusSummary.pendingReview;
  const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const avgViewsPerCampaign =
    campaigns.length > 0 ? Math.round(totalViews / campaigns.length) : 0;

  const filteredCampaigns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (activeTab === "active" && c.status !== "Active") return false;
      if (activeTab === "pending" && c.status !== "Pending Review") return false;
      if (activeTab === "completed" && c.status !== "Inactive") return false;
      if (adTypeFilter !== "all" && c.adType !== adTypeFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.advertiser.toLowerCase().includes(q) ||
        c.sublabel.toLowerCase().includes(q) ||
        c.adType.toLowerCase().includes(q) ||
        c.placement.toLowerCase().includes(q)
      );
    });
  }, [campaigns, searchQuery, adTypeFilter, statusFilter, activeTab]);

  const pageCount = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
  const pagedCampaigns = filteredCampaigns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, adTypeFilter, statusFilter, activeTab]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || adTypeFilter !== "all" || statusFilter !== "all";

  const tabLabel = (tab: (typeof TABS)[number]) => {
    if (tab.key === "overview") return `${tab.label} (${statusSummary.total})`;
    if (tab.key === "active" && activeCount > 0) return `${tab.label} (${activeCount})`;
    if (tab.key === "pending" && pendingCount > 0) return `${tab.label} (${pendingCount})`;
    if (tab.key === "completed" && statusSummary.inactive > 0) {
      return `${tab.label} (${statusSummary.inactive})`;
    }
    return tab.label;
  };

  const handleTabChange = (tab: AdsTab) => {
    setActiveTab(tab);
    if (tab === "overview") {
      setStatusFilter("all");
    } else if (tab === "active") {
      setStatusFilter("Active");
    } else if (tab === "pending") {
      setStatusFilter("Pending Review");
    } else if (tab === "completed") {
      setStatusFilter("Inactive");
    }
  };

  return (
    <RecruiterAdminShell activeNav="platform-ads">
      <AdminAdTypeModal open={adTypeModalOpen} onClose={() => setAdTypeModalOpen(false)} />
      <AdminPageCanvas className="md:px-margin-desktop">
        <div className="mb-stack-lg flex flex-col items-end justify-between gap-4 md:flex-row">
          <div>
            <h1 className="font-headline-xl text-headline-xl tracking-tight text-primary">
              Platform Advertising Management
            </h1>
            <p className="mt-2 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
              Oversee sponsored listings and banner inventory distribution across the Executive
              ecosystem.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdTypeModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-label-bold text-label-bold text-on-primary transition-all hover:bg-secondary active:scale-95"
          >
            <Icon name="add" />
            Create Campaign
          </button>
        </div>

        {error && (
          <p className="mb-stack-md rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-body-sm text-error">
            {error}
          </p>
        )}

        <div className="mb-stack-lg grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map((card, index) => (
            <div
              key={card.label}
              className="border border-outline-variant bg-surface-container-lowest p-stack-md transition-colors hover:border-secondary"
            >
              <div className="mb-4 flex items-start justify-between">
                <Icon name={card.icon} className={cn("text-[22px]", card.iconClass)} />
                <span className="text-xs font-bold text-on-surface-variant opacity-60">{card.tag}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary">
                {loading
                  ? "…"
                  : index === 0
                    ? String(activeCount)
                    : index === 1
                      ? String(pendingCount)
                      : index === 2
                        ? totalViews.toLocaleString()
                        : avgViewsPerCampaign.toLocaleString()}
              </h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{card.label}</p>
              {"showProgress" in card && card.showProgress && (
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-surface-variant">
                  <div
                    className="h-full bg-secondary"
                    style={{
                      width: `${campaigns.length > 0 ? Math.round((activeCount / campaigns.length) * 100) : 0}%`,
                    }}
                  />
                </div>
              )}
              {"showDelta" in card && card.showDelta && pendingCount > 0 && (
                <p className="mt-2 text-[10px] font-bold text-error">+{pendingCount} awaiting review</p>
              )}
              {index === 2 && totalViews > 0 && (
                <p className="mt-2 text-[10px] text-on-surface-variant opacity-60">
                  {formatCompactImpressions(totalViews)} · {totalClicks.toLocaleString()} clicks
                </p>
              )}
              {index === 3 && campaigns.length > 0 && (
                <p className="mt-2 text-[10px] text-on-surface-variant opacity-60">
                  Across {campaigns.length} campaigns
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="min-w-0">
            <div className="mb-6 flex gap-8 overflow-x-auto border-b border-outline-variant">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={cn(
                    "whitespace-nowrap pb-4 font-label-bold text-label-bold transition-all",
                    activeTab === tab.key
                      ? "border-b-2 border-secondary text-secondary"
                      : "text-on-surface-variant hover:text-secondary",
                  )}
                >
                  {tabLabel(tab)}
                </button>
              ))}
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Icon
                      name="search"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by advertiser or campaign name..."
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-4 outline-none transition-all focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((open) => !open)}
                    className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 font-label-bold transition-colors hover:bg-surface-variant"
                  >
                    <Icon name="filter_list" className="text-sm" />
                    Filter
                  </button>
                </div>

                {filtersOpen && (
                  <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
                    <select
                      value={adTypeFilter}
                      onChange={(e) => setAdTypeFilter(e.target.value)}
                      className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-label-sm outline-none focus:ring-secondary"
                      aria-label="Filter by ad type"
                    >
                      <option value="all">All ad types</option>
                      <option value="Banner 3x2">Banner 3×2</option>
                      <option value="Banner 2x5">Banner 2×5</option>
                      <option value="Sponsored">Sponsored</option>
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-label-sm outline-none focus:ring-secondary"
                      aria-label="Filter by status"
                    >
                      <option value="all">All statuses</option>
                      <option value="Active">Active</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setAdTypeFilter("all");
                          setStatusFilter("all");
                        }}
                        className="font-label-bold text-secondary hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}

                <div className="overflow-hidden border border-outline-variant bg-surface-container-lowest">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead className="border-b border-outline-variant bg-surface-container font-label-bold text-label-sm uppercase text-on-surface-variant">
                        <tr>
                          <th className="px-6 py-4">Advertiser</th>
                          <th className="px-6 py-4">Type / Placement</th>
                          <th className="px-6 py-4">Views / CTA</th>
                          <th className="px-6 py-4">Schedule</th>
                          <th className="px-6 py-4">Status</th>
                          {activeTab === "overview" && <th className="px-6 py-4">Lifecycle</th>}
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {loading ? (
                          <tr>
                            <td
                              colSpan={activeTab === "overview" ? 7 : 6}
                              className="px-6 py-10 text-on-surface-variant"
                            >
                              Loading campaigns…
                            </td>
                          </tr>
                        ) : pagedCampaigns.length === 0 ? (
                          <tr>
                            <td
                              colSpan={activeTab === "overview" ? 7 : 6}
                              className="px-6 py-10 text-on-surface-variant"
                            >
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
                          pagedCampaigns.map((row) => (
                            <tr
                              key={row.id}
                              className="group transition-colors hover:bg-surface-container-low"
                            >
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "flex h-10 w-10 items-center justify-center rounded border border-outline-variant text-xs font-bold",
                                      row.adType === "Sponsored"
                                        ? "bg-primary-container text-on-primary-container"
                                        : "bg-surface-variant text-primary",
                                    )}
                                  >
                                    {row.initials}
                                  </div>
                                  <div>
                                    <p className="font-label-bold text-label-bold text-primary">
                                      {row.advertiser}
                                    </p>
                                    <p className="text-[11px] text-on-surface-variant opacity-60">
                                      {row.sublabel}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="mb-1 inline-flex items-center gap-1 rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase">
                                  <Icon name={row.typeIcon} className="text-xs" />
                                  {row.typeLabel}
                                </div>
                                <p className="font-label-sm text-label-sm text-on-surface-variant">
                                  {row.placement}
                                </p>
                              </td>
                              <td className="px-6 py-5">
                                <p className="font-label-bold tabular-nums text-label-bold text-primary">
                                  {formatViewsCtaLine(row.views, row.clicks)}
                                </p>
                                <p className="text-[11px] font-bold text-on-surface-variant opacity-60">
                                  {formatCtr(row.clicks, row.views)}
                                </p>
                              </td>
                              <td className="px-6 py-5">
                                <p className="font-label-sm text-label-sm">{row.timeline}</p>
                                <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-surface-variant">
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      row.displayStatus === "Expiring Today"
                                        ? "bg-on-surface-variant opacity-40"
                                        : "bg-secondary",
                                    )}
                                    style={{ width: `${row.scheduleProgress}%` }}
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                {activeTab === "overview" ? (
                                  <CampaignScheduleStatusBadge status={row.status} />
                                ) : (
                                  <CampaignStatusIndicator status={row.displayStatus} />
                                )}
                              </td>
                              {activeTab === "overview" && (
                                <td className="px-6 py-5">
                                  <CampaignStatusIndicator status={row.displayStatus} />
                                </td>
                              )}
                              <td className="px-6 py-5 text-right">
                                <div className="flex justify-end gap-2">
                                  <Link
                                    href={row.editHref}
                                    className={cn(
                                      "rounded p-2 transition-colors hover:bg-surface-variant",
                                      row.reviewStatus === "PENDING" &&
                                        "bg-amber-100 text-amber-900 hover:bg-amber-200",
                                    )}
                                    title={row.reviewStatus === "PENDING" ? "Review" : "Edit"}
                                    aria-label={
                                      row.reviewStatus === "PENDING"
                                        ? `Review ${row.advertiser}`
                                        : `Edit ${row.advertiser}`
                                    }
                                  >
                                    <Icon
                                      name={row.reviewStatus === "PENDING" ? "rate_review" : "edit"}
                                      className={
                                        row.reviewStatus === "PENDING"
                                          ? undefined
                                          : "text-on-surface-variant"
                                      }
                                    />
                                  </Link>
                                  {row.viewHref && row.reviewStatus === "APPROVED" && (
                                    <a
                                      href={row.viewHref}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded p-2 transition-colors hover:bg-surface-variant"
                                      title="View"
                                      aria-label={`View ${row.advertiser}`}
                                    >
                                      <Icon name="open_in_new" className="text-on-surface-variant" />
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col items-center justify-between gap-3 border-t border-outline-variant bg-surface-container-lowest px-6 py-4 sm:flex-row">
                    <p className="text-label-sm text-on-surface-variant">
                      Showing {pagedCampaigns.length} of {filteredCampaigns.length} campaigns
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="rounded border border-outline-variant px-3 py-1 transition-colors hover:bg-surface-variant disabled:opacity-40"
                        aria-label="Previous page"
                      >
                        <Icon name="chevron_left" className="text-sm" />
                      </button>
                      {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          className={cn(
                            "rounded px-3 py-1 transition-colors",
                            page === n
                              ? "bg-primary text-on-primary"
                              : "border border-outline-variant hover:bg-surface-variant",
                          )}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={page >= pageCount}
                        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                        className="rounded border border-outline-variant px-3 py-1 transition-colors hover:bg-surface-variant disabled:opacity-40"
                        aria-label="Next page"
                      >
                        <Icon name="chevron_right" className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
