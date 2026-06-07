"use client";

import { Suspense } from "react";
import { PostJobForm } from "@/components/jobs/post-job-form";

export function PostJobPage() {
  return (
    <Suspense fallback={null}>
      <PostJobForm />
    </Suspense>
  );
}
