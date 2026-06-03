"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmployerShell } from "@/components/layout/employer-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getEmployerJobs } from "@/lib/api/jobs";
import type { EmployerJob } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type ListingStatus = "active" | "draft" | "pending" | "closed";

type JobListing = {
  id: string;
  slug: string;
  refId: string;
  title: string;
  status: ListingStatus;
  location: string;
  meta: string;
  category: string | null;
  applicants: number;
};

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function mapListingStatus(status?: string): ListingStatus {
  switch (status) {
    case "PUBLISHED":
      return "active";
    case "DRAFT":
      return "draft";
    case "PENDING_REVIEW":
      return "pending";
    default:
      return "closed";
  }
}

function toJobListing(job: EmployerJob): JobListing {
  const status = mapListingStatus(job.status);
  const location =
    [job.location, job.city].filter(Boolean).join(" • ") || "Location not set";

  let meta: string;
  if (status === "draft") {
    meta = `Last edited ${timeAgo(job.updatedAt ?? job.createdAt)}`;
  } else if (status === "pending") {
    meta = `Submitted ${timeAgo(job.createdAt)}`;
  } else if (status === "active") {
    meta = `Posted ${timeAgo(job.publishedAt ?? job.createdAt)}`;
  } else {
    meta = `Updated ${timeAgo(job.updatedAt ?? job.createdAt)}`;
  }

  return {
    id: job.id,
    slug: job.slug,
    refId: job.id.slice(0, 8).toUpperCase(),
    title: job.title,
    status,
    location,
    meta,
    category: job.category ?? null,
    applicants: job._count?.applications ?? 0,
  };
}

function statusBadgeClass(status: ListingStatus) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "draft":
      return "bg-surface-container-high text-on-surface-variant";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

function statusLabel(status: ListingStatus) {
  if (status === "pending") return "pending review";
  return status;
}

export function EmployerJobListingsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployerJobs();
      setJobs(data.map(toJobListing));
    } catch (err) {
      setJobs([]);
      setError(
        err instanceof ApiError ? err.message : "Failed to load your job listings.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const departments = useMemo(() => {
    const values = new Set(
      jobs.map((job) => job.category).filter((value): value is string => Boolean(value)),
    );
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return jobs.filter((job) => {
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      if (departmentFilter !== "all" && job.category !== departmentFilter) return false;
      if (!query) return true;
      return (
        job.title.toLowerCase().includes(query) ||
        job.refId.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    });
  }, [jobs, searchQuery, statusFilter, departmentFilter]);

  const activeCount = jobs.filter((job) => job.status === "active").length;

  return (
    <EmployerShell activeNav="listings">
      <header className="mb-8 flex flex-col gap-4 border-b border-outline-variant pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xl">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search listings..."
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-body-md outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => void loadJobs()}
            disabled={loading}
            className="rounded p-2 text-on-surface-variant transition-colors hover:text-secondary disabled:opacity-50"
            title="Refresh listings"
          >
            <Icon name="refresh" />
          </button>
        </div>
      </header>

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Manage Job Listings</h1>
          <p className="mt-1 font-body-lg text-on-surface-variant">
            Review and manage your current career opportunities.
          </p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary-container px-8 py-3 font-label-bold text-white shadow-sm transition-all hover:bg-black active:scale-95"
        >
          <Icon name="add" className="mr-2" />
          Post New Job
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-md text-on-error-container">
          {error}
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-label-bold text-outline">Filters:</span>
          <select
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 font-label-sm text-on-surface outline-none focus:ring-secondary"
          >
            <option value="all">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 font-label-sm text-on-surface outline-none focus:ring-secondary"
          >
            <option value="all">Status: All</option>
            <option value="active">Status: Active</option>
            <option value="pending">Status: Pending review</option>
            <option value="draft">Status: Draft</option>
            <option value="closed">Status: Closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="rounded-xl border border-outline-variant bg-white p-12 text-center text-on-surface-variant">
            Loading your job listings…
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-white p-12 text-center text-on-surface-variant">
            {jobs.length === 0 ? (
              <div className="space-y-4">
                <p>You have not posted any jobs yet.</p>
                <Link
                  href="/employer/jobs/new"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-label-bold text-on-primary"
                >
                  Post your first job
                </Link>
              </div>
            ) : (
              "No job listings match your filters."
            )}
          </div>
        ) : (
          filteredListings.map((job) => (
            <article
              key={job.id}
              className="group flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-all hover:border-secondary hover:shadow-md lg:flex-row lg:items-center"
            >
              <div className="flex-1">
                <h2 className="text-lg font-bold leading-snug text-on-surface transition-colors group-hover:text-secondary">
                  {job.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                      statusBadgeClass(job.status),
                    )}
                  >
                    {statusLabel(job.status)}
                  </span>
                  <span className="font-label-sm text-on-surface-variant">ID: {job.refId}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex items-center font-label-bold text-on-surface-variant">
                    <Icon name="location_on" className="mr-1.5 text-[18px]" />
                    {job.location}
                  </div>
                  <div className="flex items-center font-label-bold text-on-surface-variant">
                    <Icon
                      name={
                        job.status === "draft"
                          ? "edit_note"
                          : job.status === "pending"
                            ? "hourglass_top"
                            : "calendar_today"
                      }
                      className="mr-1.5 text-[18px]"
                    />
                    {job.meta}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-8 border-outline-variant sm:flex-row lg:border-l lg:px-12">
                <div className="text-center">
                  <p className="mb-1 font-label-sm text-on-surface-variant">Applicants</p>
                  <p className="font-headline-md text-headline-md text-secondary">{job.applicants}</p>
                </div>
              </div>

              <div className="flex min-w-[180px] flex-wrap gap-3 lg:flex-col xl:flex-row">
                {job.status === "active" && (
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-outline-variant px-4 py-2 font-label-bold text-on-surface-variant transition-colors hover:bg-surface-container-low xl:flex-none"
                  >
                    View live
                  </Link>
                )}
                {job.status === "draft" ? (
                  <Link
                    href="/employer/jobs/new"
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-primary-container px-4 py-2 font-label-bold text-primary-container transition-colors hover:bg-surface-container-low xl:flex-none"
                  >
                    <Icon name="edit" className="mr-2 text-[18px]" />
                    Continue
                  </Link>
                ) : job.status === "active" ? (
                  <Link
                    href={`/employer/jobs/${job.id}/applicants`}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-secondary px-4 py-2 font-label-bold text-on-secondary transition-colors hover:opacity-90 xl:flex-none"
                  >
                    <Icon name="group" className="mr-2 text-[18px]" />
                    Applicants
                  </Link>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>

      {!loading && jobs.length > 0 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-label-sm text-on-surface-variant">
            Showing {filteredListings.length} of {jobs.length} job listing
            {jobs.length === 1 ? "" : "s"} ({activeCount} live)
          </p>
        </div>
      )}

      <Link
        href="/employer/jobs/new"
        className="fixed bottom-20 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-white shadow-lg transition-transform active:scale-95 md:hidden"
        aria-label="Post new job"
      >
        <Icon name="add" className="text-[32px]" />
      </Link>
    </EmployerShell>
  );
}
