import type { Metadata } from "next";
import type { BlogPost, CompanyDetail, Job } from "@/lib/api/types";
import type { ParsedJobSearchParams } from "@/lib/jobs/job-search-filters";
import {
  buildJobsSearchCanonicalPath,
  formatActiveFiltersSummary,
} from "@/lib/jobs/job-search-filters";
import { getJobEmployerName, getJobLocationLabel } from "@/lib/jobs/job-employer-name";
import { absoluteUrl, truncateDescription } from "@/lib/seo/site";

const SITE_NAME = "JobsFinder.lk";

/** Next.js file-based OG image route */
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export const PRIVATE_ROBOTS_METADATA: Metadata = {
  robots: { index: false, follow: false },
};

type BuildPageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
  openGraphType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
};

function resolveImageUrl(image: string | null | undefined, title: string): string {
  if (image) {
    return image.startsWith("http") ? image : absoluteUrl(image);
  }
  return absoluteUrl(DEFAULT_OG_IMAGE);
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
  openGraphType = "website",
  publishedTime,
  modifiedTime,
  authors,
  tags,
}: BuildPageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = resolveImageUrl(image, title);

  return {
    title,
    description,
    alternates: { canonical },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_LK",
      type: openGraphType,
      images: [{ url: imageUrl, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors?.length ? { authors } : {}),
      ...(tags?.length ? { tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function buildJobsSearchMetadata(parsed: ParsedJobSearchParams): Metadata {
  const { filters } = parsed;
  const filterSummary = formatActiveFiltersSummary(filters);
  const hasFilters = filterSummary !== "All vacancies";

  const titleParts: string[] = [];
  if (filters.q.trim()) titleParts.push(filters.q.trim());
  if (filters.categories.length) titleParts.push(filters.categories.join(", "));
  if (filters.cities.length) titleParts.push(filters.cities.join(", "));
  if (filters.employmentType) titleParts.push(filters.employmentType);
  if (filters.workArrangement) titleParts.push(filters.workArrangement);
  if (filters.experienceLevel) titleParts.push(filters.experienceLevel);
  if (parsed.page > 1) titleParts.push(`Page ${parsed.page}`);

  const title =
    titleParts.length > 0 ? `${titleParts.join(" — ")} Jobs` : "Browse Jobs in Sri Lanka";

  const description = hasFilters
    ? `Find ${filterSummary} job vacancies in Sri Lanka. Apply online with JobsFinder.lk.`
    : "Search thousands of job vacancies across Sri Lanka. Browse by category, location, and experience level on JobsFinder.lk.";

  return buildPageMetadata({
    title,
    description,
    path: buildJobsSearchCanonicalPath(parsed),
  });
}

export function buildJobMetadata(job: Job): Metadata {
  const employerName = getJobEmployerName(job);
  const location = getJobLocationLabel(job);
  const description = truncateDescription(
    `${job.title} at ${employerName} in ${location}. ${job.description}`,
  );
  const image =
    job.vacancyArtworkUrl ??
    job.company.logoUrl ??
    job.governmentOrganization?.logoUrl ??
    null;

  return buildPageMetadata({
    title: job.title,
    description,
    path: `/jobs/${job.slug}`,
    image,
  });
}

export function buildCompanyMetadata(company: CompanyDetail): Metadata {
  const industry = company.industry ?? company.companyType;
  const description = company.description?.trim()
    ? truncateDescription(company.description)
    : `${company.name}${industry ? ` — ${industry}` : ""} jobs and career opportunities in Sri Lanka.`;

  const image = company.logoUrl ?? company.lifeAtCompanyImages?.[0] ?? null;

  return buildPageMetadata({
    title: company.name,
    description,
    path: `/companies/${company.slug}`,
    image,
  });
}

export function buildArticleMetadata(post: BlogPost): Metadata {
  return buildPageMetadata({
    title: post.title,
    description: truncateDescription(post.excerpt),
    path: `/career-advice/${post.slug}`,
    image: post.coverImageUrl,
    openGraphType: "article",
    publishedTime: post.publishedAt ?? post.createdAt,
    modifiedTime: post.updatedAt,
    authors: [post.authorName],
    tags: post.tags,
  });
}
