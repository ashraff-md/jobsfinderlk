"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import {
  approveCompanyRequest,
  approveJob,
  getPendingCompanyRequests,
  getPendingJobs,
  mergeCompanyRequest,
  rejectCompanyRequest,
  rejectJob,
} from "@/lib/api/admin";
import type { CompanyRequest, Job } from "@/lib/api/types";

const MODERATION_USERS = [
  {
    initials: "JD",
    name: "Jane Doe",
    email: "jane.doe@example.lk",
    status: "Verified",
    statusClass: "bg-secondary-fixed text-on-secondary-fixed",
    score: 95,
    scoreClass: "bg-secondary",
    subscription: "Premium Plus",
  },
  {
    initials: "MW",
    name: "Marlon Wick",
    email: "m.wick@techcorp.lk",
    status: "Flagged",
    statusClass: "bg-surface-container-highest text-on-surface-variant",
    score: 32,
    scoreClass: "bg-error",
    subscription: "Enterprise Trial",
  },
];

function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function AdminHubPage() {
  const router = useRouter();
  const [pending, setPending] = useState<Job[]>([]);
  const [companyRequests, setCompanyRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [companyActionId, setCompanyActionId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<Record<string, string>>({});

  const loadPending = useCallback(async () => {
    if (!getAccessToken()) {
      router.push("/auth/sign-in");
      return;
    }
    setLoading(true);
    try {
      const [jobs, requests] = await Promise.all([
        getPendingJobs(),
        getPendingCompanyRequests(),
      ]);
      setPending(jobs);
      setCompanyRequests(requests);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/auth/sign-in");
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
    } finally {
      setActionId(null);
    }
  };

  const handleCompanyAction = async (
    id: string,
    action: "approve" | "reject" | "merge",
  ) => {
    setCompanyActionId(id);
    try {
      if (action === "approve") await approveCompanyRequest(id);
      else if (action === "reject") await rejectCompanyRequest(id);
      else {
        const companyId = mergeTargetId[id];
        if (!companyId) return;
        await mergeCompanyRequest(id, companyId);
      }
      setCompanyRequests((prev) => prev.filter((request) => request.id !== id));
    } finally {
      setCompanyActionId(null);
    }
  };

  return (
    <AdminShell variant="hub" activeNav="dashboard">
      <div className="space-y-stack-lg p-stack-lg">
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-4">
          <div className="professional-card col-span-1 flex flex-col justify-between rounded-lg border border-outline-variant bg-white p-6 transition-colors hover:bg-surface-container-low md:col-span-2">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-label-bold text-on-surface-variant">MONTHLY RECURRING REVENUE</h3>
                <Icon name="payments" className="text-secondary" />
              </div>
              <p className="mt-2 text-headline-xl">$242,500.00</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-secondary">
              <Icon name="trending_up" />
              <span className="font-label-bold">+12.5% from last month</span>
            </div>
          </div>

          <div className="professional-card rounded-lg border border-outline-variant bg-white p-stack-md">
            <h3 className="mb-stack-md font-label-bold text-on-surface-variant">AI MATCHING ACCURACY</h3>
            <div className="relative flex h-24 items-end gap-1">
              {[85, 70, 95, 90, 98].map((height, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t-sm ${i === 4 ? "bg-secondary" : "bg-secondary-container"}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <p className="mt-stack-md text-headline-md">98.2%</p>
          </div>

          <div className="professional-card flex flex-col justify-between rounded-lg border border-outline-variant bg-white p-stack-md">
            <h3 className="font-label-bold text-on-surface-variant">PLATFORM HEALTH</h3>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary-fixed-dim border-t-secondary" />
              <div>
                <p className="font-label-bold">99.98%</p>
                <p className="text-label-sm text-on-surface-variant">Uptime Status</p>
              </div>
            </div>
          </div>
        </div>

        <div className="professional-card overflow-hidden rounded-lg border border-outline-variant bg-white">
          <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
            <h2 className="text-headline-md">New Company Requests</h2>
            <span className="rounded bg-surface-container-high px-2 py-1 text-label-sm font-label-bold">
              {loading ? "…" : `${companyRequests.length} PENDING`}
            </span>
          </div>
          <div className="divide-y divide-outline-variant">
            {loading && (
              <p className="p-6 text-on-surface-variant">Loading company requests…</p>
            )}
            {!loading && companyRequests.length === 0 && (
              <p className="p-6 text-on-surface-variant">No company requests awaiting review.</p>
            )}
            {companyRequests.map((request) => (
              <div key={request.id} className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h4 className="font-label-bold">{request.companyName}</h4>
                    <p className="text-label-sm text-on-surface-variant">
                      {request.industry} • {request.location} • {request.companyType}
                    </p>
                    <p className="mt-1 text-label-sm text-on-surface-variant">
                      Requested by {request.requestedBy?.email ?? "unknown recruiter"}
                    </p>
                    {request.requestedBy?.employerUsers?.length ? (
                      <p className="text-label-sm text-on-surface-variant">
                        Recruiter history:{" "}
                        {request.requestedBy.employerUsers
                          .map((link) => link.company.name)
                          .join(", ")}
                      </p>
                    ) : null}
                    {request.description ? (
                      <p className="mt-2 line-clamp-3 text-label-sm text-on-surface-variant">
                        {request.description}
                      </p>
                    ) : null}
                    {request.lifeAtCompanyImages?.length ? (
                      <p className="mt-1 text-label-sm text-on-surface-variant">
                        {request.lifeAtCompanyImages.length} life-at-company photo
                        {request.lifeAtCompanyImages.length === 1 ? "" : "s"} attached
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={companyActionId === request.id}
                      onClick={() => handleCompanyAction(request.id, "reject")}
                      className="rounded px-3 py-2 text-label-sm font-label-bold text-error hover:bg-error-container disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={companyActionId === request.id}
                      onClick={() => handleCompanyAction(request.id, "approve")}
                      className="rounded bg-secondary px-3 py-2 text-label-sm font-label-bold text-on-secondary disabled:opacity-50"
                    >
                      Approve as new
                    </button>
                  </div>
                </div>

                {request.similarCompanies && request.similarCompanies.length > 0 && (
                  <div className="rounded-lg bg-surface-container-low p-4">
                    <p className="font-label-bold">Similar existing companies</p>
                    <div className="mt-3 space-y-2">
                      {request.similarCompanies.map((company) => (
                        <label
                          key={company.id}
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`merge-${request.id}`}
                              checked={mergeTargetId[request.id] === company.id}
                              onChange={() =>
                                setMergeTargetId((prev) => ({
                                  ...prev,
                                  [request.id]: company.id,
                                }))
                              }
                            />
                            <div>
                              <p className="font-label-bold">{company.name}</p>
                              <p className="text-label-sm text-on-surface-variant">
                                {Math.round(company.score * 100)}% match • {company.matchType}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={
                              companyActionId === request.id ||
                              mergeTargetId[request.id] !== company.id
                            }
                            onClick={() => handleCompanyAction(request.id, "merge")}
                            className="rounded border border-outline-variant px-3 py-1.5 text-label-sm font-label-bold disabled:opacity-50"
                          >
                            Merge
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
          <div className="professional-card flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
              <h2 className="text-headline-md">Job Approval Queue</h2>
              <span className="rounded bg-surface-container-high px-2 py-1 text-label-sm font-label-bold">
                {loading ? "…" : `${pending.length} PENDING`}
              </span>
            </div>
            <div className="divide-y divide-outline-variant">
              {loading && (
                <p className="p-6 text-on-surface-variant">Loading pending jobs…</p>
              )}
              {!loading && pending.length === 0 && (
                <p className="p-6 text-on-surface-variant">No jobs awaiting review.</p>
              )}
              {pending.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-6 transition-colors hover:bg-surface-container-low"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-surface-variant font-bold text-primary">
                      {companyInitials(item.company.name)}
                    </div>
                    <div>
                      <h4 className="font-label-bold">{item.title}</h4>
                      <p className="text-label-sm text-on-surface-variant">
                        {item.company.name} • Pending review
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={actionId === item.id}
                      onClick={() => handleModerate(item.id, "reject")}
                      className="rounded p-2 text-error transition-colors hover:bg-error-container disabled:opacity-50"
                    >
                      <Icon name="close" />
                    </button>
                    <button
                      type="button"
                      disabled={actionId === item.id}
                      onClick={() => handleModerate(item.id, "approve")}
                      className="rounded p-2 text-secondary transition-colors hover:bg-secondary-container disabled:opacity-50"
                    >
                      <Icon name="check" />
                    </button>
                    <Link
                      href={`/jobs/${item.slug}`}
                      className="rounded bg-primary px-4 py-2 text-label-sm font-label-bold text-on-primary"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {pending.length > 0 && (
              <div className="bg-surface-container-low p-4 text-center">
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

          <div className="professional-card flex h-full flex-col rounded-lg border border-outline-variant bg-white">
            <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
              <h2 className="text-headline-md">Security Insights</h2>
              <Icon name="security" className="text-on-surface-variant" />
            </div>
            <div className="flex-1 space-y-6 p-6">
              <div className="flex items-start gap-4 rounded-r-lg border-l-4 border-error bg-error-container/20 p-4">
                <Icon name="warning" className="text-error" />
                <div>
                  <p className="font-label-bold text-on-error-container">Suspicious Recruiter Activity</p>
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    ID: #4920 has posted 12 jobs in 5 minutes. Potential automated spam detected.
                  </p>
                  <button type="button" className="mt-2 text-label-sm font-label-bold text-error underline">
                    Freeze Account
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-r-lg border-l-4 border-secondary-container bg-surface-container p-4">
                <Icon name="info" className="text-secondary" />
                <div>
                  <p className="font-label-bold">High Candidate Surge</p>
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    &quot;Data Scientist&quot; keyword surge in Colombo region (+40%). Updating AI match
                    vectors.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-auto p-6">
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
                <p className="text-label-sm text-on-surface-variant">NETWORK TRAFFIC SOURCE</p>
                <div className="mt-4 space-y-2">
                  {[
                    { label: "Direct Access", value: 62 },
                    { label: "Organic Search", value: 28 },
                  ].map((source) => (
                    <div key={source.label}>
                      <div className="flex items-center justify-between text-label-sm">
                        <span>{source.label}</span>
                        <span className="font-label-bold">{source.value}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-surface-container">
                        <div
                          className="h-1.5 rounded-full bg-secondary"
                          style={{ width: `${source.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="professional-card overflow-hidden rounded-lg border border-outline-variant bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant px-6 py-4">
            <h2 className="text-headline-md">Moderation Dashboard</h2>
            <div className="flex gap-2">
              <button type="button" className="rounded bg-surface-container-high px-4 py-2 font-label-bold">
                Seekers
              </button>
              <button type="button" className="px-4 py-2 font-label-bold text-on-surface-variant">
                Recruiters
              </button>
              <button type="button" className="px-4 py-2 font-label-bold text-on-surface-variant">
                Premium Partners
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  {["User Entity", "Status", "Compliance Score", "Subscription", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className={`px-6 py-3 text-label-sm font-label-bold uppercase text-on-surface-variant ${
                          heading === "Actions" ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {MODERATION_USERS.map((user) => (
                  <tr key={user.email} className="transition-colors hover:bg-surface-container">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-dim">
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-label-bold">{user.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${user.statusClass}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-16 rounded-full bg-surface-container">
                          <div
                            className={`h-1 rounded-full ${user.scoreClass}`}
                            style={{ width: `${user.score}%` }}
                          />
                        </div>
                        <span
                          className={`text-label-sm font-label-bold ${
                            user.score < 50 ? "text-error" : ""
                          }`}
                        >
                          {user.score}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-label-sm">{user.subscription}</td>
                    <td className="px-6 py-4 text-right">
                      <button type="button" className="rounded p-2 hover:bg-surface-container-high">
                        <Icon name="more_vert" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SiteFooter variant="dark" className="shrink-0 py-8" />
    </AdminShell>
  );
}
