"use client";

import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";

const CHART_HEIGHTS = [60, 75, 70, 85, 80, 92, 95];

export function AdminAnalyticsPage() {
  return (
    <RecruiterAdminShell activeNav="analytics">
      <AdminPageCanvas>
        <section className="mb-stack-lg flex justify-between items-end">
          <div>
            <h1 className="mb-2 text-headline-lg text-primary">AI Performance Deep Dive</h1>
            <p className="text-body-md text-on-surface-variant">
              Monitoring ecosystem health, matching precision, and talent readiness metrics.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" className="flex items-center gap-2 rounded border border-outline-variant px-4 py-2 font-label-bold hover:bg-surface-container-low">
              <Icon name="calendar_today" className="text-sm" />
              Last 30 Days
            </button>
            <button type="button" className="flex items-center gap-2 rounded bg-primary px-4 py-2 font-label-bold text-on-primary">
              <Icon name="download" className="text-sm" />
              Export PDF
            </button>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 glass-card rounded-xl p-6 lg:col-span-8">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h3 className="mb-1 font-label-bold uppercase tracking-wider text-on-surface-variant">
                  AI Matching Accuracy
                </h3>
                <p className="text-headline-md font-bold">
                  94.8% <span className="ml-2 text-label-sm font-normal text-secondary">+2.4% vs last mo.</span>
                </p>
              </div>
              <span className="rounded bg-surface-container px-2 py-1 text-label-sm font-bold text-secondary">
                High Precision
              </span>
            </div>
            <div className="flex h-64 items-end justify-between gap-2 px-2">
              {CHART_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t-sm ${i === 6 ? "bg-secondary" : "bg-secondary-fixed"}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-outline-variant pt-4 text-label-sm text-on-tertiary-container">
              <span>Oct 01</span>
              <span>Oct 15</span>
              <span>Oct 30</span>
            </div>
          </div>

          <div className="relative col-span-12 overflow-hidden rounded-xl bg-primary p-8 text-on-primary lg:col-span-4">
            <h3 className="mb-6 font-label-bold uppercase tracking-wider text-on-primary-container">
              Global AI Readiness
            </h3>
            <div className="flex flex-col items-center py-4">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <span className="text-headline-lg">82</span>
                <span className="absolute bottom-8 text-label-sm text-on-primary-container">Index Score</span>
              </div>
            </div>
            <p className="mt-6 px-4 text-center text-body-md text-on-primary-container">
              Candidate pool readiness has improved by 12 points since the new AI-vetting integration.
            </p>
          </div>

          <div className="col-span-12 glass-card rounded-xl p-6 lg:col-span-4">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-label-bold">Resume Parsing Health</h3>
              <Icon name="health_and_safety" className="text-secondary" />
            </div>
            <p className="text-headline-md font-bold text-primary">99.1%</p>
            <p className="mt-2 text-label-sm text-on-surface-variant">Structured data extraction success rate</p>
          </div>

          <div className="col-span-12 glass-card rounded-xl p-6 lg:col-span-8">
            <h3 className="mb-4 font-label-bold text-primary">Model Performance by Category</h3>
            <div className="space-y-4">
              {[
                { label: "Executive Matching", pct: 96 },
                { label: "Technical Skills", pct: 94 },
                { label: "Culture Fit Signals", pct: 88 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-label-sm">
                    <span>{row.label}</span>
                    <span className="font-bold">{row.pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container">
                    <div className="h-full bg-primary" style={{ width: `${row.pct}%` }} />
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
