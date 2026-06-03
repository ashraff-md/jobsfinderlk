"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";

export function AdminVerificationDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <RecruiterAdminShell activeNav="verifications">
      <AdminPageCanvas className="md:px-margin-desktop">
        <nav className="mb-6 flex items-center gap-2 text-label-sm text-on-surface-variant">
          <Link href="/admin/verifications" className="hover:text-secondary">
            Verifications
          </Link>
          <Icon name="chevron_right" className="text-[16px]" />
          <span className="font-label-bold text-on-surface">Recruiter #{params.id}</span>
        </nav>

        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 lg:col-span-7">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-fixed text-xl font-bold text-secondary">
                  HS
                </div>
                <div>
                  <h1 className="text-headline-lg">Harshana Silva</h1>
                  <p className="text-on-surface-variant">Senior Tech Recruiter • Virtusa (Pvt) Ltd</p>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <h3 className="font-label-bold">Submitted Evidence</h3>
                {[
                  { icon: "link", label: "LinkedIn Profile", status: "Verified" },
                  { icon: "description", label: "Corporate ID Document", status: "Under Review" },
                  { icon: "mail", label: "Company Email Domain", status: "Matched" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg bg-surface-container p-4">
                    <div className="flex items-center gap-3">
                      <Icon name={item.icon} className="text-secondary" />
                      <span className="font-label-bold">{item.label}</span>
                    </div>
                    <span className="text-label-sm font-bold text-secondary">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-24 rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
              <h3 className="text-headline-md">Decision</h3>
              <textarea className="mt-4 w-full rounded-lg border border-outline-variant p-3" rows={4} placeholder="Review notes..." />
              <button type="button" className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-label-bold text-on-primary">
                <Icon name="verified" />
                Approve Recruiter
              </button>
              <button type="button" className="mt-3 w-full rounded-lg border border-error py-3 font-label-bold text-error">
                Reject Application
              </button>
            </div>
          </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
