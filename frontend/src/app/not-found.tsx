import Link from "next/link";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Page Not Found",
  description: "The page you are looking for could not be found on JobsFinder.lk.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <PublicPageLayout>
      <main className="mx-auto flex min-h-[60vh] max-w-container-max flex-col items-center justify-center px-margin-mobile py-20 text-center md:px-margin-desktop">
        <p className="mb-2 font-label-bold text-label-bold uppercase tracking-widest text-secondary">
          404
        </p>
        <h1 className="mb-4 font-headline-xl text-headline-xl text-primary">Page not found</h1>
        <p className="mb-8 max-w-md text-on-surface-variant">
          The page you requested may have been moved, removed, or never existed.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/jobs"
            className="rounded-lg bg-primary px-6 py-3 font-label-bold text-label-bold text-on-primary hover:opacity-90"
          >
            Browse Jobs
          </Link>
          <Link
            href="/companies"
            className="rounded-lg border border-outline-variant px-6 py-3 font-label-bold text-label-bold text-primary hover:bg-surface-container"
          >
            View Companies
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-outline-variant px-6 py-3 font-label-bold text-label-bold text-primary hover:bg-surface-container"
          >
            Contact Support
          </Link>
        </div>
      </main>
    </PublicPageLayout>
  );
}
