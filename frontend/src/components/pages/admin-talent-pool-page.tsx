"use client";

import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";

const TALENT = [
  { name: "Dr. Anika Mendis", title: "Chief Strategy Officer", location: "Colombo", score: 98, tier: "C-Suite" },
  { name: "James Whitmore", title: "VP Engineering", location: "London", score: 94, tier: "V-Level" },
  { name: "Sarah Chen", title: "Principal Architect", location: "Singapore", score: 91, tier: "Senior Technical" },
];

const SENIORITY = [
  { label: "C-Suite / Board", pct: 18 },
  { label: "V-Level Management", pct: 32 },
  { label: "Senior Technical Expert", pct: 41 },
  { label: "General Professional", pct: 9 },
];

export function AdminTalentPoolPage() {
  return (
    <RecruiterAdminShell activeNav="talent">
      <AdminPageCanvas className="max-w-[1440px]">
        <section className="mb-stack-lg flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-headline-lg tracking-tight text-primary">Executive Talent Pool</h1>
            <p className="mt-1 text-on-surface-variant">
              Institutional database of high-net-worth professionals and specialized experts.
            </p>
          </div>
          <div className="flex gap-4">
            <button type="button" className="flex items-center gap-2 border border-primary px-6 py-2 font-label-bold hover:bg-surface-container">
              <Icon name="filter_list" className="text-[18px]" />
              Advanced Filters
            </button>
            <button type="button" className="flex items-center gap-2 bg-primary px-6 py-2 font-label-bold text-on-primary">
              <Icon name="download" className="text-[18px]" />
              Export Talent Data
            </button>
          </div>
        </section>

        <div className="mb-stack-lg grid grid-cols-12 gap-stack-md">
          <div className="col-span-12 flex flex-col justify-between glass-card p-6 lg:col-span-4">
            <span className="text-label-sm font-bold uppercase tracking-widest text-secondary">Growth Velocity</span>
            <h3 className="mt-2 text-headline-lg text-primary">
              +12.4% <span className="text-label-bold font-normal text-on-surface-variant">this month</span>
            </h3>
            <div className="mt-6 flex h-24 items-end gap-1">
              {[40, 55, 45, 70, 85, 100].map((h, i) => (
                <div key={i} className={`flex-1 ${i === 5 ? "bg-primary" : "bg-surface-container"}`} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="col-span-12 glass-card p-6 lg:col-span-5">
            <h3 className="mb-6 font-label-bold text-primary">Distribution by Seniority</h3>
            <div className="space-y-4">
              {SENIORITY.map((s) => (
                <div key={s.label}>
                  <div className="mb-1 flex justify-between text-label-sm">
                    <span>{s.label}</span>
                    <span className="font-bold">{s.pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container">
                    <div className="h-full bg-primary" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 glass-card p-6 lg:col-span-3">
            <h3 className="font-label-bold text-primary">AI Match Index</h3>
            <p className="mt-2 text-headline-md text-primary">94.2</p>
            <p className="mt-4 text-label-sm text-on-surface-variant">Top-tier candidate readiness score</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
            <h3 className="font-label-bold text-primary">Senior Professionals</h3>
          </div>
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low/50">
              <tr>
                {["Candidate", "Title", "Location", "Tier", "Match Score", ""].map((h) => (
                  <th key={h} className="px-6 py-3 text-label-sm font-label-bold uppercase text-on-surface-variant">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {TALENT.map((t) => (
                <tr key={t.name} className="hover:bg-surface-container-low">
                  <td className="px-6 py-4 font-label-bold">{t.name}</td>
                  <td className="px-6 py-4 text-body-md">{t.title}</td>
                  <td className="px-6 py-4 text-label-sm">{t.location}</td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-surface-container-high px-2 py-1 text-label-sm">{t.tier}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-secondary">{t.score}%</td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" className="text-secondary">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
