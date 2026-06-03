"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import { approveJob, getPendingJobs, rejectJob } from "@/lib/api/admin";
import type { Job } from "@/lib/api/types";

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

export function AdminJobsApprovalPage() {
  const router = useRouter();
  const [pending, setPending] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoading(true);
    try {
      const jobs = await getPendingJobs();
      setPending(jobs);
      setSelectedId(jobs[0]?.id ?? null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleModerate = async (id: string, action: "approve" | "reject") => {
    setActionId(id);
    try {
      if (action === "approve") await approveJob(id);
      else await rejectJob(id);
      setPending((prev) => prev.filter((j) => j.id !== id));
      if (selectedId === id) setSelectedId(null);
    } finally {
      setActionId(null);
    }
  };

  const selected = pending.find((j) => j.id === selectedId);

  return (
    <RecruiterAdminShell activeNav="jobs">
      <AdminPageCanvas>
        <div className="mb-stack-lg flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-headline-lg text-on-background">Ad Approval Queue</h1>
            <p className="text-body-md text-on-surface-variant">
              Review pending job postings and advertisements for compliance and quality.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg border border-outline-variant px-6 py-2 font-label-bold transition-colors hover:bg-surface-container"
            >
              Export Logs
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 space-y-gutter lg:col-span-8">
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
              {[
                {
                  icon: "pending_actions",
                  label: "Pending Approval",
                  value: String(pending.length),
                  trend: pending.length > 0 ? "Active" : "Clear",
                  trendClass: pending.length > 0 ? "text-error" : "text-secondary",
                },
                { icon: "verified", label: "Quality Score", value: "High", trend: "94%", trendClass: "text-secondary" },
                {
                  icon: "payments",
                  label: "In Queue",
                  value: String(pending.length),
                  trend: "Live",
                  trendClass: "text-on-surface-variant",
                },
              ].map((stat) => (
                <div key={stat.label} className="glass-card flex flex-col justify-between rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <Icon name={stat.icon} className="rounded-lg bg-secondary-container/20 p-2 text-secondary" />
                    <span className={`font-label-bold ${stat.trendClass}`}>{stat.trend}</span>
                  </div>
                  <div className="mt-4">
                    <p className="font-label-bold text-on-surface-variant">{stat.label}</p>
                    <h3 className="text-headline-md">{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low p-stack-md">
                <h3 className="font-label-bold">Active Approval Requests</h3>
                <span className="rounded-full bg-secondary-container/20 px-3 py-1 text-label-sm font-label-bold text-secondary">
                  {loading ? "…" : `${pending.length} pending`}
                </span>
              </div>
              <div className="divide-y divide-outline-variant">
                {loading && (
                  <p className="p-stack-md text-on-surface-variant">Loading pending jobs…</p>
                )}
                {!loading && pending.length === 0 && (
                  <p className="p-stack-md text-center text-on-surface-variant">
                    No jobs awaiting review. New submissions will appear here.
                  </p>
                )}
                {pending.map((item) => (
                  <div
                    key={item.id}
                    className={`group flex items-center gap-6 p-stack-md transition-colors hover:bg-surface-container ${
                      selectedId === item.id ? "bg-surface-container" : ""
                    }`}
                  >
                    <Link
                      href={reviewHref(item)}
                      className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-variant font-bold text-primary transition-colors group-hover:border-secondary"
                    >
                      {companyInitials(item.company.name)}
                    </Link>
                    <Link href={reviewHref(item)} className="min-w-0 flex-1">
                      <h4 className="font-label-bold group-hover:text-secondary">{item.company.name}</h4>
                      <p className="text-body-md">{item.title}</p>
                      <p className="mt-2 text-label-sm text-outline">
                        {item.location ?? item.city ?? "Pending review"}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={actionId === item.id}
                        onClick={() => handleModerate(item.id, "reject")}
                        className="rounded-lg p-2 text-error transition-colors hover:bg-error-container disabled:opacity-50"
                        aria-label="Reject"
                      >
                        <Icon name="block" />
                      </button>
                      <Link
                        href={reviewHref(item)}
                        className="rounded-lg bg-secondary px-4 py-2 font-label-bold text-on-secondary transition-transform hover:scale-95"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {pending.length > 0 && (
                <div className="bg-surface-container-low p-stack-md text-center">
                  <button
                    type="button"
                    onClick={loadPending}
                    className="font-label-bold text-secondary hover:underline"
                  >
                    Refresh queue
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
              <div className="mb-stack-lg flex items-center justify-between">
                <h3 className="text-headline-md">Quick Review</h3>
                <Icon name="verified_user" className="text-outline" />
              </div>
              {selected ? (
                <div className="space-y-stack-md">
                  <div>
                    <p className="font-label-bold">{selected.title}</p>
                    <p className="text-label-sm text-on-surface-variant">{selected.company.name}</p>
                  </div>
                  <p className="line-clamp-4 text-label-sm text-on-surface-variant">{selected.description}</p>
                  <div className="space-y-3 border-t border-outline-variant pt-4">
                    <Link
                      href={reviewHref(selected)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-3 font-label-bold text-on-secondary hover:opacity-90"
                    >
                      Open full review
                      <Icon name="arrow_forward" />
                    </Link>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={actionId === selected.id}
                        onClick={() => handleModerate(selected.id, "approve")}
                        className="rounded-lg bg-primary py-3 font-label-bold text-on-primary disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={actionId === selected.id}
                        onClick={() => handleModerate(selected.id, "reject")}
                        className="rounded-lg border border-error py-3 font-label-bold text-error disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-on-surface-variant">
                  Select a job from the queue, or use <strong>Review</strong> to open the compliance page.
                </p>
              )}
            </div>
          </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
