"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import { getGovernmentJobs } from "@/lib/api/admin";
import type { Job } from "@/lib/api/types";
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

export function AdminGovernmentJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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

        <div className="professional-card overflow-hidden rounded-xl shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-6 py-4">
            <h2 className="font-label-bold text-on-surface">
              {loading ? "Loading…" : `${jobs.length} posting${jobs.length === 1 ? "" : "s"}`}
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
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {jobs.map((job) => (
                    <tr key={job.id} className="transition-colors hover:bg-surface-container-low/30">
                      <td className="px-6 py-5">
                        <p className="font-bold">{job.title}</p>
                        {job.city && (
                          <p className="text-[11px] text-on-surface-variant">{job.city}</p>
                        )}
                      </td>
                      <td className="px-6 py-5 text-label-sm">{job.company.name}</td>
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
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {job.status === "PENDING_REVIEW" && (
                            <Link
                              href={`/admin/jobs/${job.id}/review`}
                              className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-sm font-bold hover:bg-surface-container"
                            >
                              Review
                            </Link>
                          )}
                          {job.status === "PUBLISHED" && (
                            <Link
                              href={`/jobs/${job.slug}`}
                              className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-sm font-bold hover:bg-surface-container"
                            >
                              View live
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
