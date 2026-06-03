"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import { approveJob, getAdminJobs, rejectJob } from "@/lib/api/admin";
import type { Job } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CLOSED", label: "Closed" },
  { value: "EXPIRED", label: "Expired" },
] as const;

const SOURCE_FILTERS = [
  { value: "all", label: "All sources" },
  { value: "DIRECT_EMPLOYER", label: "Employer postings" },
  { value: "GOVERNMENT", label: "Government" },
] as const;

function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function reviewHref(job: Job) {
  return `/admin/jobs/${job.id}/review`;
}

function statusLabel(status?: string) {
  switch (status) {
    case "PENDING_REVIEW":
      return "Pending review";
    case "PUBLISHED":
      return "Published";
    case "DRAFT":
      return "Draft";
    case "REJECTED":
      return "Rejected";
    case "CLOSED":
      return "Closed";
    case "EXPIRED":
      return "Expired";
    default:
      return status ?? "Unknown";
  }
}

function statusBadgeClass(status?: string) {
  switch (status) {
    case "PENDING_REVIEW":
      return "bg-amber-100 text-amber-800";
    case "PUBLISHED":
      return "bg-green-100 text-green-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "DRAFT":
      return "bg-surface-container-high text-on-surface-variant";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function AdminJobsApprovalPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const loadStats = useCallback(async () => {
    try {
      const all = await getAdminJobs();
      setStats({
        total: all.length,
        pending: all.filter((j) => j.status === "PENDING_REVIEW").length,
        published: all.filter((j) => j.status === "PUBLISHED").length,
      });
    } catch {
      /* stats are non-blocking */
    }
  }, []);

  const loadJobs = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminJobs({
        status: statusFilter,
        q: debouncedSearch,
        source: sourceFilter,
      });
      setJobs(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
        return;
      }
      setJobs([]);
      setError(err instanceof ApiError ? err.message : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [router, statusFilter, debouncedSearch, sourceFilter]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const handleModerate = async (id: string, action: "approve" | "reject") => {
    setActionId(id);
    try {
      if (action === "approve") await approveJob(id);
      else await rejectJob(id);
      await Promise.all([loadJobs(), loadStats()]);
    } finally {
      setActionId(null);
    }
  };

  const hasActiveFilters = useMemo(
    () => statusFilter !== "all" || sourceFilter !== "all" || debouncedSearch.trim().length > 0,
    [statusFilter, sourceFilter, debouncedSearch],
  );

  return (
    <RecruiterAdminShell activeNav="jobs">
      <AdminPageCanvas>
        {error && (
          <div className="mb-6 rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-error">
            {error}
          </div>
        )}

        <div className="space-y-gutter">
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
              {[
                {
                  icon: "work",
                  label: "Total listings",
                  value: String(stats.total),
                  trend: "Platform",
                  trendClass: "text-on-surface-variant",
                },
                {
                  icon: "pending_actions",
                  label: "Pending review",
                  value: String(stats.pending),
                  trend: stats.pending > 0 ? "Action needed" : "Clear",
                  trendClass: stats.pending > 0 ? "text-error" : "text-secondary",
                },
                {
                  icon: "published_with_changes",
                  label: "Published",
                  value: String(stats.published),
                  trend: "Live",
                  trendClass: "text-secondary",
                },
              ].map((stat) => (
                <div key={stat.label} className="glass-card flex flex-col justify-between rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <Icon name={stat.icon} className="rounded-lg bg-secondary-container/20 p-2 text-secondary" />
                    <span className={cn("font-label-bold", stat.trendClass)}>{stat.trend}</span>
                  </div>
                  <div className="mt-4">
                    <p className="font-label-bold text-on-surface-variant">{stat.label}</p>
                    <h3 className="text-headline-md">{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-nowrap items-center gap-3 overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
              <div className="relative min-w-[min(100%,280px)] flex-1">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, company, location…"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="shrink-0 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-label-sm outline-none focus:ring-secondary"
              >
                {STATUS_FILTERS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="shrink-0 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-label-sm outline-none focus:ring-secondary"
              >
                {SOURCE_FILTERS.map((opt) => (
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
                    setStatusFilter("all");
                    setSourceFilter("all");
                  }}
                  className="shrink-0 font-label-bold text-secondary hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low p-stack-md">
                <h3 className="font-label-bold">All job listings</h3>
                <span className="rounded-full bg-secondary-container/20 px-3 py-1 text-label-sm font-label-bold text-secondary">
                  {loading ? "…" : `${jobs.length} shown`}
                </span>
              </div>
              <div className="divide-y divide-outline-variant">
                {loading && (
                  <p className="p-stack-md text-on-surface-variant">Loading jobs…</p>
                )}
                {!loading && jobs.length === 0 && (
                  <p className="p-stack-md text-center text-on-surface-variant">
                    {hasActiveFilters
                      ? "No jobs match your filters."
                      : "No job listings yet."}
                  </p>
                )}
                {jobs.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-6 p-stack-md transition-colors hover:bg-surface-container"
                  >
                    <Link
                      href={reviewHref(item)}
                      className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-variant font-bold text-primary transition-colors group-hover:border-secondary"
                    >
                      {companyInitials(item.company.name)}
                    </Link>
                    <Link href={reviewHref(item)} className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                            statusBadgeClass(item.status),
                          )}
                        >
                          {statusLabel(item.status)}
                        </span>
                        {item.jobSourceType === "GOVERNMENT" && (
                          <span className="rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
                            Government
                          </span>
                        )}
                      </div>
                      <h4 className="font-label-bold group-hover:text-secondary">{item.company.name}</h4>
                      <p className="text-body-md">{item.title}</p>
                      <p className="mt-2 text-label-sm text-outline">
                        {item.location ?? item.city ?? "—"} • {timeAgo(item.createdAt)}
                        {item._count?.applications != null && (
                          <> • {item._count.applications} applicant{item._count.applications === 1 ? "" : "s"}</>
                        )}
                      </p>
                    </Link>
                    <div className="flex shrink-0 items-center gap-2">
                      {item.status === "PENDING_REVIEW" && (
                        <button
                          type="button"
                          disabled={actionId === item.id}
                          onClick={() => handleModerate(item.id, "reject")}
                          className="rounded-lg p-2 text-error transition-colors hover:bg-error-container disabled:opacity-50"
                          aria-label="Reject"
                        >
                          <Icon name="block" />
                        </button>
                      )}
                      {item.status === "PUBLISHED" && (
                        <Link
                          href={`/jobs/${item.slug}`}
                          target="_blank"
                          className="rounded-lg border border-outline-variant p-2 text-on-surface-variant transition-colors hover:text-secondary"
                          aria-label="View live"
                        >
                          <Icon name="open_in_new" />
                        </Link>
                      )}
                      <Link
                        href={reviewHref(item)}
                        className="rounded-lg bg-secondary px-4 py-2 font-label-bold text-on-secondary transition-transform hover:scale-95"
                      >
                        {item.status === "PENDING_REVIEW" ? "Review" : "View"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
