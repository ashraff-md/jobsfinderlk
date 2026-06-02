import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatSalary } from "@/lib/api/jobs";
import { formatJobClosingDate } from "@/lib/jobs/application-deadline";
import { formatJobAgeRange } from "@/lib/jobs/format-age-range";
import type { Job } from "@/lib/api/types";

type JobSearchResultCardProps = {
  job: Job;
};

export function JobSearchResultCard({ job }: JobSearchResultCardProps) {
  const ageLabel = formatJobAgeRange(job.ageMin, job.ageMax);
  const tags = [
    job.employmentType,
    job.workArrangement,
    job.experienceLevel,
    job.educationRequirement,
    job.category,
    ageLabel,
  ].filter(Boolean) as string[];

  const location = job.location ?? job.city ?? "Sri Lanka";

  return (
    <article className="group job-card-shadow job-card-hover flex h-full flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-6 transition-all duration-300 hover:border-primary/40">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-outline-variant bg-surface-container">
          {job.company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.company.logoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-primary">
              {job.company.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/jobs/${job.slug}`} className="block">
            <h3 className="line-clamp-2 text-lg font-bold leading-snug text-primary transition-colors group-hover:text-secondary">
              {job.title}
            </h3>
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-on-surface-variant">
              {job.company.name}
            </span>
            {job.company.verified && (
              <span className="flex items-center gap-0.5 rounded bg-primary/10 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-primary">
                <Icon
                  name="verified"
                  filled
                  className="!text-[12px] !leading-none ![font-variation-settings:'FILL'_1,'wght'_400,'GRAD'_0,'opsz'_20]"
                />
                Verified
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="-mr-1 shrink-0 rounded p-2 transition-colors hover:bg-surface-container-low active:scale-90"
          aria-label="Save job"
        >
          <Icon name="bookmark" className="text-outline" />
        </button>
      </div>

      <ul className="mb-4 space-y-2 text-label-sm text-on-surface-variant">
        <li className="flex items-center gap-2">
          <Icon name="location_on" className="shrink-0 text-[18px] text-outline" />
          <span className="line-clamp-1">{location}</span>
        </li>
        <li className="flex items-center gap-2 font-bold text-secondary">
          <Icon name="payments" className="shrink-0 text-[18px]" />
          <span className="line-clamp-1">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
        </li>
        <li className="flex items-center gap-2">
          <Icon name="event" className="shrink-0 text-[18px] text-outline" />
          <span className="line-clamp-1">
            {job.applicationDeadline
              ? `Closes ${formatJobClosingDate(job.applicationDeadline)}`
              : formatJobClosingDate(null)}
          </span>
        </li>
      </ul>

      {tags.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <Link
        href={`/jobs/${job.slug}`}
        className="mt-auto w-full rounded-lg border border-primary py-2 text-center text-xs font-label-bold text-primary transition-all hover:bg-primary hover:text-on-primary"
      >
        View Brief
      </Link>
    </article>
  );
}
