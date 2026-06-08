import { PublicHeader } from "@/components/layout/public-header";
import { JobDetailView } from "@/components/jobs/job-detail-view";
import { SimilarJobsCarousel } from "@/components/jobs/similar-jobs-carousel";
import type { Job } from "@/lib/api/types";

type JobDetailPageProps = {
  job: Job;
};

function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`mb-6 border-l-4 border-secondary pl-4 text-2xl font-extrabold tracking-tight text-navy-deep md:text-[32px] ${className ?? ""}`}
    >
      {children}
    </h2>
  );
}

export function JobDetailPage({ job }: JobDetailPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface selection:bg-navy-deep/10">
      <PublicHeader />

      <main className="mx-auto w-full max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <JobDetailView job={job} />

        <section className="mb-24 mt-16">
          <SectionHeading>Similar Opportunities</SectionHeading>
          <SimilarJobsCarousel excludeSlug={job.slug} />
        </section>
      </main>
    </div>
  );
}
