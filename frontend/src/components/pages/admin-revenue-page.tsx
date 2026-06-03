"use client";

import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"];
const HEIGHTS = [40, 45, 55, 52, 75, 68, 82];

export function AdminRevenuePage() {
  return (
    <RecruiterAdminShell activeNav="revenue">
      <AdminPageCanvas className="md:px-margin-desktop">
        <div className="mb-stack-lg flex items-end justify-between">
          <div>
            <h1 className="text-headline-lg text-primary">Revenue &amp; Financials</h1>
            <p className="text-on-surface-variant">Subscription performance and billing oversight.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="flex items-center rounded-lg border border-outline-variant px-4 py-2 font-label-bold">
              <Icon name="download" className="mr-1 text-sm" />
              Export Report
            </button>
            <button type="button" className="flex items-center rounded-lg bg-secondary px-4 py-2 font-label-bold text-on-secondary">
              <Icon name="add" className="mr-1 text-sm" />
              New Invoice
            </button>
          </div>
        </div>

        <div className="mb-stack-lg grid grid-cols-12 gap-6">
          <div className="col-span-12 flex flex-col justify-between border border-outline-variant bg-surface-container-lowest p-6 lg:col-span-4">
            <div>
              <span className="font-label-bold uppercase tracking-widest text-on-surface-variant">
                Monthly Recurring Revenue
              </span>
              <span className="float-right font-label-bold text-secondary">+12.4%</span>
              <h3 className="mt-2 text-headline-xl text-primary">$142,850</h3>
            </div>
            <div className="mt-8 flex h-24 items-end gap-1">
              {[30, 45, 35, 60, 50, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-secondary-container opacity-60" style={{ height: `${h}%`, opacity: 0.2 + i * 0.12 }} />
              ))}
            </div>
          </div>
          <div className="col-span-12 grid grid-cols-2 gap-6 lg:col-span-8">
            {[
              { label: "Annual Run Rate", value: "$1.71M", note: "On track for FY24 target" },
              { label: "Success Fees", value: "$48,200", note: "18 high-value placements" },
              { label: "Pending Invoices", value: "$12,400", note: "4 over 30 days due", error: true },
              { label: "Active Partners", value: "1,204", note: "+82 this month" },
            ].map((m) => (
              <div key={m.label} className="border border-outline-variant bg-surface-container-lowest p-6">
                <span className="font-label-bold uppercase tracking-widest text-on-surface-variant">{m.label}</span>
                <h4 className={`mt-1 text-headline-md ${m.error ? "text-error" : "text-primary"}`}>{m.value}</h4>
                <p className="mt-4 flex items-center text-label-sm text-on-surface-variant">
                  <Icon name={m.error ? "schedule" : "trending_up"} className={`mr-1 text-sm ${m.error ? "text-error" : "text-secondary"}`} />
                  {m.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-8">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-headline-md text-primary">Revenue Distribution Trends</h3>
              <div className="flex rounded-lg bg-surface-container p-1">
                <button type="button" className="rounded bg-surface-container-lowest px-3 py-1 text-label-bold shadow-sm">
                  Subscription
                </button>
                <button type="button" className="px-3 py-1 text-label-bold text-on-surface-variant opacity-70">
                  Success Fees
                </button>
              </div>
            </div>
            <div className="flex h-64 items-end justify-between">
              {MONTHS.map((month, i) => (
                <div key={month} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={`w-12 rounded-t ${i === 4 ? "bg-secondary" : "bg-primary"}`}
                    style={{ height: `${HEIGHTS[i]}%` }}
                  />
                  <span className={`text-[10px] font-bold ${i === 4 ? "text-secondary" : "text-on-surface-variant"}`}>
                    {month}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-4">
            <h3 className="mb-6 text-headline-md text-primary">Partner Billing Status</h3>
            <div className="space-y-6">
              {[
                { label: "Current", pct: 72, color: "bg-secondary" },
                { label: "Past Due", pct: 18, color: "bg-error" },
                { label: "Processing", pct: 10, color: "bg-outline" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="mb-2 flex justify-between text-label-sm">
                    <span>{s.label}</span>
                    <span className="font-bold">{s.pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container-low">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
