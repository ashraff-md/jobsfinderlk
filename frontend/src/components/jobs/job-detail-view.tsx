import Link from "next/link";
import type { ReactNode } from "react";
import { ApplyButton } from "@/components/jobs/apply-button";
import { JobArtworkBanner } from "@/components/jobs/job-artwork-banner";
import { Icon } from "@/components/ui/icon";
import { formatSalary } from "@/lib/api/jobs";
import type { Job } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export const DEFAULT_JOB_ARTWORK =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCRYq9D7y8isAmQf4a_-bA1wy61pxxx-Qk1C4sUyF0HqT8zB-aIfwEpFJI2Mo53hN2tjYltcqh-LCry9krgWU5DxEXpgMEVQOUNpX3LzpBT-jVSgPRGzqaS5cNnZuzxrGnesQTQ0Y8ldIHOTMZyqbNVpPyUivdV5dLN8ZBQEJhfKKGb1l8oiffgDN_yraSX_TKdhJL8ix4v144m1b5-xEYiajHG4zHMplU_rFkOXJCeFsFl0FkpBLMry-G7nBTsnwm8HPDOx7feH8o1";

export function timeAgo(dateStr?: string | null) {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function parseBulletList(text?: string | null): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function SectionHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "mb-6 border-l-4 border-secondary pl-4 text-2xl font-extrabold tracking-tight text-navy-deep md:text-[32px]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-4">
          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-navy-deep" />
          <p className="font-body-md text-on-surface-variant">{item}</p>
        </li>
      ))}
    </ul>
  );
}

type JobDetailViewProps = {
  job: Job;
  /** Admin review preview: disables apply and shows draft badge */
  preview?: boolean;
  className?: string;
};

export function JobDetailView({ job, preview = false, className }: JobDetailViewProps) {
  const { company } = job;
  const artworkUrl = job.vacancyArtworkUrl ?? DEFAULT_JOB_ARTWORK;
  const responsibilities = parseBulletList(job.responsibilities);
  const requirements = parseBulletList(job.requirements);
  const requiredSkills = job.requiredSkills ?? [];
  const niceToHaveSkills = job.niceToHaveSkills ?? [];
  const postedLabel = preview ? "Pending publish" : `Posted ${timeAgo(job.publishedAt ?? job.createdAt)}`;
  const locationLabel = job.location ?? job.city ?? "Sri Lanka";

  const metaTags = [
    job.employmentType,
    job.workArrangement,
    job.experienceLevel,
    job.educationRequirement,
    job.category,
  ].filter(Boolean) as string[];

  return (
    <div className={cn("bg-background text-on-surface", className)}>
      <div className="mb-12">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex-1">
            {preview && (
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
                <Icon name="visibility" className="text-[14px]" />
                Public preview
              </span>
            )}
            <h1
              className={cn(
                "mb-3 font-extrabold tracking-tight text-navy-deep",
                preview
                  ? "text-xl leading-snug md:text-2xl"
                  : "text-4xl leading-[1.1] md:text-5xl lg:text-[56px]",
              )}
            >
              {job.title}
            </h1>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {company.verified && (
                <div className="flex items-center gap-1.5 rounded-xl bg-secondary/10 px-3 py-1 font-label-sm text-secondary">
                  <Icon name="verified" className="text-[16px]" filled />
                  Verified Employer
                </div>
              )}
              <span className="text-label-sm text-on-surface-variant">{postedLabel}</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-on-surface-variant">
              <div className="flex items-center gap-2">
                <Icon name="corporate_fare" className="text-navy-deep" />
                <span className="font-body-md font-semibold text-on-surface">{company.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="location_on" className="text-navy-deep" />
                <span className="font-body-md">{locationLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="payments" className="text-navy-deep" />
                <span className="font-body-md">{formatSalary(job.salaryMin, job.salaryMax)} / mo</span>
              </div>
            </div>
            {metaTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {metaTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-bold text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {!preview && (
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-xl border border-outline-variant p-3 transition-colors hover:bg-surface-container-low"
                aria-label="Save job"
              >
                <Icon name="bookmark" className="text-on-surface-variant" />
              </button>
              <button
                type="button"
                className="rounded-xl border border-outline-variant p-3 transition-colors hover:bg-surface-container-low"
                aria-label="Share job"
              >
                <Icon name="share" className="text-on-surface-variant" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className={cn("space-y-12", preview ? "lg:col-span-12" : "lg:col-span-8")}>
          <section>
            <SectionHeading>About this role</SectionHeading>
            <p className="mb-6 whitespace-pre-wrap font-body-lg leading-relaxed text-on-surface-variant">
              {job.description}
            </p>
          </section>

          {responsibilities.length > 0 && (
            <section>
              <SectionHeading>Core Responsibilities</SectionHeading>
              <BulletList items={responsibilities} />
            </section>
          )}

          {requirements.length > 0 && (
            <section>
              <SectionHeading>Minimum Requirements</SectionHeading>
              <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                {requirements.map((req, i) => (
                  <div
                    key={req}
                    className={cn(
                      "flex items-center gap-4 p-6",
                      i < requirements.length - 1 && "border-b border-outline-variant",
                    )}
                  >
                    <Icon name="check_circle" className="text-navy-deep" />
                    <span className="font-label-bold">{req}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(requiredSkills.length > 0 || niceToHaveSkills.length > 0) && (
            <section>
              <SectionHeading>Skills &amp; competencies</SectionHeading>
              {requiredSkills.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 text-lg font-extrabold text-navy-deep">Required</h4>
                  <div className="flex flex-wrap gap-2">
                    {requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-sm font-label-bold text-on-surface"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {niceToHaveSkills.length > 0 && (
                <div>
                  <h4 className="mb-3 text-lg font-extrabold text-navy-deep">Nice to have</h4>
                  <div className="flex flex-wrap gap-2">
                    {niceToHaveSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-1.5 text-label-sm text-on-surface-variant"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {!preview && (
          <aside className="lg:col-span-4">
            <div className="space-y-gutter lg:sticky lg:top-24">
              <div className="relative overflow-hidden rounded-xl bg-navy-deep p-8 text-white shadow-xl">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                <div className="relative z-10">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <div className="mb-1 font-label-sm uppercase tracking-wider opacity-70">
                        AI Match Score
                      </div>
                      <div className="text-xl font-extrabold text-white">94% Perfect Fit</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5">
                      <Icon name="psychology" className="text-white" />
                    </div>
                  </div>
                  <div className="mb-8 space-y-4">
                    <p className="font-body-md leading-relaxed opacity-90">
                      Your profile perfectly aligns with the required experience for this role.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(requiredSkills.length > 0 ? requiredSkills.slice(0, 3) : ["Role fit", "Experience"]).map(
                        (tag) => (
                          <span
                            key={tag}
                            className="rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-label-sm"
                          >
                            {tag}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                  <ApplyButton slug={job.slug} />
                </div>
              </div>

              <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm">
                <h4 className="mb-6 border-l-4 border-secondary pl-3 text-lg font-extrabold text-navy-deep">
                  Salary Insights
                </h4>
                <div className="mb-4 flex h-32 items-end gap-3">
                  <div className="h-[40%] flex-1 rounded-t-xl bg-surface-container-high" />
                  <div className="h-[85%] flex-1 rounded-t-xl bg-navy-deep" />
                  <div className="h-[95%] flex-1 rounded-t-xl bg-secondary-container" />
                </div>
                <p className="font-label-sm text-on-surface-variant">
                  {job.salaryMin != null || job.salaryMax != null ? (
                    <>
                      Listed range:{" "}
                      <span className="font-bold text-secondary">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </>
                  ) : (
                    "Salary details will appear once a range is provided."
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container text-2xl font-bold text-primary">
                    {company.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" className="h-full w-full object-cover" src={company.logoUrl} />
                    ) : (
                      company.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-on-surface">{company.name}</h4>
                    <p className="font-label-sm text-on-surface-variant">
                      {job.industry ?? "Enterprise"} • {job.employmentType ?? "Full-time"}
                    </p>
                  </div>
                </div>
                {company.description && (
                  <p className="mb-6 line-clamp-3 font-body-md text-on-surface-variant">{company.description}</p>
                )}
                <Link
                  href={`/companies/${company.slug}`}
                  className="block w-full rounded-xl border border-navy-deep py-3 text-center font-bold text-navy-deep transition-all hover:bg-navy-deep/5"
                >
                  View Company
                </Link>
              </div>
            </div>
          </aside>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className={cn(preview ? "lg:col-span-12" : "lg:col-span-8")}>
          <JobArtworkBanner
            artworkUrl={artworkUrl}
            title={job.title}
            companyName={company.name}
            showOverlay={!job.vacancyArtworkUrl}
          />
        </div>
      </div>
    </div>
  );
}
