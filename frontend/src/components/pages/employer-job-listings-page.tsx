"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmployerShell } from "@/components/layout/employer-shell";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type JobListing = {
  id: string;
  refId: string;
  title: string;
  status: "active" | "draft" | "closed";
  location: string;
  meta: string;
  applicants: number;
  views: number;
};

const JOB_LISTINGS: JobListing[] = [
  {
    id: "director-engineering",
    refId: "JF-9012",
    title: "Director of Engineering",
    status: "active",
    location: "Colombo, SL (Remote Friendly)",
    meta: "Posted 12 days ago",
    applicants: 42,
    views: 842,
  },
  {
    id: "senior-product-designer",
    refId: "JF-9015",
    title: "Senior Product Designer",
    status: "draft",
    location: "Kandy, SL (On-site)",
    meta: "Last edited 2 hours ago",
    applicants: 0,
    views: 0,
  },
  {
    id: "vp-finance",
    refId: "JF-8992",
    title: "VP of Finance",
    status: "active",
    location: "Colombo, SL",
    meta: "Posted 28 days ago",
    applicants: 156,
    views: 1204,
  },
];

function statusBadgeClass(status: JobListing["status"]) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "draft":
      return "bg-surface-container-high text-on-surface-variant";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

export function EmployerJobListingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return JOB_LISTINGS.filter((job) => {
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      if (!query) return true;
      return (
        job.title.toLowerCase().includes(query) ||
        job.refId.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, statusFilter]);

  const activeCount = JOB_LISTINGS.filter((job) => job.status === "active").length;

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
          <button type="button" className="rounded p-2 text-on-surface-variant transition-colors hover:text-secondary">
            <Icon name="notifications" />
          </button>
          <button type="button" className="rounded p-2 text-on-surface-variant transition-colors hover:text-secondary">
            <Icon name="mail" />
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

      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-label-bold text-outline">Filters:</span>
          <select
            className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 font-label-sm text-on-surface outline-none focus:ring-secondary"
            defaultValue="all"
          >
            <option value="all">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="leadership">Leadership</option>
            <option value="product">Product</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 font-label-sm text-on-surface outline-none focus:ring-secondary"
          >
            <option value="all">Status: All</option>
            <option value="active">Status: Active</option>
            <option value="draft">Status: Draft</option>
            <option value="closed">Status: Closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredListings.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-white p-12 text-center text-on-surface-variant">
            No job listings match your search.
          </div>
        ) : (
          filteredListings.map((job) => (
            <article
              key={job.id}
              className="group flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-all hover:border-secondary hover:shadow-md lg:flex-row lg:items-center"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                      statusBadgeClass(job.status),
                    )}
                  >
                    {job.status}
                  </span>
                  <span className="font-label-sm text-on-surface-variant">ID: {job.refId}</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface transition-colors group-hover:text-secondary">
                  {job.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex items-center font-label-bold text-on-surface-variant">
                    <Icon name="location_on" className="mr-1.5 text-[18px]" />
                    {job.location}
                  </div>
                  <div className="flex items-center font-label-bold text-on-surface-variant">
                    <Icon
                      name={job.status === "draft" ? "edit_note" : "calendar_today"}
                      className="mr-1.5 text-[18px]"
                    />
                    {job.meta}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-8 border-outline-variant sm:flex-row lg:border-l lg:border-r lg:px-12">
                <div className="text-center">
                  <p className="mb-1 font-label-sm text-on-surface-variant">Applicants</p>
                  <p className="font-headline-md text-headline-md text-secondary">{job.applicants}</p>
                </div>
                <div className="text-center">
                  <p className="mb-1 font-label-sm text-on-surface-variant">Views</p>
                  <p className="font-headline-md text-headline-md text-primary-container">
                    {job.views.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex min-w-[180px] flex-wrap gap-3 lg:flex-col xl:flex-row">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center rounded-lg border border-primary-container px-4 py-2 font-label-bold text-primary-container transition-colors hover:bg-surface-container-low xl:flex-none"
                >
                  <Icon name="edit" className="mr-2 text-[18px]" />
                  {job.status === "draft" ? "Continue" : "Edit"}
                </button>
                {job.status === "draft" ? (
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-on-primary-container px-4 py-2 font-label-bold text-white transition-colors hover:opacity-90 xl:flex-none"
                  >
                    <Icon name="publish" className="mr-2 text-[18px]" />
                    Publish
                  </button>
                ) : (
                  <Link
                    href={`/employer/jobs/${job.id}/applicants`}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-secondary px-4 py-2 font-label-bold text-on-secondary transition-colors hover:opacity-90 xl:flex-none"
                  >
                    <Icon name="group" className="mr-2 text-[18px]" />
                    Applicants
                  </Link>
                )}
                <button
                  type="button"
                  className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                  title={job.status === "draft" ? "Delete" : "Archive"}
                >
                  <Icon name={job.status === "draft" ? "delete" : "archive"} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-label-sm text-on-surface-variant">
          Showing {filteredListings.length} of {activeCount} active job listings
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled
            className="rounded-lg border border-outline-variant p-2 hover:bg-surface-container-low disabled:opacity-50"
          >
            <Icon name="chevron_left" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-label-bold text-on-secondary"
          >
            1
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant font-label-bold hover:bg-surface-container-low"
          >
            2
          </button>
          <button type="button" className="rounded-lg border border-outline-variant p-2 hover:bg-surface-container-low">
            <Icon name="chevron_right" />
          </button>
        </div>
      </div>

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
