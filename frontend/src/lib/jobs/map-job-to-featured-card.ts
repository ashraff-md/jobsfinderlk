import { LOGO_URL } from "@/lib/assets";
import { formatSalary } from "@/lib/api/jobs";
import type { Job } from "@/lib/api/types";
import {
  getJobEmployerLogo,
  getJobEmployerName,
  getJobLocationLabel,
} from "@/lib/jobs/job-employer-name";
import type { FeaturedJobCardItem } from "@/lib/jobs/featured-jobs";

export function jobToFeaturedCardItem(job: Job): FeaturedJobCardItem {
  const location = getJobLocationLabel(job);
  const employerName = getJobEmployerName(job);
  const companyLine =
    location !== "Sri Lanka" ? `${employerName} • ${location}` : employerName;
  const salaryLabel = formatSalary(job.salaryMin, job.salaryMax);
  const tags = [
    job.employmentType,
    job.experienceLevel,
    salaryLabel !== "Salary negotiable" ? salaryLabel : null,
  ].filter(Boolean) as string[];

  return {
    badge: "",
    badgeClass: "",
    logo: getJobEmployerLogo(job) ?? LOGO_URL,
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
): FeaturedJobCardItem[][] {
  if (!jobs.length) return [];

  const cardLimit = maxSlides ? maxSlides * cardsPerSlide : jobs.length;
  const cards = jobs.slice(0, cardLimit).map((job) => jobToFeaturedCardItem(job));
  const slideCount = maxSlides
    ? Math.min(maxSlides, Math.max(1, Math.ceil(cards.length / cardsPerSlide)))
    : Math.max(1, Math.ceil(cards.length / cardsPerSlide));

  return Array.from({ length: slideCount }, (_, index) =>
    cards.slice(index * cardsPerSlide, index * cardsPerSlide + cardsPerSlide),
  );
}

export function jobToSponsoredCardItem(job: Job): FeaturedJobCardItem {
  return jobToFeaturedCardItem(job);
}

export function buildFeaturedCardSlides(
  cards: FeaturedJobCardItem[],
  cardsPerSlide = 2,
  maxSlides = 3,
): FeaturedJobCardItem[][] {
  if (!cards.length) return [];

  const cardLimit = maxSlides * cardsPerSlide;
  const items = cards.slice(0, cardLimit);
  const slideCount = Math.min(maxSlides, Math.max(1, Math.ceil(items.length / cardsPerSlide)));

  return Array.from({ length: slideCount }, (_, index) =>
    items.slice(index * cardsPerSlide, index * cardsPerSlide + cardsPerSlide),
  );
}
