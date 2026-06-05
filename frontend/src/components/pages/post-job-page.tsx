"use client";

import { Suspense } from "react";
import { PostJobForm } from "@/components/jobs/post-job-form";
import { PublicHeader } from "@/components/layout/public-header";
import { SiteFooter } from "@/components/layout/site-footer";

export function PostJobPage() {
  return (
    <div className="custom-scrollbar bg-background text-on-surface">
      <PublicHeader />

      <main className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <Suspense fallback={null}>
          <PostJobForm />
        </Suspense>
      </main>

      <SiteFooter variant="dark" />
    </div>
  );
}
