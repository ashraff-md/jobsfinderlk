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
import { getAdminRecruiters } from "@/lib/api/admin";
import type { AdminRecruiter } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Pending review" },
  { value: "VERIFIED", label: "Verified" },
  { value: "UNLINKED", label: "Unlinked" },
] as const;

function recruiterInitials(recruiter: AdminRecruiter) {
  const source = recruiter.fullName?.trim() || recruiter.email;
  return source
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function statusLabel(status: AdminRecruiter["verificationStatus"]) {
  switch (status) {
    case "VERIFIED":
      return "Verified";
    case "PENDING":
      return "Pending review";
    case "UNLINKED":
      return "Unlinked";
    default:
      return status;
  }
}

function statusBadgeClass(status: AdminRecruiter["verificationStatus"]) {
  switch (status) {
    case "VERIFIED":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-amber-100 text-amber-800";
    case "UNLINKED":
      return "bg-surface-container-high text-on-surface-variant";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

export function AdminVerificationsPage() {
  const router = useRouter();
  const [recruiters, setRecruiters] = useState<AdminRecruiter[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const loadStats = useCallback(async () => {
    try {
      const all = await getAdminRecruiters();
      setStats({
        total: all.length,
        pending: all.filter((r) => r.verificationStatus === "PENDING").length,
        verified: all.filter((r) => r.verificationStatus === "VERIFIED").length,
      });
    } catch {
      /* stats are non-blocking */
    }
  }, []);

  const loadRecruiters = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRecruiters(
        await getAdminRecruiters({
          status: statusFilter,
          q: debouncedSearch,
        }),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
        return;
      }
      setRecruiters([]);
      setError(err instanceof ApiError ? err.message : "Failed to load recruiters.");
    } finally {
      setLoading(false);
    }
  }, [router, statusFilter, debouncedSearch]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void loadRecruiters();
  }, [loadRecruiters]);

  const hasActiveFilters = useMemo(
    () => statusFilter !== "all" || debouncedSearch.trim().length > 0,
    [statusFilter, debouncedSearch],
  );

  return (
    <RecruiterAdminShell activeNav="verifications">
      <AdminPageCanvas className="md:px-margin-desktop">
        <div className="mb-stack-lg">
          <h1 className="text-headline-lg text-on-background">Recruiters</h1>
          <p className="text-body-md text-on-surface-variant">
            Manage employer accounts and verification status across the platform.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-error">
            {error}
          </div>
        )}

        <div className="space-y-gutter">
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {[
              {
                icon: "group",
                label: "Total recruiters",
                value: String(stats.total),
                trend: "Platform",
                trendClass: "text-on-surface-variant",
              },
              {
                icon: "pending_actions",
                label: "Pending review",
                value: String(stats.pending),
                trend: stats.pending > 0 ? "Action needed" : "Clear",
                trendClass: stats.pending > 0 ? "text-error" : "text-secondary",
              },
              {
                icon: "verified_user",
                label: "Verified",
                value: String(stats.verified),
                trend: "Active",
                trendClass: "text-secondary",
              },
            ].map((stat) => (
              <div key={stat.label} className="glass-card flex flex-col justify-between rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <Icon
                    name={stat.icon}
                    className="rounded-lg bg-secondary-container/20 p-2 text-secondary"
                  />
                  <span className={cn("font-label-bold", stat.trendClass)}>{stat.trend}</span>
                </div>
                <div className="mt-4">
                  <p className="font-label-bold text-on-surface-variant">{stat.label}</p>
                  <h3 className="text-headline-md">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <AdminFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search name, email, company…"
            filters={[
              {
                value: statusFilter,
                onChange: setStatusFilter,
                options: STATUS_FILTERS,
                ariaLabel: "Filter by status",
              },
            ]}
            showClear={hasActiveFilters}
            onClear={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
          />

          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low p-stack-md">
              <h3 className="font-label-bold">All recruiters</h3>
              <span className="rounded-full bg-secondary-container/20 px-3 py-1 text-label-sm font-label-bold text-secondary">
                {loading ? "…" : `${recruiters.length} shown`}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant bg-surface-container-low">
                  <tr>
                    {["Recruiter", "Company", "Email", "Status", "Joined", "Actions"].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          "px-stack-md py-4 font-label-bold text-on-surface-variant",
                          h === "Actions" && "w-[80px] px-3 text-right",
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-stack-md py-8 text-on-surface-variant">
                        Loading recruiters…
                      </td>
                    </tr>
                  )}
                  {!loading && recruiters.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-stack-md py-8 text-center text-on-surface-variant">
                        {hasActiveFilters
                          ? "No recruiters match your filters."
                          : "No recruiters yet."}
                      </td>
                    </tr>
                  )}
                  {recruiters.map((recruiter) => (
                    <tr key={recruiter.userId} className="transition-colors hover:bg-surface-container">
                      <td className="px-stack-md py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-fixed font-bold text-secondary">
                            {recruiterInitials(recruiter)}
                          </div>
                          <p className="font-label-bold">
                            {recruiter.fullName?.trim() || recruiter.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-stack-md py-4">
                        <div className="flex items-center gap-2">
                          <Icon name="business_center" className="text-[18px] text-on-surface-variant" />
                          <span>{recruiter.companyName ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-stack-md py-4 text-body-md">{recruiter.email}</td>
                      <td className="px-stack-md py-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-label-sm font-label-bold",
                            statusBadgeClass(recruiter.verificationStatus),
                          )}
                        >
                          {statusLabel(recruiter.verificationStatus)}
                        </span>
                      </td>
                      <td className="px-stack-md py-4 text-body-md">
                        {new Date(recruiter.createdAt).toLocaleDateString()}
                      </td>
                      <td className="w-[80px] px-3 py-4 text-right">
                        <Link
                          href={`/admin/verifications/${recruiter.userId}`}
                          aria-label={`Review ${recruiter.fullName ?? recruiter.email}`}
                          title="Review"
                          className="inline-flex rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary"
                        >
                          <Icon name="rate_review" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
