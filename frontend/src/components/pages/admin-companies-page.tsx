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
  approveCompanyRequest,
  getPendingCompanyRequests,
  mergeCompanyRequest,
  rejectCompanyRequest,
} from "@/lib/api/admin";
import type { CompanyRequest } from "@/lib/api/types";

const MOCK_COMPANIES = [
  { id: "mock-1", initials: "NT", name: "NexGen Tech", location: "San Francisco, CA", industry: "Information Technology", reg: "REG-2024-00129", date: "Oct 24, 2023" },
  { id: "mock-2", initials: "AP", name: "Apex Partners", location: "Colombo, LK", industry: "Financial Services", reg: "REG-2024-00130", date: "Oct 23, 2023" },
];

function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function AdminCompaniesPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoading(true);
    try {
      setRequests(await getPendingCompanyRequests());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) router.push(signInPath("admin"));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (id: string, action: "approve" | "reject" | "merge") => {
    setActionId(id);
    try {
      if (action === "approve") await approveCompanyRequest(id);
      else if (action === "reject") await rejectCompanyRequest(id);
      else {
        const companyId = mergeTargetId[id];
        if (!companyId) return;
        await mergeCompanyRequest(id, companyId);
      }
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setActionId(null);
    }
  };

  const count = requests.length || 12;

  return (
    <RecruiterAdminShell activeNav="companies">
      <AdminPageCanvas className="space-y-stack-lg md:px-margin-desktop">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-headline-xl text-on-surface">Company Onboarding</h1>
            <p className="mt-2 text-body-lg text-on-surface-variant">
              Manage pending registrations and official entity creation.
            </p>
          </div>
          <div className="flex gap-4">
            <button type="button" className="flex items-center gap-2 rounded-lg border border-primary px-6 py-2.5 font-label-bold text-primary hover:bg-primary-fixed-dim/10">
              <Icon name="filter_list" className="text-sm" />
              Filters
            </button>
            <button type="button" className="rounded-lg bg-primary px-6 py-2.5 font-label-bold text-on-primary shadow-sm hover:opacity-90">
              Download Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 space-y-gutter lg:col-span-8">
            <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
              <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-stack-lg py-stack-md">
                <h3 className="text-headline-md text-on-surface">Pending Applications</h3>
                <span className="rounded-full bg-secondary-container px-3 py-1 text-label-sm font-label-bold text-on-secondary">
                  {loading ? "…" : `${count} Pending`}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      {["Company Name", "Industry", "Reg. Number", "Submission Date", "Actions"].map((h) => (
                        <th key={h} className="px-stack-lg py-4 font-label-bold uppercase tracking-wider text-outline">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {loading && (
                      <tr>
                        <td colSpan={5} className="px-stack-lg py-8 text-on-surface-variant">
                          Loading company requests…
                        </td>
                      </tr>
                    )}
                    {!loading && requests.length === 0 &&
                      MOCK_COMPANIES.map((c) => (
                        <tr key={c.id} className="transition-colors hover:bg-tertiary-fixed/30">
                          <td className="px-stack-lg py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded bg-surface-container-high font-bold text-secondary">
                                {c.initials}
                              </div>
                              <div>
                                <p className="font-label-bold text-on-surface">{c.name}</p>
                                <p className="text-label-sm text-outline">{c.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-stack-lg py-4">
                            <span className="rounded bg-surface-container-highest px-2 py-1 text-label-sm text-on-surface-variant">
                              {c.industry}
                            </span>
                          </td>
                          <td className="px-stack-lg py-4 text-body-md">{c.reg}</td>
                          <td className="px-stack-lg py-4 text-body-md">{c.date}</td>
                          <td className="px-stack-lg py-4 text-right">
                            <Link href={`/admin/companies/${c.id}`} className="font-label-bold text-secondary hover:underline">
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
                    {requests.map((request) => (
                      <tr key={request.id} className="transition-colors hover:bg-tertiary-fixed/30">
                        <td className="px-stack-lg py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-surface-container-high font-bold text-secondary">
                              {companyInitials(request.companyName)}
                            </div>
                            <div>
                              <p className="font-label-bold">{request.companyName}</p>
                              <p className="text-label-sm text-outline">
                                {request.location ?? "—"} • {request.companyType ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-stack-lg py-4">
                          <span className="rounded bg-surface-container-highest px-2 py-1 text-label-sm">
                            {request.industry ?? "—"}
                          </span>
                        </td>
                        <td className="px-stack-lg py-4 text-body-md">{request.emailDomain ?? "—"}</td>
                        <td className="px-stack-lg py-4 text-body-md">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-stack-lg py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={actionId === request.id}
                              onClick={() => handleAction(request.id, "reject")}
                              className="rounded px-3 py-1.5 text-label-sm font-label-bold text-error hover:bg-error-container disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              disabled={actionId === request.id}
                              onClick={() => handleAction(request.id, "approve")}
                              className="rounded bg-secondary px-3 py-1.5 text-label-sm font-label-bold text-on-secondary disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <Link
                              href={`/admin/companies/${request.id}`}
                              className="rounded border border-outline-variant px-3 py-1.5 text-label-sm font-label-bold"
                            >
                              Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {requests.map((request) =>
              request.similarCompanies && request.similarCompanies.length > 0 ? (
                <div key={`merge-${request.id}`} className="rounded-lg bg-surface-container-low p-4">
                  <p className="font-label-bold">Similar companies — {request.companyName}</p>
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
                              setMergeTargetId((prev) => ({ ...prev, [request.id]: company.id }))
                            }
                          />
                          <div>
                            <p className="font-label-bold">{company.name}</p>
                            <p className="text-label-sm text-on-surface-variant">
                              {Math.round(company.score * 100)}% match
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={actionId === request.id || mergeTargetId[request.id] !== company.id}
                          onClick={() => handleAction(request.id, "merge")}
                          className="rounded border border-outline-variant px-3 py-1.5 text-label-sm font-label-bold disabled:opacity-50"
                        >
                          Merge
                        </button>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-label-bold text-primary">Onboarding Velocity</h3>
              <p className="text-headline-md text-primary">+18.2%</p>
              <p className="mt-2 text-label-sm text-on-surface-variant">Faster than last quarter average</p>
              <div className="mt-6 flex h-24 items-end gap-1">
                {[40, 55, 45, 70, 85, 100].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm ${i === 5 ? "bg-primary" : "bg-surface-container"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
