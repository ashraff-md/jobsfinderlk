import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatSalary } from "@/lib/api/jobs";
import type { Job } from "@/lib/api/types";

type SelectedJobDetailsCardProps = {
  job: Job;
};

export function SelectedJobDetailsCard({ job }: SelectedJobDetailsCardProps) {
  const hasSalary = job.salaryMin != null || job.salaryMax != null;
  const salary = hasSalary ? formatSalary(job.salaryMin, job.salaryMax) : null;
  const imageUrl = job.vacancyArtworkUrl ?? job.company.logoUrl;

  return (
    <div className="rounded-xl border border-secondary/30 bg-surface-container-low p-4">
      <p className="mb-3 text-label-sm font-bold uppercase tracking-wide text-secondary">
        Selected listing
      </p>
      <div className="flex gap-4">
        {imageUrl ? (
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
            <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-surface-container">
            <Icon name="work" className="text-on-surface-variant" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-label-bold text-primary">{job.title}</h4>
          <p className="text-label-sm text-on-surface-variant">{job.company.name}</p>
          <dl className="mt-3 grid grid-cols-1 gap-2 text-label-sm sm:grid-cols-2">
            <div>
              <dt className="text-on-surface-variant">Job ID</dt>
              <dd className="break-all font-mono text-[11px] text-on-surface">{job.id}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Status</dt>
              <dd className="font-label-bold text-secondary">{job.status ?? "PUBLISHED"}</dd>
            </div>
            {job.city && (
              <div>
                <dt className="text-on-surface-variant">City</dt>
                <dd>{job.city}</dd>
              </div>
            )}
            {hasSalary && salary && (
              <div>
                <dt className="text-on-surface-variant">Salary</dt>
                <dd>{salary}</dd>
              </div>
            )}
            {job.employmentType && (
              <div>
                <dt className="text-on-surface-variant">Type</dt>
                <dd>{job.employmentType}</dd>
              </div>
            )}
            {job.publishedAt && (
              <div>
                <dt className="text-on-surface-variant">Published</dt>
                <dd>
                  {new Date(job.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </dd>
              </div>
            )}
          </dl>
          <Link
            href={`/jobs/${job.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-label-sm font-bold text-secondary hover:underline"
          >
            View public listing
            <Icon name="open_in_new" className="text-[16px]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
