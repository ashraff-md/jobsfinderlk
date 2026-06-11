"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { getAdminTalent, getAdminTalentStats } from "@/lib/api/admin";
import { signInPath } from "@/lib/auth/portal";
import type { AdminTalent, AdminTalentStats } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "ACTIVE", label: "Active applicants" },
  { value: "COMPLETE", label: "Complete profiles" },
  { value: "VERIFIED", label: "Email verified" },
  { value: "INCOMPLETE", label: "Incomplete" },
] as const;

function talentInitials(talent: AdminTalent) {
  const source = talent.fullName?.trim() || talent.email;
  return source
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function statusLabel(status: AdminTalent["profileStatus"]) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "COMPLETE":
      return "Complete";
    case "VERIFIED":
      return "Verified";
    case "INCOMPLETE":
      return "Incomplete";
    default:
      return status;
  }
}

function statusBadgeClass(status: AdminTalent["profileStatus"]) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "COMPLETE":
      return "bg-secondary/10 text-secondary";
    case "VERIFIED":
      return "bg-surface-container-high text-on-surface-variant";
    case "INCOMPLETE":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

export function AdminTalentPoolPage() {
  const router = useRouter();
  const [talent, setTalent] = useState<AdminTalent[]>([]);
  const [stats, setStats] = useState<AdminTalentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      const [list, talentStats] = await Promise.all([
        getAdminTalent({
          status: statusFilter,
          q: debouncedSearch,
        }),
        getAdminTalentStats(),
      ]);
      setTalent(list);
      setStats(talentStats);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
        return;
      }
      setTalent([]);
      setStats(null);
      setError(err instanceof ApiError ? err.message : "Failed to load talent pool.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, router, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasActiveFilters = useMemo(
    () => statusFilter !== "all" || debouncedSearch.trim().length > 0,
    [statusFilter, debouncedSearch],
  );

  const incompleteCount = useMemo(() => {
    if (!stats) return 0;
    return (
      stats.distribution.find((item) => item.label === "Basic Registration")?.count ?? 0
    );
  }, [stats]);

  return (
    <RecruiterAdminShell activeNav="talent">
      <AdminPageCanvas className="md:px-margin-desktop">
        <div className="mb-stack-lg">
          <h1 className="text-headline-lg text-on-background">Talent Pool</h1>
          <p className="text-body-md text-on-surface-variant">
            Manage job seeker accounts and candidate profiles across the platform.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-error">
            {error}
          </div>
        ) : null}

        <div className="space-y-gutter">
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {[
              {
                icon: "group",
                label: "Total candidates",
                value: stats ? String(stats.total) : "—",
                trend: "Platform",
                trendClass: "text-on-surface-variant",
              },
              {
                icon: "send",
                label: "Active applicants",
                value: stats ? String(stats.activeApplicants) : "—",
                trend: (stats?.activeApplicants ?? 0) > 0 ? "Engaged" : "Clear",
                trendClass:
                  (stats?.activeApplicants ?? 0) > 0 ? "text-secondary" : "text-on-surface-variant",
              },
              {
                icon: "pending_actions",
                label: "Incomplete profiles",
                value: stats ? String(incompleteCount) : "—",
                trend: incompleteCount > 0 ? "Action needed" : "Clear",
                trendClass: incompleteCount > 0 ? "text-error" : "text-secondary",
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
            searchPlaceholder="Search name, email, headline…"
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
              <h3 className="font-label-bold">All candidates</h3>
              <span className="rounded-full bg-secondary-container/20 px-3 py-1 text-label-sm font-label-bold text-secondary">
                {loading ? "…" : `${talent.length} shown`}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant bg-surface-container-low">
                  <tr>
                    {["Candidate", "Headline", "Applications", "Status", "Joined", "Action"].map(
                      (h) => (
                        <th
                          key={h}
                          className={cn(
                            "px-stack-md py-4 font-label-bold text-on-surface-variant",
                            h === "Action" && "w-[80px] px-3 text-right",
                          )}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-stack-md py-8 text-on-surface-variant">
                        Loading candidates…
                      </td>
                    </tr>
                  ) : talent.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-stack-md py-8 text-center text-on-surface-variant">
                        {hasActiveFilters
                          ? "No candidates match your filters."
                          : "No candidates yet."}
                      </td>
                    </tr>
                  ) : (
                    talent.map((candidate) => (
                      <tr key={candidate.id} className="transition-colors hover:bg-surface-container">
                        <td className="px-stack-md py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-fixed font-bold text-secondary">
                              {talentInitials(candidate)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-label-bold">
                                {candidate.fullName?.trim() || "Unnamed candidate"}
                              </p>
                              <p className="truncate text-label-sm text-on-surface-variant">
                                {candidate.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[220px] truncate px-stack-md py-4 text-body-md">
                          {candidate.headline?.trim() || "—"}
                        </td>
                        <td className="px-stack-md py-4 font-label-bold text-secondary">
                          {candidate.applicationCount}
                        </td>
                        <td className="px-stack-md py-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-label-sm font-label-bold",
                              statusBadgeClass(candidate.profileStatus),
                            )}
                          >
                            {statusLabel(candidate.profileStatus)}
                          </span>
                        </td>
                        <td className="px-stack-md py-4 text-body-md">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </td>
                        <td className="w-[80px] px-3 py-4 text-right">
                          {candidate.resumeUrl ? (
                            <a
                              href={candidate.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View resume: ${candidate.fullName ?? candidate.email}`}
                              title="View resume"
                              className="inline-flex rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary"
                            >
                              <Icon name="description" />
                            </a>
                          ) : (
                            <span className="text-on-surface-variant">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
