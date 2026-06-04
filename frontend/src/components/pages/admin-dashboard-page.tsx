"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import { getPendingCompanyRequests, getPendingJobs } from "@/lib/api/admin";

const STATS = [
  { icon: "group", label: "Total Candidates", value: "128,432", trend: "12.4%" },
  { icon: "work", label: "Active Engagements", value: "12,504", trend: "8.2%" },
  { icon: "verified", label: "Corporate Clients", value: "3,210", trend: "4.1%" },
  { icon: "payments", label: "Gross Revenue", value: "$42.9k", trend: "24.5%" },
];

const REQUISITIONS = [
  {
    icon: "shield_person",
    iconBg: "bg-primary-fixed text-primary",
    title: "Chief Technology Officer",
    company: "Nebula Capital Partners",
    time: "2h ago",
  },
  {
    icon: "auto_awesome",
    iconBg: "bg-secondary-fixed text-secondary",
    title: "VP of Strategic Design",
    company: "Quantum Creatives",
    time: "5h ago",
  },
];

const VERIFICATIONS = [
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzme4qCOmV5D4J80FNV6aojl80nXcC8LrGpdRTN1Pnsswsgzlvi_5teKWnpNZ_3oE_4zgqyJhx2v_vxJJr0J3ljWtrhpNNy97U3DrJehvZ5eer8QdubdylgKuLcdTqN820Zxuc_sfIV-l878SnNr6tGtzU_Pd2yHTM423FGo--qywh2aD-ebjtEKY9CR9ZXD1GTw79Hs0SRiKsQOXYNltcoXaGTN28MEGXNGLZEipd05HDZ19oDV3ApyMzoATj_Cne6Bt4pwarqsWD",
    name: "SV Innovators",
    meta: "Global HQ • USA",
    evidence: "SEC Filings",
    status: "IN REVIEW",
    statusClass: "bg-surface-container text-primary",
    statusIcon: "pending_actions",
  },
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4CdPoIXgmZeik6Q7x7VrT_LCEHPLv13vxzpp217ylArUF0QLV1VGlPoceUd0as59f3dhimJJtlUtgjgGialk-NdbAqAIiR76Ce5udEurbRozpoDcgsUizlIGvtOnQpfiGCp1FZ_dpjl7EtnSKFcMKSWHRCGIBcazqxyvOskFyuDJKiHvA2QTqaDU8XHABzydJp7NuOqC9e-uLO1rSNXCvfR5CJTuCmZDSSycqQJPfPvf2lmfo45W11qLsq4bKK05g7pFEnMv0PFyE",
    name: "Finance Partners",
    meta: "Tax ID: #883921",
    evidence: "Articles of Incorp.",
    status: "URGENT",
    statusClass: "bg-error-container text-error",
    statusIcon: "priority_high",
  },
];

const CHART_HEIGHTS = [40, 55, 45, 70, 85, 95, 75];
const ENGAGEMENT_HEIGHTS = [30, 40, 35, 50, 60, 75, 65];

export function AdminDashboardPage() {
  const router = useRouter();
  const [pendingJobs, setPendingJobs] = useState(0);
  const [pendingCompanies, setPendingCompanies] = useState(0);

  const loadCounts = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    try {
      const [jobs, companies] = await Promise.all([
        getPendingJobs(),
        getPendingCompanyRequests(),
      ]);
      setPendingJobs(jobs.length);
      setPendingCompanies(companies.length);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
      }
    }
  }, [router]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  return (
    <RecruiterAdminShell activeNav="dashboard">
      <AdminPageCanvas className="space-y-10">
        <section>
          <div className="mb-6 grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/jobs" className="glass-card rounded-xl p-6 transition-shadow hover:shadow-md">
              <Icon name="pending_actions" className="rounded-lg bg-secondary-container/20 p-2 text-secondary" />
              <p className="mt-4 font-label-bold text-on-surface-variant">Pending Job Approvals</p>
              <h3 className="text-headline-md">{pendingJobs}</h3>
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
              <h3 className="text-headline-md">View all</h3>
            </Link>
            <Link href="/admin/companies" className="glass-card rounded-xl p-6 transition-shadow hover:shadow-md">
              <Icon name="business" className="rounded-lg bg-primary-fixed/20 p-2 text-on-primary-fixed-variant" />
              <p className="mt-4 font-label-bold text-on-surface-variant">Company Requests</p>
              <h3 className="text-headline-md">{pendingCompanies}</h3>
            </Link>
            <Link href="/admin/verifications" className="glass-card rounded-xl p-6 transition-shadow hover:shadow-md">
              <Icon name="verified_user" className="rounded-lg bg-tertiary-container/20 p-2 text-on-tertiary-container" />
              <p className="mt-4 font-label-bold text-on-surface-variant">Recruiter Verifications</p>
              <h3 className="text-headline-md">24</h3>
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-headline-lg text-primary">Platform Overview</h2>
              <p className="text-on-surface-variant">Key performance indicators for Q4 cycle</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-1.5 text-label-bold font-semibold transition-all hover:bg-surface-container-low"
              >
                <Icon name="calendar_today" className="text-[18px]" />
                Past 30 Days
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-inverse-surface px-3 py-1.5 text-label-bold font-semibold text-white transition-all hover:opacity-90"
              >
                <Icon name="download" className="text-[18px]" />
                Export Data
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="professional-card group rounded-xl p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-surface-container p-2 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                    <Icon name={stat.icon} />
                  </div>
                  <span className="flex items-center gap-0.5 text-label-sm font-bold text-secondary">
                    <Icon name="trending_up" className="text-[16px]" />
                    {stat.trend}
                  </span>
                </div>
                <p className="text-[11px] font-label-bold uppercase tracking-wider text-on-surface-variant">
                  {stat.label}
                </p>
                <h3 className="mt-1 text-headline-md">{stat.value}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
          <div className="professional-card rounded-xl p-8 shadow-sm lg:col-span-2">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h3 className="text-headline-md font-bold text-primary">Revenue Distribution</h3>
                <p className="text-label-sm text-on-surface-variant">
                  Engagement fees vs. retainer billings
                </p>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-[12px] font-label-bold">Retainers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-secondary" />
                  <span className="text-[12px] font-label-bold">Engagements</span>
                </div>
              </div>
            </div>
            <div className="relative flex h-72 items-end gap-3 px-2">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-0 w-full border-b border-outline-variant/50" />
                ))}
              </div>
              {CHART_HEIGHTS.map((height, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all ${
                    i === 5 ? "bg-primary hover:bg-primary/90" : "bg-primary/10 hover:bg-primary/30"
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
              {ENGAGEMENT_HEIGHTS.map((height, i) => (
                <div
                  key={`eng-${i}`}
                  className={`-ml-3 flex-1 rounded-t ${
                    i === 5 ? "bg-secondary hover:bg-secondary/90" : "bg-secondary/10 hover:bg-secondary/30"
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <div className="professional-card space-y-8 rounded-xl p-8 shadow-sm">
            <h3 className="text-headline-md font-bold text-primary">System Integrity</h3>
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider">AI Accuracy Rating</span>
                  <span className="font-bold text-primary">94.2%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full w-[94.2%] bg-primary" />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Service Uptime</span>
                  <span className="font-bold text-secondary">99.9%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full w-[99.9%] bg-secondary" />
                </div>
              </div>
            </div>
            <div className="space-y-4 border-t border-outline-variant pt-6">
              <div className="flex items-center justify-between rounded-lg border border-error/20 bg-error-container/30 p-4">
                <div className="flex items-center gap-3">
                  <Icon name="gpp_maybe" className="text-error" />
                  <div>
                    <p className="font-bold text-error">Security Alerts</p>
                    <p className="text-[11px] text-on-error-container">12 anomalies detected</p>
                  </div>
                </div>
                <Icon name="chevron_right" className="text-outline" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-low p-4">
                <div className="flex items-center gap-3">
                  <Icon name="verified_user" className="text-primary" />
                  <div>
                    <p className="font-bold">Infrastructure</p>
                    <p className="text-[11px] text-on-surface-variant">All nodes operating</p>
                  </div>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
              </div>
            </div>
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
                    <th className="px-6 py-4 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {REQUISITIONS.map((item) => (
                    <tr key={item.title} className="transition-colors hover:bg-surface-container-low/30">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded ${item.iconBg}`}
                          >
                            <Icon name={item.icon} />
                          </div>
                          <div>
                            <p className="font-bold">{item.title}</p>
                            <p className="text-[11px] text-on-surface-variant">{item.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-label-sm text-on-surface-variant">{item.time}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-3">
                          <button type="button" className="rounded p-1.5 text-outline transition-all hover:bg-error/5 hover:text-error">
                            <Icon name="close" className="text-[20px]" />
                          </button>
                          <button type="button" className="rounded p-1.5 text-primary transition-all hover:bg-primary/5">
                            <Icon name="check_circle" className="text-[20px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                    <th className="px-6 py-4">Evidence Type</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {VERIFICATIONS.map((item) => (
                    <tr key={item.name} className="transition-colors hover:bg-surface-container-low/30">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt="Company Logo"
                            className="h-9 w-9 rounded-sm border border-outline-variant object-cover"
                            src={item.logo}
                          />
                          <div>
                            <p className="font-bold">{item.name}</p>
                            <p className="text-[11px] text-on-surface-variant">{item.meta}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-label-sm">{item.evidence}</td>
                      <td className="px-6 py-5 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${item.statusClass}`}
                        >
                          <Icon name={item.statusIcon} className="text-[14px]" />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
