"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";

export function AdminCompanyDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <RecruiterAdminShell activeNav="companies">
      <AdminPageCanvas className="md:px-margin-desktop">
        <nav className="mb-6 flex items-center gap-2 text-label-sm text-on-surface-variant">
          <Link href="/admin/companies" className="hover:text-secondary">
            Companies
          </Link>
          <Icon name="chevron_right" className="text-[16px]" />
          <span className="font-label-bold text-on-surface">NexGen Tech</span>
        </nav>

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-headline-lg">Company Onboarding Detail</h1>
            <p className="text-on-surface-variant">Request ID: {params.id}</p>
          </div>
          <span className="rounded-full bg-surface-container-high px-4 py-1.5 font-label-bold text-secondary">
            Pending Review
          </span>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 space-y-6 lg:col-span-8">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
              <h3 className="mb-4 text-headline-md">Entity Information</h3>
              <dl className="grid grid-cols-2 gap-4 text-body-md">
                {[
                  ["Company Name", "NexGen Tech"],
                  ["Industry", "Information Technology"],
                  ["Registration", "REG-2024-00129"],
                  ["Location", "San Francisco, CA"],
                  ["Website", "https://nexgen.tech"],
                  ["Company Type", "Private Limited"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-label-sm text-on-surface-variant">{label}</dt>
                    <dd className="mt-1 font-label-bold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
              <h3 className="mb-4 font-label-bold">Company Description</h3>
              <p className="text-body-md leading-relaxed text-on-surface-variant">
                NexGen Tech is a high-growth software consultancy focused on enterprise digital transformation.
                The organization is expanding its Sri Lankan operations and seeks platform verification for
                institutional hiring.
              </p>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
              <h3 className="font-label-bold">Review Actions</h3>
              <button type="button" className="w-full rounded-lg bg-primary py-3 font-label-bold text-on-primary">
                Approve as New Company
              </button>
              <button type="button" className="w-full rounded-lg border border-outline-variant py-3 font-label-bold">
                Merge with Existing
              </button>
              <button type="button" className="w-full rounded-lg border border-error py-3 font-label-bold text-error">
                Reject Request
              </button>
            </div>
          </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
