import Link from "next/link";
import type { ReactNode } from "react";
import { HomeBannerAdsGrid } from "@/components/home/home-banner-ads-grid";
import { JobDetailTallBanners } from "@/components/home/job-detail-tall-banners";
import { ApplyButton } from "@/components/jobs/apply-button";
import {
  GovernmentJobDescriptionSections,
  GovernmentJobSalarySection,
} from "@/components/jobs/government-job-description-sections";
import { JobApplicationInstructions } from "@/components/jobs/job-application-instructions";
import { JobArtworkBanner } from "@/components/jobs/job-artwork-banner";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { ShareJobButton } from "@/components/jobs/share-job-button";
import { Icon } from "@/components/ui/icon";
import { formatSalary } from "@/lib/api/jobs";
import { formatJobClosingDate } from "@/lib/jobs/application-deadline";
import type { Job } from "@/lib/api/types";
import {
  getJobEmployerLogo,
  getJobEmployerName,
  getJobLocationLabel,
} from "@/lib/jobs/job-employer-name";
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
  const employerName = getJobEmployerName(job);
  const employerLogo = getJobEmployerLogo(job);
  const govOrg = job.governmentOrganization;
  const isGovernmentJob = job.jobSourceType === "GOVERNMENT";
  const artworkUrl = job.vacancyArtworkUrl ?? DEFAULT_JOB_ARTWORK;
  const responsibilities = parseBulletList(job.responsibilities);
  const requirements = parseBulletList(job.requirements);
  const requiredSkills = job.requiredSkills ?? [];
  const niceToHaveSkills = job.niceToHaveSkills ?? [];
  const postedLabel = preview ? "Pending publish" : `Posted ${timeAgo(job.publishedAt ?? job.createdAt)}`;
  const locationLabel = getJobLocationLabel(job);
  const closingLabel = job.applicationDeadline
    ? `Closes ${formatJobClosingDate(job.applicationDeadline)}`
    : formatJobClosingDate(null);

  const metaTags = [
    job.employmentType,
    job.workArrangement,
    job.experienceLevel,
    job.educationRequirement,
    job.category,
  ].filter(Boolean) as string[];

  return (
    <div className={cn("bg-background text-on-surface", className)}>
      <div className="flex flex-col gap-gutter lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
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
                : "text-3xl leading-[1.15] md:text-4xl lg:text-[44px]",
            )}
          >
            {job.title}
          </h1>

          <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
            {company.verified && (
              <div className="flex items-center gap-1.5 rounded-xl bg-secondary/10 px-3 py-1 font-label-sm text-secondary">
                <Icon name="verified" className="text-[16px]" filled />
                Verified Employer
              </div>
            )}
            <span className="text-label-sm text-on-surface-variant">{postedLabel}</span>
            {!preview && (
              <>
                <SaveJobButton jobId={job.id} jobSlug={job.slug} />
                <ShareJobButton title={job.title} slug={job.slug} />
              </>
            )}
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-6 text-on-surface-variant">
            <div className="flex items-center gap-2">
              <Icon name="corporate_fare" className="text-navy-deep" />
              <span className="font-body-md font-semibold text-on-surface">{employerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="location_on" className="text-navy-deep" />
              <span className="font-body-md">{locationLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="payments" className="text-navy-deep" />
              <span className="font-body-md">{formatSalary(job.salaryMin, job.salaryMax)} / mo</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="event" className="text-navy-deep" />
              <span className="font-body-md">{closingLabel}</span>
            </div>
          </div>

          {metaTags.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
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

          <div className={cn("space-y-12", metaTags.length === 0 && "mt-10")}>
          {isGovernmentJob ? (
            <GovernmentJobDescriptionSections description={job.description} />
          ) : (
            <section>
              <SectionHeading>About this role</SectionHeading>
              <p className="mb-6 whitespace-pre-wrap font-body-lg leading-relaxed text-on-surface-variant">
                {job.description}
              </p>
            </section>
          )}

          {responsibilities.length > 0 && (
            <section>
              <SectionHeading>Core Responsibilities</SectionHeading>
              <BulletList items={responsibilities} />
            </section>
          )}

          {requirements.length > 0 && (
            <section>
              <SectionHeading>Requirements</SectionHeading>
              <BulletList items={requirements} />
            </section>
          )}

          {isGovernmentJob && <GovernmentJobSalarySection description={job.description} />}

          <JobApplicationInstructions job={job} />

          <section>
            <JobArtworkBanner
              artworkUrl={artworkUrl}
              title={job.title}
              companyName={employerName}
              showOverlay={!job.vacancyArtworkUrl}
              imageClassName="h-96 w-full"
            />
          </section>

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
        </div>

        {!preview && (
          <aside className="w-full shrink-0 lg:w-[min(100%,320px)]">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container text-2xl font-bold text-primary">
                    {employerLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={`${employerName} logo`}
                        className="h-full w-full object-cover"
                        src={employerLogo}
                      />
                    ) : (
                      employerName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg font-extrabold text-on-surface">{employerName}</h4>
                    {isGovernmentJob && govOrg ? (
                      <div className="space-y-1 font-label-sm text-on-surface-variant">
                        <p>{govOrg.organizationType}</p>
                        {govOrg.parent?.name && (
                          <p className="line-clamp-2">Under {govOrg.parent.name}</p>
                        )}
                        {(govOrg.district || govOrg.province) && (
                          <p className="line-clamp-2">
                            {[govOrg.district, govOrg.province].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="font-label-sm text-on-surface-variant">
                        {job.industry ?? "Enterprise"}
                      </p>
                    )}
                  </div>
                </div>
                {isGovernmentJob && govOrg?.description ? (
                  <p className="mb-6 line-clamp-3 font-body-md text-on-surface-variant">
                    {govOrg.description}
                  </p>
                ) : (
                  company.description && (
                    <p className="mb-6 line-clamp-3 font-body-md text-on-surface-variant">
                      {company.description}
                    </p>
                  )
                )}
                {isGovernmentJob && govOrg?.website && (
                  <a
                    href={
                      /^https?:\/\//i.test(govOrg.website)
                        ? govOrg.website
                        : `https://${govOrg.website.replace(/^\/+/, "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-6 inline-flex items-center gap-1.5 font-label-sm text-secondary hover:underline"
                  >
                    <Icon name="language" className="text-[16px]" />
                    Official website
                  </a>
                )}
                {!isGovernmentJob && (
                  <Link
                    href={`/companies/${company.slug}`}
                    className="block w-full rounded-xl border border-navy-deep py-3 text-center font-bold text-navy-deep transition-all hover:bg-navy-deep/5"
                  >
                    View Company
                  </Link>
                )}
              </div>

              {job.applyViaOneClick && (
                <div className="rounded-xl bg-navy-deep p-6 shadow-xl">
                  <ApplyButton slug={job.slug} />
                </div>
              )}

              <JobDetailTallBanners />
            </div>
          </aside>
        )}
      </div>

      {!preview && (
        <section className="mt-8" aria-label="Featured opportunities">
          <HomeBannerAdsGrid columns={2} />
        </section>
      )}
    </div>
  );
}
