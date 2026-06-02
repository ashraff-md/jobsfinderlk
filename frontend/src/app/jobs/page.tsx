import type { Metadata } from "next";
import { Suspense } from "react";
import { JobsSearchPage } from "@/components/pages/jobs-search-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/jobs"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-container border-t-primary" />
        </div>
      }
    >
      <JobsSearchPage />
    </Suspense>
  );
}
