"use client";

import Link from "next/link";
import { GovernmentJobForm } from "@/components/jobs/government-job-form";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";

type AdminGovernmentJobPageProps = {
  jobId?: string;
};

export function AdminGovernmentJobPage({ jobId }: AdminGovernmentJobPageProps) {
  const isEdit = Boolean(jobId);

  return (
    <RecruiterAdminShell activeNav="government">
      <AdminPageCanvas className="space-y-stack-lg">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <nav className="mb-2 flex font-label-sm uppercase tracking-wider text-outline">
              <Link href="/admin" className="hover:text-secondary">
                Admin
              </Link>
              <span className="mx-2">/</span>
              <Link href="/admin/jobs/government" className="hover:text-secondary">
                Government Postings
              </Link>
              <span className="mx-2">/</span>
              <span className="text-secondary">{isEdit ? "Edit" : "New"}</span>
            </nav>
            <h1 className="text-headline-xl text-on-background">
              {isEdit ? "Edit Government Posting" : "Create Official Posting"}
            </h1>
            <p className="mt-2 max-w-2xl text-body-lg text-on-surface-variant">
              {isEdit
                ? "Update ministry details, salary lines, application instructions, and artwork for this listing."
                : "Create high-authority government sector listings with standardized civil service parameters and gazette references."}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-secondary/20 bg-surface-container-high px-4 py-2">
            <Icon name="verified_user" className="text-secondary" filled />
            <span className="font-label-bold text-secondary">Government Certified</span>
          </div>
        </div>

        <GovernmentJobForm jobId={jobId} />
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
