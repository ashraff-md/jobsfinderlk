"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { getJobApplications } from "@/lib/api/applications";
import { getEmployerJobs } from "@/lib/api/jobs";
import type { EmployerJob, JobApplication } from "@/lib/api/types";
import { signInPath } from "@/lib/auth/portal";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type ApplicationRow = JobApplication & {
  jobId: string;
  jobTitle: string;
};

type StatusFilter =
  | "all"
  | "pending"
  | "review"
  | "interviewing"
  | "offer"
  | "rejected";

type DateFilter = "all" | "7" | "30";

function applicantName(application: JobApplication) {
  return application.user.seekerProfile?.fullName?.trim() || application.user.email;
}

function applicantInitials(application: JobApplication) {
  const name = applicantName(application);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatStatus(status: string) {
  return status
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusBucket(status: string): Exclude<StatusFilter, "all"> {
  const normalized = status.toLowerCase();
  if (normalized.includes("reject")) return "rejected";
  if (normalized.includes("offer")) return "offer";
  if (normalized.includes("interview")) return "interviewing";
  if (normalized.includes("review") || normalized.includes("screen")) return "review";
  return "pending";
}

function statusBadgeClass(status: string) {
  const bucket = statusBucket(status);
  switch (bucket) {
    case "review":
      return "border border-blue-100 bg-blue-50 text-blue-700";
    case "interviewing":
      return "border border-indigo-100 bg-indigo-50 text-indigo-700";
    case "offer":
      return "border border-secondary/20 bg-secondary/10 text-secondary";
    case "rejected":
      return "border border-error/20 bg-error-container/30 text-error";
    default:
      return "border border-outline-variant bg-surface-container-high text-primary-container";
  }
}

function formatAppliedDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function withinDateRange(createdAt: string, filter: DateFilter) {
  if (filter === "all") return true;
  const days = Number(filter);
  const cutoff = Date.now() - days * 86400000;
  return new Date(createdAt).getTime() >= cutoff;
}

function matchesStatusFilter(status: string, filter: StatusFilter) {
  if (filter === "all") return true;
  return statusBucket(status) === filter;
}

export function EmployerApplicationsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("30");
  const [page, setPage] = useState(1);

  const loadApplications = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("employer"));
      return;
    }

    setLoading(true);
    try {
      const employerJobs = await getEmployerJobs();
      setJobs(employerJobs);

      const applicationGroups = await Promise.all(
        employerJobs.map(async (job) => {
          const applications = await getJobApplications(job.id);
          return applications.map((application) => ({
            ...application,
            jobId: job.id,
            jobTitle: job.title,
          }));
        }),
      );

      setRows(applicationGroups.flat().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("employer"));
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const stats = useMemo(() => {
    const total = rows.length;
    const pendingReview = rows.filter((row) => statusBucket(row.status) === "pending").length;
    const interviewing = rows.filter((row) => statusBucket(row.status) === "interviewing").length;
    const offers = rows.filter((row) => statusBucket(row.status) === "offer").length;
    return { total, pendingReview, interviewing, offers };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      if (jobFilter !== "all" && row.jobId !== jobFilter) return false;
      if (!matchesStatusFilter(row.status, statusFilter)) return false;
      if (!withinDateRange(row.createdAt, dateFilter)) return false;
      if (!query) return true;

      const name = applicantName(row).toLowerCase();
      const email = row.user.email.toLowerCase();
      const headline = row.user.seekerProfile?.headline?.toLowerCase() ?? "";
      const jobTitle = row.jobTitle.toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        headline.includes(query) ||
        jobTitle.includes(query)
      );
    });
  }, [rows, searchQuery, jobFilter, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, jobFilter, statusFilter, dateFilter]);

  const showJobColumn = jobFilter === "all";

  const clearFilters = () => {
    setSearchQuery("");
    setJobFilter("all");
    setStatusFilter("all");
    setDateFilter("30");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    jobFilter !== "all" ||
    statusFilter !== "all" ||
    dateFilter !== "30";

  const rangeStart = filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  return (
    <>
      <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary-container">
            Application Pipeline
          </h1>
          <p className="mt-1 font-body-md text-body-md text-outline">
            Manage and track candidate progress across your open roles.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={filteredRows.length === 0}
            className="rounded border border-outline-variant bg-white px-6 py-2.5 font-bold text-label-bold text-primary-container transition-all hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export Data
          </button>
          <Link
            href="/employer/jobs"
            className="rounded bg-primary-container px-6 py-2.5 font-bold text-label-bold text-white shadow-md transition-all hover:bg-black active:scale-95"
          >
            Manage Jobs
          </Link>
        </div>
      </header>

      <section className="mb-12 grid grid-cols-1 gap-gutter md:grid-cols-4">
        <div className="professional-card flex flex-col justify-between rounded p-6">
          <div>
            <p className="mb-2 text-[11px] font-label-bold uppercase tracking-widest text-outline">
              Total Applicants
            </p>
            <h3 className="text-headline-lg font-bold text-primary-container">
              {loading ? "—" : stats.total.toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[12px] font-label-bold text-secondary">
            <Icon name="group" className="text-[18px]" />
            <span>Across all listings</span>
          </div>
        </div>

        <div className="professional-card flex flex-col justify-between rounded border-l-4 border-l-secondary-container p-6">
          <div>
            <p className="mb-2 text-[11px] font-label-bold uppercase tracking-widest text-outline">
              Pending Review
            </p>
            <h3 className="text-headline-lg font-bold text-primary-container">
              {loading ? "—" : stats.pendingReview.toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[12px] font-label-bold text-on-surface-variant">
            <Icon name="history" className="text-[18px]" />
            <span>Awaiting first action</span>
          </div>
        </div>

        <div className="professional-card flex flex-col justify-between rounded p-6">
          <div>
            <p className="mb-2 text-[11px] font-label-bold uppercase tracking-widest text-outline">
              Interviewing
            </p>
            <h3 className="text-headline-lg font-bold text-primary-container">
              {loading ? "—" : stats.interviewing.toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[12px] font-label-bold text-emerald-600">
            <Icon name="event_available" className="text-[18px]" />
            <span>In interview stage</span>
          </div>
        </div>

        <div className="professional-card flex flex-col justify-between rounded p-6">
          <div>
            <p className="mb-2 text-[11px] font-label-bold uppercase tracking-widest text-outline">
              Offers Sent
            </p>
            <h3 className="text-headline-lg font-bold text-primary-container">
              {loading ? "—" : stats.offers.toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[12px] font-label-bold text-secondary">
            <Icon name="verified" className="text-[18px]" />
            <span>Offer stage</span>
          </div>
        </div>
      </section>

      <section className="professional-card mb-8 flex flex-nowrap items-center gap-2 overflow-x-auto rounded bg-surface-container-low/30 p-4 sm:gap-4 sm:p-6">
        <div className="relative min-w-[180px] flex-1">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded border border-outline-variant bg-white py-2 pl-10 pr-4 text-body-md outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </div>
        <select
          value={jobFilter}
          onChange={(event) => setJobFilter(event.target.value)}
          className="min-w-[160px] shrink-0 cursor-pointer appearance-none rounded border border-outline-variant bg-white bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat px-4 py-2 pr-10 text-label-bold text-primary-container outline-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2376767f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
          }}
        >
          <option value="all">All Job Titles</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          className="min-w-[140px] shrink-0 cursor-pointer appearance-none rounded border border-outline-variant bg-white bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat px-4 py-2 pr-10 text-label-bold text-primary-container outline-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2376767f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
          }}
        >
          <option value="all">Status: All</option>
          <option value="pending">Pending</option>
          <option value="review">In Review</option>
          <option value="interviewing">Interviewing</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value as DateFilter)}
          className="min-w-[130px] shrink-0 cursor-pointer appearance-none rounded border border-outline-variant bg-white bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat px-4 py-2 pr-10 text-label-bold text-primary-container outline-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2376767f'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
          }}
        >
          <option value="30">Last 30 Days</option>
          <option value="7">Last 7 Days</option>
          <option value="all">All Time</option>
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto flex shrink-0 items-center gap-2 rounded px-3 py-2 font-bold text-label-bold text-secondary transition-colors hover:bg-white"
          >
            <Icon name="filter_alt_off" />
            Clear Filters
          </button>
        )}
      </section>

      <section className="professional-card mb-12 flex flex-col overflow-hidden rounded">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-[11px] font-bold uppercase tracking-widest text-outline">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Applied Date</th>
                <th className="px-6 py-4">Headline</th>
                {showJobColumn && <th className="px-6 py-4">Job</th>}
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td
                    colSpan={showJobColumn ? 6 : 5}
                    className="px-6 py-12 text-center text-outline"
                  >
                    Loading applications…
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={showJobColumn ? 6 : 5}
                    className="px-6 py-12 text-center text-outline"
                  >
                    {jobs.length === 0
                      ? "Post a job to start receiving applications."
                      : "No candidates match your filters."}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr
                    key={row.id}
                    className="group transition-colors hover:bg-surface-container-low/50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-highest font-bold text-primary-container">
                          {applicantInitials(row)}
                        </div>
                        <div>
                          <p className="font-label-bold text-primary-container">
                            {applicantName(row)}
                          </p>
                          <p className="text-[11px] text-outline">{row.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-label-sm text-outline">
                      {formatAppliedDate(row.createdAt)}
                    </td>
                    <td className="px-6 py-5 text-label-sm text-outline">
                      {row.user.seekerProfile?.headline?.trim() || "—"}
                    </td>
                    {showJobColumn && (
                      <td className="px-6 py-5 text-label-sm text-outline">{row.jobTitle}</td>
                    )}
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          "rounded px-2.5 py-1 text-[11px] font-bold",
                          statusBadgeClass(row.status),
                        )}
                      >
                        {formatStatus(row.status)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          type="button"
                          title="Message"
                          className="rounded p-2 text-secondary hover:bg-surface-container-high"
                        >
                          <Icon name="chat_bubble" className="text-[20px]" />
                        </button>
                        <a
                          href={`mailto:${row.user.email}`}
                          title="Email candidate"
                          className="rounded p-2 text-primary-container hover:bg-surface-container-high"
                        >
                          <Icon name="mail" className="text-[20px]" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest p-4">
          <p className="text-label-sm text-outline">
            {filteredRows.length === 0
              ? "No candidates to show"
              : `Showing ${rangeStart} to ${rangeEnd} of ${filteredRows.length} candidate${filteredRows.length === 1 ? "" : "s"}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage <= 1}
              className="rounded border border-outline-variant p-2 transition-colors hover:bg-surface-container-low disabled:opacity-50"
            >
              <Icon name="chevron_left" />
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage >= totalPages}
              className="rounded border border-outline-variant p-2 transition-colors hover:bg-surface-container-low disabled:opacity-50"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
