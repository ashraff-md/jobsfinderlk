"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminFilterBar,
  adminFilterSelectClass,
} from "@/components/admin/admin-filter-bar";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import {
  approveJob,
  deleteAdminJob,
  getAdminJobStats,
  getAdminJobs,
  rejectJob,
} from "@/lib/api/admin";
import { formatJobClosingDate } from "@/lib/jobs/application-deadline";
import type { Job } from "@/lib/api/types";
import { getJobEmployerName } from "@/lib/jobs/job-employer-name";
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

const JOBS_PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;

const TABLE_COLUMNS = [
  "Job Title",
  "Company",
  "City",
  "Status",
  "Closing Date",
  "Approved Admin",
  "Actions",
] as const;

const stickyActionHeaderClass =
  "sticky right-0 z-20 w-[120px] min-w-[120px] bg-surface-container-low/50 px-3 py-4 text-right font-label-bold uppercase tracking-wider text-outline shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.12)]";

const stickyActionCellClass =
  "sticky right-0 z-10 w-[120px] min-w-[120px] bg-surface-container-lowest px-3 py-4 shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.08)] group-hover:bg-tertiary-fixed/30";

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

function formatApprovedAdmin(job: Job) {
  if (!job.reviewedBy) return "—";
  const full = [job.reviewedBy.adminProfile?.firstName, job.reviewedBy.adminProfile?.lastName]
    .filter(Boolean)
    .join(" ");
  if (full) return full;
  return job.reviewedBy.email.split("@")[0] ?? job.reviewedBy.email;
}

export function AdminJobsApprovalPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [jobsPerPage, setJobsPerPage] =
    useState<(typeof JOBS_PER_PAGE_OPTIONS)[number]>(20);
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

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch, sourceFilter]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getAdminJobStats());
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
        page,
        limit: jobsPerPage,
      });
      setJobs(data.items);
      setTotal(data.total);
      setPages(data.pages);
      if (data.total > 0 && page > data.pages) {
        setPage(data.pages);
        return;
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
        return;
      }
      setJobs([]);
      setTotal(0);
      setPages(1);
      setError(err instanceof ApiError ? err.message : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [router, statusFilter, debouncedSearch, sourceFilter, page, jobsPerPage]);

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

  const handleDelete = async (job: Job) => {
    const confirmed = window.confirm(
      `Delete "${job.title}"? This permanently removes the listing and its applications.`,
    );
    if (!confirmed) return;

    setActionId(job.id);
    try {
      await deleteAdminJob(job.id);
      await Promise.all([loadJobs(), loadStats()]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete job.");
    } finally {
      setActionId(null);
    }
  };

  const hasActiveFilters = useMemo(
    () => statusFilter !== "all" || sourceFilter !== "all" || debouncedSearch.trim().length > 0,
    [statusFilter, sourceFilter, debouncedSearch],
  );

  const resultsRangeLabel = useMemo(() => {
    if (loading || total === 0) return null;
    const start = (page - 1) * jobsPerPage + 1;
    const end = Math.min(page * jobsPerPage, total);
    return `${start}–${end} of ${total}`;
  }, [loading, total, page, jobsPerPage]);

  const handleJobsPerPageChange = useCallback((value: string) => {
    const next = Number(value);
    if (!JOBS_PER_PAGE_OPTIONS.includes(next as (typeof JOBS_PER_PAGE_OPTIONS)[number])) {
      return;
    }
    setJobsPerPage(next as (typeof JOBS_PER_PAGE_OPTIONS)[number]);
    setPage(1);
  }, []);

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(Math.max(1, Math.min(nextPage, pages)));
    },
    [pages],
  );

  const paginationItems = useMemo(() => {
    if (pages <= 1) return [];
    if (pages <= 9) {
      return Array.from({ length: pages }, (_, index) => index + 1);
    }

    const pageSet = new Set([1, pages, page - 1, page, page + 1]);
    const sorted = [...pageSet].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
    const result: (number | "ellipsis")[] = [];

    sorted.forEach((p, index) => {
      if (index > 0 && p - sorted[index - 1] > 1) result.push("ellipsis");
      result.push(p);
    });

    return result;
  }, [page, pages]);

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

            <AdminFilterBar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search title, company, location…"
              filters={[
                {
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: STATUS_FILTERS,
                  ariaLabel: "Filter by status",
                },
                {
                  value: sourceFilter,
                  onChange: setSourceFilter,
                  options: SOURCE_FILTERS,
                  ariaLabel: "Filter by source",
                },
              ]}
              showClear={hasActiveFilters}
              onClear={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setSourceFilter("all");
              }}
            >
              <div className="flex shrink-0 items-center gap-2">
                <span className="whitespace-nowrap text-label-sm text-outline">Per page:</span>
                <select
                  value={jobsPerPage}
                  onChange={(e) => handleJobsPerPageChange(e.target.value)}
                  className={adminFilterSelectClass}
                  aria-label="Jobs per page"
                >
                  {JOBS_PER_PAGE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </AdminFilterBar>

            <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-low px-stack-lg py-stack-md">
                <h3 className="text-headline-md text-on-surface">Job listings</h3>
                <span className="rounded-full bg-secondary-container px-3 py-1 text-label-sm font-label-bold text-on-secondary">
                  {loading
                    ? "…"
                    : resultsRangeLabel
                      ? `Showing ${resultsRangeLabel}`
                      : "No jobs"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] border-collapse text-left">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      {TABLE_COLUMNS.map((h) => (
                        <th
                          key={h}
                          className={
                            h === "Actions"
                              ? stickyActionHeaderClass
                              : "px-stack-lg py-4 font-label-bold uppercase tracking-wider text-outline"
                          }
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {loading && (
                      <tr>
                        <td colSpan={7} className="px-stack-lg py-8 text-on-surface-variant">
                          Loading jobs…
                        </td>
                      </tr>
                    )}
                    {!loading && jobs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-stack-lg py-8 text-on-surface-variant">
                          {hasActiveFilters
                            ? "No jobs match your filters."
                            : "No job listings yet."}
                        </td>
                      </tr>
                    )}
                    {jobs.map((item) => (
                      <tr key={item.id} className="group transition-colors hover:bg-tertiary-fixed/30">
                        <td className="max-w-[280px] px-stack-lg py-4">
                          <p className="line-clamp-3 font-label-bold" title={item.title}>
                            {item.title}
                          </p>
                          {item.jobSourceType === "GOVERNMENT" && (
                            <span className="mt-1 inline-block rounded bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
                              Government
                            </span>
                          )}
                        </td>
                        <td className="px-stack-lg py-4 font-label-bold">{getJobEmployerName(item)}</td>
                        <td className="px-stack-lg py-4 text-body-md">
                          {item.city ?? item.location ?? "—"}
                        </td>
                        <td className="px-stack-lg py-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-label-sm font-label-bold",
                              statusBadgeClass(item.status),
                            )}
                          >
                            {statusLabel(item.status)}
                          </span>
                        </td>
                        <td className="px-stack-lg py-4 text-body-md">
                          {item.applicationDeadline
                            ? formatJobClosingDate(item.applicationDeadline)
                            : formatJobClosingDate(null)}
                        </td>
                        <td className="px-stack-lg py-4 text-body-md">
                          {formatApprovedAdmin(item)}
                        </td>
                        <td className={stickyActionCellClass}>
                          <div className="flex justify-end gap-0.5">
                            {item.status === "PENDING_REVIEW" && (
                              <>
                                <button
                                  type="button"
                                  disabled={actionId === item.id}
                                  onClick={() => handleModerate(item.id, "reject")}
                                  aria-label={`Reject ${item.title}`}
                                  title="Reject"
                                  className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error disabled:opacity-50"
                                >
                                  <Icon name="close" />
                                </button>
                                <button
                                  type="button"
                                  disabled={actionId === item.id}
                                  onClick={() => handleModerate(item.id, "approve")}
                                  aria-label={`Approve ${item.title}`}
                                  title="Approve"
                                  className="rounded-full p-2 text-secondary transition-colors hover:bg-secondary/10 disabled:opacity-50"
                                >
                                  <Icon name="check_circle" />
                                </button>
                              </>
                            )}
                            {item.status === "PUBLISHED" && (
                              <Link
                                href={`/jobs/${item.slug}`}
                                target="_blank"
                                aria-label={`View live: ${item.title}`}
                                title="View live"
                                className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary"
                              >
                                <Icon name="open_in_new" />
                              </Link>
                            )}
                            <Link
                              href={reviewHref(item)}
                              aria-label={
                                item.status === "PENDING_REVIEW"
                                  ? `Review ${item.title}`
                                  : `View details: ${item.title}`
                              }
                              title={item.status === "PENDING_REVIEW" ? "Review" : "Details"}
                              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary"
                            >
                              <Icon
                                name={item.status === "PENDING_REVIEW" ? "rate_review" : "visibility"}
                              />
                            </Link>
                            <button
                              type="button"
                              disabled={actionId === item.id}
                              onClick={() => void handleDelete(item)}
                              aria-label={`Delete ${item.title}`}
                              title="Delete"
                              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error disabled:opacity-50"
                            >
                              <Icon name="delete" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!loading && pages > 1 && (
                <nav
                  className="flex flex-wrap items-center justify-center gap-2 border-t border-outline-variant px-stack-lg py-stack-md"
                  aria-label="Job listings pagination"
                >
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="chevron_left" />
                  </button>
                  {paginationItems.map((item, index) =>
                    item === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1 text-label-sm text-outline"
                        aria-hidden
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        aria-label={`Page ${item}`}
                        aria-current={page === item ? "page" : undefined}
                        onClick={() => goToPage(item)}
                        className={`flex h-10 min-w-10 items-center justify-center rounded px-2 font-label-bold transition-colors ${
                          page === item
                            ? "bg-primary text-on-primary"
                            : "border border-outline-variant hover:bg-surface-container"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={page >= pages}
                    onClick={() => goToPage(page + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="chevron_right" />
                  </button>
                </nav>
              )}
            </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
