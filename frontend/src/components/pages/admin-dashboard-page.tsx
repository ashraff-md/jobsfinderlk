"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import {
  getAdminJobStats,
  getAdminRecruiters,
  getGovernmentJobs,
  getPendingCompanyRequests,
  getPendingJobs,
  type AdminJobStats,
} from "@/lib/api/admin";
import type { CompanyRequest, Job } from "@/lib/api/types";

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function companyMeta(request: CompanyRequest) {
  const parts = [request.city, request.industry].filter(Boolean);
  if (parts.length > 0) return parts.join(" • ");
  if (request.website) return request.website;
  return request.requestedBy?.email ?? "Pending review";
}

export function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminJobStats | null>(null);
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [pendingCompanies, setPendingCompanies] = useState<CompanyRequest[]>([]);
  const [pendingRecruiters, setPendingRecruiters] = useState(0);
  const [governmentJobs, setGovernmentJobs] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    try {
      const [jobStats, jobs, companies, recruiters, govJobs] = await Promise.all([
        getAdminJobStats(),
        getPendingJobs(),
        getPendingCompanyRequests(),
        getAdminRecruiters({ status: "PENDING" }),
        getGovernmentJobs(),
      ]);
      setStats(jobStats);
      setPendingJobs(jobs);
      setPendingCompanies(companies);
      setPendingRecruiters(recruiters.length);
      setGovernmentJobs(govJobs.length);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const overviewStats = [
    {
      icon: "publish",
      label: "Published Listings",
      value: stats ? stats.published.toLocaleString() : "—",
    },
    {
      icon: "pending_actions",
      label: "Pending Review",
      value: stats ? stats.pending.toLocaleString() : "—",
    },
    {
      icon: "work",
      label: "Total Listings",
      value: stats ? stats.total.toLocaleString() : "—",
    },
  ];

  const requisitions = pendingJobs.slice(0, 5);
  const verifications = pendingCompanies.slice(0, 5);

  return (
    <RecruiterAdminShell activeNav="dashboard">
      <AdminPageCanvas className="space-y-10">
        <section>
          <div className="mb-6 grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/jobs" className="glass-card rounded-xl p-6 transition-shadow hover:shadow-md">
              <Icon name="pending_actions" className="rounded-lg bg-secondary-container/20 p-2 text-secondary" />
              <p className="mt-4 font-label-bold text-on-surface-variant">Pending Job Approvals</p>
              <h3 className="text-headline-md">{loading ? "—" : pendingJobs.length}</h3>
            </Link>
            <Link
              href="/admin/jobs/government"
              className="glass-card rounded-xl p-6 transition-shadow hover:shadow-md"
            >
              <Icon
                name="account_balance"
                className="rounded-lg bg-primary-fixed/20 p-2 text-on-primary-fixed-variant"
              />
              <p className="mt-4 font-label-bold text-on-surface-variant">Government Postings</p>
              <h3 className="text-headline-md">{loading ? "—" : governmentJobs}</h3>
            </Link>
            <Link href="/admin/companies" className="glass-card rounded-xl p-6 transition-shadow hover:shadow-md">
              <Icon name="business" className="rounded-lg bg-primary-fixed/20 p-2 text-on-primary-fixed-variant" />
              <p className="mt-4 font-label-bold text-on-surface-variant">Company Requests</p>
              <h3 className="text-headline-md">{loading ? "—" : pendingCompanies.length}</h3>
            </Link>
            <Link href="/admin/verifications" className="glass-card rounded-xl p-6 transition-shadow hover:shadow-md">
              <Icon name="verified_user" className="rounded-lg bg-tertiary-container/20 p-2 text-on-tertiary-container" />
              <p className="mt-4 font-label-bold text-on-surface-variant">Recruiter Verifications</p>
              <h3 className="text-headline-md">{loading ? "—" : pendingRecruiters}</h3>
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="text-headline-lg text-primary">Platform Overview</h2>
            <p className="text-on-surface-variant">Live job listing metrics across the platform</p>
          </div>

          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {overviewStats.map((stat) => (
              <div
                key={stat.label}
                className="professional-card group rounded-xl p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-surface-container p-2 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                    <Icon name={stat.icon} />
                  </div>
                </div>
                <p className="text-[11px] font-label-bold uppercase tracking-wider text-on-surface-variant">
                  {stat.label}
                </p>
                <h3 className="mt-1 text-headline-md">{loading ? "—" : stat.value}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          <div className="professional-card overflow-hidden rounded-xl shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest p-6">
              <h3 className="text-body-lg font-bold text-primary">Role Requisition Approval</h3>
              <Link href="/admin/jobs" className="font-bold text-label-bold text-primary hover:underline">
                View Governance Queue
              </Link>
            </div>
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  <tr>
                    <th className="px-6 py-4">Requisition Details</th>
                    <th className="px-6 py-4">Submission</th>
                    <th className="w-[80px] px-3 py-4 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {requisitions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-sm text-on-surface-variant">
                        {loading ? "Loading pending requisitions…" : "No jobs awaiting approval."}
                      </td>
                    </tr>
                  ) : (
                    requisitions.map((job) => (
                      <tr key={job.id} className="transition-colors hover:bg-surface-container-low/30">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-primary-fixed text-primary">
                              <Icon name="work" />
                            </div>
                            <div>
                              <p className="font-bold">{job.title}</p>
                              <p className="text-[11px] text-on-surface-variant">
                                {job.company?.name ?? job.requestedCompanyName ?? "Unknown company"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-label-sm text-on-surface-variant">
                          {timeAgo(job.createdAt)}
                        </td>
                        <td className="w-[80px] px-3 py-5 text-right">
                          <Link
                            href={`/admin/jobs/${job.id}/review`}
                            aria-label={`Review ${job.title}`}
                            title="Review"
                            className="inline-flex rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary"
                          >
                            <Icon name="rate_review" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="professional-card overflow-hidden rounded-xl shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest p-6">
              <h3 className="text-body-lg font-bold text-primary">Corporate Verifications</h3>
              <Link href="/admin/companies" className="font-bold text-label-bold text-primary hover:underline">
                Compliance Portal
              </Link>
            </div>
            <div className="custom-scrollbar overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  <tr>
                    <th className="px-6 py-4">Organization</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="w-[80px] px-3 py-4 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {verifications.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-sm text-on-surface-variant">
                        {loading ? "Loading company requests…" : "No company requests awaiting review."}
                      </td>
                    </tr>
                  ) : (
                    verifications.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-surface-container-low/30">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            {item.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                alt=""
                                className="h-9 w-9 rounded-sm border border-outline-variant object-cover"
                                src={item.logoUrl}
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-outline-variant bg-surface-container-high text-primary">
                                <Icon name="business" className="text-[18px]" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold">{item.companyName}</p>
                              <p className="text-[11px] text-on-surface-variant">{companyMeta(item)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-label-sm text-on-surface-variant">
                          {timeAgo(item.createdAt)}
                        </td>
                        <td className="w-[80px] px-3 py-5 text-right">
                          <Link
                            href={`/admin/companies/${item.id}`}
                            aria-label={`Review ${item.companyName}`}
                            title="Review"
                            className="inline-flex rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary"
                          >
                            <Icon name="rate_review" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
