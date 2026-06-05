"use client";

import Link from "next/link";
import { Suspense } from "react";
import { PostJobForm } from "@/components/jobs/post-job-form";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";

export function AdminPostJobPage() {
  return (
    <RecruiterAdminShell activeNav="jobs">
      <AdminPageCanvas>
        <div className="mb-stack-lg">
          <nav className="mb-2 flex font-label-sm uppercase tracking-wider text-outline">
            <Link href="/admin" className="hover:text-secondary">
              Admin
            </Link>
            <span className="mx-2">/</span>
            <Link href="/admin/jobs" className="hover:text-secondary">
              Job Management
            </Link>
            <span className="mx-2">/</span>
            <span className="text-secondary">New Listing</span>
          </nav>
          <h1 className="text-headline-lg text-on-background">Create Job Listing</h1>
          <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
            Post a standard private-sector or corporate vacancy on behalf of an employer.
          </p>
        </div>

        <Suspense fallback={null}>
          <PostJobForm mode="admin" />
        </Suspense>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
