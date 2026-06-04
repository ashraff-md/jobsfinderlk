import { LOGO_URL } from "@/lib/assets";
import { formatSalary } from "@/lib/api/jobs";
import type { Job } from "@/lib/api/types";
import {
  FEATURED_JOB_BADGE,
  type FeaturedJobCardItem,
} from "@/lib/jobs/featured-jobs";

export type FeaturedJobCardBadgeStyle = "default" | "featured-only";

export function jobToFeaturedCardItem(
  job: Job,
  options?: {
    badge?: string;
    badgeClass?: string;
    badgeStyle?: FeaturedJobCardBadgeStyle;
  },
): FeaturedJobCardItem {
  const location = [job.location, job.city].filter(Boolean).join(" • ");
  const companyLine = location ? `${job.company.name} • ${location}` : job.company.name;
  const salaryLabel = formatSalary(job.salaryMin, job.salaryMax);
  const tags = [
    job.employmentType,
    job.experienceLevel,
    salaryLabel !== "Salary negotiable" ? salaryLabel : null,
  ].filter(Boolean) as string[];

  const badgeStyle = options?.badgeStyle ?? "default";
  const badge =
    options?.badge ??
    (badgeStyle === "featured-only"
      ? "Featured"
      : job.isFeatured
        ? "Featured"
        : "Open role");
  const badgeClass =
    options?.badgeClass ??
    (badgeStyle === "featured-only" || job.isFeatured
      ? FEATURED_JOB_BADGE.sponsored
      : FEATURED_JOB_BADGE.new);

  return {
    badge,
    badgeClass,
    logo: job.company.logoUrl ?? LOGO_URL,
    title: job.title,
    company: companyLine,
    tags: tags.length ? tags : ["View details"],
    href: `/jobs/${job.slug}`,
  };
}

export function buildJobCardSlides(
  jobs: Job[],
  cardsPerSlide = 8,
  maxSlides?: number,
  options?: { badgeStyle?: FeaturedJobCardBadgeStyle },
): FeaturedJobCardItem[][] {
  if (!jobs.length) return [];

  const cardLimit = maxSlides ? maxSlides * cardsPerSlide : jobs.length;
  const cards = jobs
    .slice(0, cardLimit)
    .map((job) => jobToFeaturedCardItem(job, { badgeStyle: options?.badgeStyle }));
  const slideCount = maxSlides
    ? Math.min(maxSlides, Math.max(1, Math.ceil(cards.length / cardsPerSlide)))
    : Math.max(1, Math.ceil(cards.length / cardsPerSlide));

  return Array.from({ length: slideCount }, (_, index) =>
    cards.slice(index * cardsPerSlide, index * cardsPerSlide + cardsPerSlide),
  );
}

export function jobToSponsoredCardItem(job: Job): FeaturedJobCardItem {
  return jobToFeaturedCardItem(job, {
    badge: "Sponsored",
    badgeClass: FEATURED_JOB_BADGE.sponsored,
  });
}
