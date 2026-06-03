"use client";

import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";

const AUDIT_LOG = [
  { action: "Admin approved job posting", user: "alex@jobsfinder.lk", time: "2m ago" },
  { action: "Company merge completed", user: "system", time: "14m ago" },
  { action: "Recruiter verification flagged", user: "moderator@jobsfinder.lk", time: "1h ago" },
];

export function AdminGovernancePage() {
  return (
    <RecruiterAdminShell activeNav="governance">
      <AdminPageCanvas className="max-w-[1440px]">
        <div className="mb-stack-lg flex items-end justify-between">
          <div>
            <h1 className="text-headline-lg text-primary">Governance &amp; Security Hub</h1>
            <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
              Monitor system integrity, manage data privacy protocols, and oversee executive audit trails.
            </p>
          </div>
          <button type="button" className="flex items-center rounded-lg bg-primary px-6 py-3 font-label-bold text-on-primary hover:opacity-90">
            <Icon name="security" className="mr-2" />
            Generate Security Report
          </button>
        </div>

        <div className="bento-grid">
          <div className="col-span-12 rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md lg:col-span-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-headline-md text-primary">System Security Health</h3>
              <span className="rounded-full bg-green-100 px-3 py-1 text-label-sm font-label-bold text-green-800">
                All Systems Operational
              </span>
            </div>
            <div className="relative h-[300px]">
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-2">
                {[60, 45, 80, 95, 70, 55, 85, 90, 65, 40].map((h, i) => (
                  <div
                    key={i}
                    className={`w-8 rounded-t-sm ${i === 3 || i === 7 ? "bg-primary" : "bg-secondary-container"}`}
                    style={{ height: `${h}%`, opacity: i === 3 ? 1 : 0.2 + (i % 5) * 0.15 }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-4 border-t border-outline-variant pt-6">
              {[
                { label: "Active Sessions", value: "1,284" },
                { label: "Blocked Threats", value: "42", error: true },
                { label: "Data Uptime", value: "99.98%" },
                { label: "Avg Latency", value: "24ms", accent: true },
              ].map((s, i) => (
                <div key={s.label} className={`text-center ${i > 0 ? "border-l border-outline-variant" : ""}`}>
                  <p className="text-label-sm text-on-surface-variant">{s.label}</p>
                  <p className={`text-headline-md ${s.error ? "text-error" : s.accent ? "text-secondary" : ""}`}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card col-span-12 flex flex-col rounded-xl p-stack-md lg:col-span-4">
            <div className="mb-6 flex items-center">
              <Icon name="privacy_tip" filled className="mr-2 text-secondary" />
              <h3 className="font-label-bold uppercase tracking-widest text-primary">Compliance Status</h3>
            </div>
            <div className="flex-1 space-y-4">
              {[
                { label: "GDPR Readiness", pct: 100 },
                { label: "CCPA Compliance", pct: 95 },
                { label: "ISO 27001", pct: 78, pending: true },
              ].map((c) => (
                <div key={c.label} className="rounded-lg border border-outline-variant bg-surface p-4">
                  <div className="mb-2 flex justify-between">
                    <p className="font-label-bold">{c.label}</p>
                    <span className={`text-label-sm font-bold ${c.pending ? "text-on-surface-variant" : "text-secondary"}`}>
                      {c.pending ? "In Review" : "Compliant"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-container">
                    <div
                      className={`h-1.5 rounded-full ${c.pending ? "bg-outline" : "bg-secondary"}`}
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="mt-6 w-full rounded border border-primary py-3 font-label-bold text-primary hover:bg-surface-container-low">
              Review Compliance Documentation
            </button>
          </div>

          <div className="col-span-12 rounded-xl border border-outline-variant bg-surface-container-lowest lg:col-span-12">
            <div className="border-b border-outline-variant px-6 py-4">
              <h3 className="font-label-bold text-primary">Recent Audit Trail</h3>
            </div>
            <ul className="divide-y divide-outline-variant">
              {AUDIT_LOG.map((entry) => (
                <li key={entry.action} className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low">
                  <div>
                    <p className="font-label-bold">{entry.action}</p>
                    <p className="text-label-sm text-on-surface-variant">{entry.user}</p>
                  </div>
                  <span className="text-label-sm text-outline">{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
