"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import { getGovernmentJobs } from "@/lib/api/admin";
import type { Job } from "@/lib/api/types";
import { getJobEmployerName } from "@/lib/jobs/job-employer-name";
import { cn } from "@/lib/utils";

function statusLabel(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "Published";
    case "PENDING_REVIEW":
      return "Pending review";
    case "DRAFT":
      return "Draft";
    case "REJECTED":
      return "Rejected";
    case "CLOSED":
      return "Closed";
    case "EXPIRED":
      return "Expired";
    default:
      return status.replace(/_/g, " ").toLowerCase();
  }
}

function statusClass(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "bg-secondary-container/15 text-secondary";
    case "PENDING_REVIEW":
      return "bg-surface-container-high text-primary";
    case "DRAFT":
      return "bg-surface-container text-on-surface-variant";
    case "REJECTED":
      return "bg-error-container/30 text-error";
    default:
      return "bg-surface-container text-on-surface-variant";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

const GOVERNMENT_STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "DRAFT", label: "Draft" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CLOSED", label: "Closed" },
  { value: "EXPIRED", label: "Expired" },
] as const;

export function AdminGovernmentJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      if (!q) return true;
      const employer = getJobEmployerName(job).toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        employer.includes(q) ||
        (job.city ?? "").toLowerCase().includes(q)
      );
    });
  }, [jobs, searchQuery, statusFilter]);

  const hasActiveFilters = useMemo(
    () => statusFilter !== "all" || searchQuery.trim().length > 0,
    [searchQuery, statusFilter],
  );

  const loadJobs = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoading(true);
    try {
      const items = await getGovernmentJobs();
      setJobs(items);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return (
    <RecruiterAdminShell activeNav="government">
      <AdminPageCanvas>
        <div className="mb-stack-lg flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <nav className="mb-2 flex font-label-sm uppercase tracking-wider text-outline">
              <Link href="/admin" className="hover:text-secondary">
                Admin
              </Link>
              <span className="mx-2">/</span>
              <span className="text-secondary">Government Postings</span>
            </nav>
            <h1 className="text-headline-lg text-on-background">Government Postings</h1>
            <p className="text-body-md text-on-surface-variant">
              All official government sector vacancies posted through the admin portal.
            </p>
          </div>
          <Link
            href="/admin/jobs/government/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-label-bold text-on-primary transition-opacity hover:opacity-90"
          >
            <Icon name="add" className="text-[18px]" />
            New posting
          </Link>
        </div>

        <AdminFilterBar
          className="mb-stack-lg"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search title, ministry, location…"
          filters={[
            {
              value: statusFilter,
              onChange: setStatusFilter,
              options: GOVERNMENT_STATUS_FILTERS,
              ariaLabel: "Filter by status",
            },
          ]}
          showClear={hasActiveFilters}
          onClear={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }}
        />

        <div className="professional-card overflow-hidden rounded-xl shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-6 py-4">
            <h2 className="font-label-bold text-on-surface">
              {loading
                ? "Loading…"
                : `${filteredJobs.length} posting${filteredJobs.length === 1 ? "" : "s"}`}
            </h2>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-on-surface-variant">Loading postings…</div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <Icon name="account_balance" className="mb-4 text-[48px] text-outline" />
              <p className="font-label-bold text-on-surface">No government postings yet</p>
              <p className="mt-2 max-w-md text-body-md text-on-surface-variant">
                Create your first official government vacancy with gazette references and civil
                service parameters.
              </p>
              <button
                type="button"
                onClick={() => router.push("/admin/jobs/government/new")}
                className="mt-6 rounded-lg bg-secondary px-6 py-2 font-label-bold text-on-secondary"
              >
                Create government posting
              </button>
            </div>
          ) : (
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  <tr>
                    <th className="px-6 py-4">Position</th>
                    <th className="px-6 py-4">Ministry / Department</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Posted</th>
                    <th className="w-[120px] px-3 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                        No postings match your filters.
                      </td>
                    </tr>
                  ) : null}
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="transition-colors hover:bg-surface-container-low/30">
                      <td className="px-6 py-5">
                        <p className="font-bold">{job.title}</p>
                        {job.city && (
                          <p className="text-[11px] text-on-surface-variant">{job.city}</p>
                        )}
                      </td>
                      <td className="px-6 py-5 text-label-sm">{getJobEmployerName(job)}</td>
                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                            statusClass(job.status ?? ""),
                          )}
                        >
                          {statusLabel(job.status ?? "")}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-label-sm text-on-surface-variant">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="w-[120px] px-3 py-5 text-right">
                        <div className="flex justify-end gap-0.5">
                          <Link
                            href={`/admin/jobs/government/${job.id}/edit`}
                            aria-label={`Edit ${job.title}`}
                            title="Edit"
                            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary"
                          >
                            <Icon name="edit" />
                          </Link>
                          {job.status === "PENDING_REVIEW" && (
                            <Link
                              href={`/admin/jobs/${job.id}/review`}
                              aria-label={`Review ${job.title}`}
                              title="Review"
                              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary"
                            >
                              <Icon name="rate_review" />
                            </Link>
                          )}
                          {job.status === "PUBLISHED" && (
                            <Link
                              href={`/jobs/${job.slug}`}
                              target="_blank"
                              aria-label={`View live: ${job.title}`}
                              title="View live"
                              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary"
                            >
                              <Icon name="open_in_new" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
