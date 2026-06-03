"use client";

import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";

const PARTNERS = [
  { initials: "S", name: "Saber Dynamics", meta: "Industrial Tech • Colombo", tier: "Platinum Elite", health: 92 },
  { initials: "H", name: "Horizon Holdings", meta: "Finance • Dubai", tier: "Enterprise", health: 78 },
  { initials: "M", name: "Meridian Labs", meta: "Healthcare • Boston", tier: "Growth", health: 65 },
];

export function AdminPartnersPage() {
  return (
    <RecruiterAdminShell activeNav="partners">
      <AdminPageCanvas className="md:px-margin-desktop">
        <div className="mb-stack-lg flex items-end justify-between">
          <div>
            <h1 className="text-headline-lg tracking-tight text-primary">Partner Ecosystem</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Manage corporate relationships and institutional health scores.
            </p>
          </div>
          <button type="button" className="flex items-center gap-3 rounded-lg bg-primary px-8 py-4 font-label-bold text-on-primary shadow-lg shadow-primary/10">
            <Icon name="domain_add" filled />
            Onboard New Partner
          </button>
        </div>

        <div className="mb-stack-lg grid grid-cols-12 gap-gutter">
          {[
            { label: "Active Partners", value: "1,284", note: "+12% this quarter" },
            { label: "Global Health Score", value: "86.4", bar: 86.4 },
            { label: "Retention Rate", value: "99.2%", note: "Enterprise Standard" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="col-span-12 flex h-40 flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:col-span-4"
            >
              <p className="text-label-sm uppercase tracking-widest text-on-surface-variant">{stat.label}</p>
              <h3 className="text-headline-lg">{stat.value}</h3>
              {stat.bar !== undefined ? (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low">
                  <div className="h-full bg-secondary" style={{ width: `${stat.bar}%` }} />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-secondary">
                  <Icon name={stat.note?.includes("Standard") ? "verified" : "trending_up"} className="text-[16px]" />
                  <span className="text-label-sm">{stat.note}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant bg-surface-bright px-6 py-5">
            <div className="flex gap-2">
              <button type="button" className="rounded bg-primary px-4 py-2 font-label-bold text-on-primary">
                All Partners
              </button>
              {["Enterprise", "Growth", "Needs Attention"].map((tab) => (
                <button key={tab} type="button" className="rounded px-4 py-2 font-label-bold text-on-surface-variant hover:bg-surface-container">
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" className="flex items-center gap-2 rounded border border-outline-variant px-3 py-2 text-label-sm">
                <Icon name="filter_list" className="text-[18px]" />
                Filter
              </button>
              <button type="button" className="flex items-center gap-2 rounded border border-outline-variant px-3 py-2 text-label-sm">
                <Icon name="download" className="text-[18px]" />
                Export
              </button>
            </div>
          </div>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                {["Partner Entity", "Tier", "Hiring Health", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-4 text-label-sm uppercase tracking-widest text-on-surface-variant">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {PARTNERS.map((p) => (
                <tr key={p.name} className="transition-colors hover:bg-surface-container-low">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-primary-container font-black text-on-primary-container">
                        {p.initials}
                      </div>
                      <div>
                        <p className="font-label-bold text-primary">{p.name}</p>
                        <p className="text-label-sm text-on-surface-variant">{p.meta}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase text-on-primary">
                      {p.tier}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-surface-container">
                        <div className="h-full rounded-full bg-secondary" style={{ width: `${p.health}%` }} />
                      </div>
                      <span className="font-label-bold">{p.health}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button type="button" className="font-label-bold text-secondary hover:underline">
                      Manage
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
