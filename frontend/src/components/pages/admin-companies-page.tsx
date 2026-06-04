"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import {
  approveCompanyRequest,
  getCompanyRequests,
  rejectCompanyRequest,
} from "@/lib/api/admin";
import type { CompanyRequest } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Pending review" },
  { value: "APPROVED", label: "Approved" },
  { value: "MERGED", label: "Merged" },
  { value: "REJECTED", label: "Rejected" },
] as const;

function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function statusLabel(status: CompanyRequest["status"]) {
  switch (status) {
    case "PENDING":
      return "Pending review";
    case "APPROVED":
      return "Approved";
    case "MERGED":
      return "Merged";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

function statusBadgeClass(status: CompanyRequest["status"]) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800";
    case "APPROVED":
      return "bg-green-100 text-green-700";
    case "MERGED":
      return "bg-blue-100 text-blue-800";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

export function AdminCompaniesPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRequests(
        await getCompanyRequests({
          status: statusFilter,
          q: debouncedSearch,
        }),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
        return;
      }
      setRequests([]);
      setError(err instanceof ApiError ? err.message : "Failed to load company requests.");
    } finally {
      setLoading(false);
    }
  }, [router, statusFilter, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionId(id);
    try {
      if (action === "approve") await approveCompanyRequest(id);
      else await rejectCompanyRequest(id);
      await load();
    } finally {
      setActionId(null);
    }
  };

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "PENDING").length,
    [requests],
  );

  const hasActiveFilters = useMemo(
    () => statusFilter !== "all" || debouncedSearch.trim().length > 0,
    [statusFilter, debouncedSearch],
  );

  return (
    <RecruiterAdminShell activeNav="companies">
      <AdminPageCanvas className="space-y-stack-lg md:px-margin-desktop">
        <div>
          <h1 className="text-headline-xl text-on-surface">Company Onboarding</h1>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            Review registration requests and track onboarding outcomes.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-error">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[200px] flex-1 space-y-2">
            <label htmlFor="company-search" className="font-label-bold text-label-sm text-on-surface-variant">
              Search
            </label>
            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                id="company-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Company, industry, domain, city…"
                className="w-full rounded-lg border border-outline-variant py-2.5 pl-10 pr-4 font-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="min-w-[180px] space-y-2">
            <label htmlFor="company-status" className="font-label-bold text-label-sm text-on-surface-variant">
              Status
            </label>
            <select
              id="company-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-outline-variant px-4 py-2.5 font-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="rounded-lg border border-outline-variant px-4 py-2.5 font-label-bold text-on-surface-variant hover:bg-surface-container-low"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-low px-stack-lg py-stack-md">
            <h3 className="text-headline-md text-on-surface">Company applications</h3>
            <span className="rounded-full bg-secondary-container px-3 py-1 text-label-sm font-label-bold text-on-secondary">
              {loading ? "…" : `${requests.length} shown`}
              {!loading && statusFilter === "all" && pendingCount > 0
                ? ` · ${pendingCount} pending`
                : ""}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low/50">
                  {["Company Name", "Industry", "City", "Status", "Submission Date", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-stack-lg py-4 font-label-bold uppercase tracking-wider text-outline"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-stack-lg py-8 text-on-surface-variant">
                      Loading company requests…
                    </td>
                  </tr>
                )}
                {!loading && requests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-stack-lg py-8 text-on-surface-variant">
                      {hasActiveFilters
                        ? "No company requests match your filters."
                        : "No company requests yet."}
                    </td>
                  </tr>
                )}
                {requests.map((request) => (
                  <tr key={request.id} className="transition-colors hover:bg-tertiary-fixed/30">
                    <td className="px-stack-lg py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-surface-container-high font-bold text-secondary">
                          {request.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img alt="" src={request.logoUrl} className="h-full w-full object-cover" />
                          ) : (
                            companyInitials(request.companyName)
                          )}
                        </div>
                        <p className="font-label-bold">{request.companyName}</p>
                      </div>
                    </td>
                    <td className="px-stack-lg py-4">
                      <span className="rounded bg-surface-container-highest px-2 py-1 text-label-sm">
                        {request.industry ?? "—"}
                      </span>
                    </td>
                    <td className="px-stack-lg py-4 text-body-md">{request.city ?? "—"}</td>
                    <td className="px-stack-lg py-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-label-sm font-label-bold",
                          statusBadgeClass(request.status),
                        )}
                      >
                        {statusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-stack-lg py-4 text-body-md">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-stack-lg py-4">
                      <div className="flex justify-end gap-2">
                        {request.status === "PENDING" && (
                          <>
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
                          </>
                        )}
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
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
