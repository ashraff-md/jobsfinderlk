"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import {
  getEmployerAdsOverview,
  type EmployerAdsStats,
  type EmployerCampaign,
  type EmployerCampaignStatus,
} from "@/lib/api/employer-ads";
import { formatScheduleRange } from "@/lib/platform-ads/sponsored-schedule";
import { cn } from "@/lib/utils";

function formatCompactCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString();
}

function formatCtr(clicks: number, views: number) {
  if (views <= 0) return "—";
  return `${((clicks / views) * 100).toFixed(1)}% CTR`;
}

function formatViewsCtaLine(views: number, clicks: number) {
  return `${formatCompactCount(views)} views · ${formatCompactCount(clicks)} CTA`;
}

function campaignTitle(row: EmployerCampaign) {
  return row.kind === "sponsored" ? row.job.title : row.label;
}

function campaignSubtitle(row: EmployerCampaign) {
  if (row.kind === "sponsored") {
    return `${row.job.company.name} · ID: ${row.id.slice(0, 8).toUpperCase()}`;
  }
  const format = row.aspectRatio === "RATIO_3_2" ? "Display Banner" : "Leaderboard Ad";
  return `${format} · ID: ${row.id.slice(0, 8).toUpperCase()}`;
}

function campaignTypeLabel(row: EmployerCampaign) {
  if (row.kind === "sponsored") return "Sponsored Job";
  return row.aspectRatio === "RATIO_3_2" ? "Display Banner" : "Leaderboard Ad";
}

function campaignTypeIcon(row: EmployerCampaign) {
  return row.kind === "sponsored" ? "ad_group" : "rectangle";
}

function displayStatus(status: EmployerCampaignStatus) {
  if (status === "Active") return "Live";
  if (status === "Pending Review") return "Pending Review";
  if (status === "Scheduled") return "Scheduled";
  if (status === "Rejected") return "Rejected";
  return "Expired";
}

function statusClass(status: EmployerCampaignStatus) {
  if (status === "Active") return "bg-green-100 text-green-800 border-green-200";
  if (status === "Pending Review") return "bg-amber-100 text-amber-900 border-amber-200";
  if (status === "Scheduled") return "bg-blue-100 text-blue-800 border-blue-200";
  if (status === "Rejected") return "bg-error-container text-on-error-container border-error/30";
  return "bg-surface-container-highest text-on-surface-variant border-outline-variant";
}

function buildStatCards(stats: EmployerAdsStats) {
  return [
    {
      label: "Total Impressions",
      value: formatCompactCount(stats.totalImpressions),
      sub: `${formatCompactCount(stats.totalClicks)} clicks across all campaigns`,
    },
    {
      label: "Live Campaigns",
      value: String(stats.activeCount),
      sub: "Currently running",
    },
    {
      label: "Pending Review",
      value: String(stats.pendingReviewCount),
      sub: "Awaiting admin approval",
    },
    {
      label: "Expired",
      value: String(stats.expiredCount),
      sub: "Completed or paused",
    },
  ];
}

export function EmployerAdsPage() {
  const [campaigns, setCampaigns] = useState<EmployerCampaign[]>([]);
  const [stats, setStats] = useState<EmployerAdsStats>({
    totalImpressions: 0,
    totalClicks: 0,
    pendingReviewCount: 0,
    activeCount: 0,
    scheduledCount: 0,
    expiredCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployerAdsOverview();
      setCampaigns(data.campaigns);
      setStats(data.stats);
    } catch (err) {
      setCampaigns([]);
      setStats({
        totalImpressions: 0,
        totalClicks: 0,
        pendingReviewCount: 0,
        activeCount: 0,
        scheduledCount: 0,
        expiredCount: 0,
      });
      setError(err instanceof ApiError ? err.message : "Failed to load advertising campaigns.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter((c) => {
      const title = campaignTitle(c).toLowerCase();
      const subtitle = campaignSubtitle(c).toLowerCase();
      return (
        title.includes(q) ||
        subtitle.includes(q) ||
        c.id.toLowerCase().includes(q) ||
        campaignTypeLabel(c).toLowerCase().includes(q)
      );
    });
  }, [campaigns, searchQuery]);

  const statCards = buildStatCards(stats);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Ads Management &amp; Oversight
          </h2>
          <p className="mt-1 max-w-2xl font-body-lg text-on-surface-variant">
            Track sponsored jobs and banner campaigns, including items awaiting admin review.
          </p>
        </div>
        <Link
          href="/employer/ads/new"
          className="inline-flex items-center justify-center gap-2 rounded bg-secondary px-6 py-3 font-label-bold text-on-secondary shadow-sm transition-opacity hover:opacity-90"
        >
          <Icon name="add" />
          Create Campaign
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-md text-on-error-container">
          {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5"
          >
            <p className="font-label-bold text-label-sm uppercase tracking-wider text-on-surface-variant">
              {card.label}
            </p>
            <p className="mt-3 font-headline-md text-headline-md text-primary">
              {loading ? "…" : card.value}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">{card.sub}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        <div className="flex flex-col gap-4 border-b border-outline-variant px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-headline-md text-headline-md text-on-surface">Your Campaigns</h3>
          <div className="relative w-full sm:max-w-xs">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-surface-container-low">
              <tr>
                {["Campaign", "Status", "Type", "Duration", "Views / CTA", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 font-label-bold text-label-sm uppercase tracking-wider text-on-surface-variant"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-on-surface-variant">
                    Loading campaigns…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">
                    No campaigns yet.{" "}
                    <Link href="/employer/ads/new" className="font-label-bold text-secondary hover:underline">
                      Create your first campaign
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-6 py-4">
                      <p className="font-label-bold text-on-surface">{campaignTitle(row)}</p>
                      <p className="mt-1 text-label-sm text-on-surface-variant">
                        {campaignSubtitle(row)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-label-sm font-label-bold",
                          statusClass(row.status),
                        )}
                      >
                        {displayStatus(row.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Icon name={campaignTypeIcon(row)} className="text-[20px] text-secondary" />
                        <span className="text-body-md">{campaignTypeLabel(row)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-md">
                      {formatScheduleRange(row.startsAt, row.endsAt)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-label-bold tabular-nums text-primary">
                        {formatViewsCtaLine(row.viewCount, row.clickCount ?? 0)}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        {formatCtr(row.clickCount ?? 0, row.viewCount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {row.status === "Active" ? (
                        row.kind === "sponsored" ? (
                          <Link
                            href={`/jobs/${row.job.slug}`}
                            className="inline-flex items-center gap-1 font-label-bold text-secondary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View live
                            <Icon name="open_in_new" className="text-sm" />
                          </Link>
                        ) : (
                          <a
                            href={row.href.startsWith("/") ? row.href : row.href}
                            className="inline-flex items-center gap-1 font-label-bold text-secondary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View live
                            <Icon name="open_in_new" className="text-sm" />
                          </a>
                        )
                      ) : (
                        <span className="text-label-sm text-on-surface-variant">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
