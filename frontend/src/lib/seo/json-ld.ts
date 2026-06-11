import type { BlogPost, CompanyDetail, Job } from "@/lib/api/types";
import { getJobEmployerName, getJobLocationLabel } from "@/lib/jobs/job-employer-name";
import { absoluteUrl, truncateDescription } from "@/lib/seo/site";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildOrganizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "JobsFinder.lk",
    url: siteUrl,
    logo: absoluteUrl("/logo.svg"),
    description:
      "Sri Lanka's recruitment platform connecting job seekers with employers.",
    parentOrganization: {
      "@type": "Organization",
      name: "T-Rex Solutions (Pvt) Ltd.",
    },
  };
}

export function buildWebSiteJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JobsFinder.lk",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/jobs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildOrganizationCompanyJsonLd(company: CompanyDetail, siteUrl: string) {
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: absoluteUrl(`/companies/${company.slug}`),
    description: company.description ?? undefined,
  };

  if (company.logoUrl) {
    payload.logo = company.logoUrl.startsWith("http")
      ? company.logoUrl
      : absoluteUrl(company.logoUrl);
  }

  if (company.website) {
    payload.sameAs = company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`;
  }

  if (company.industry) payload.industry = company.industry;

  const locality = company.city ?? company.location;
  if (locality || company.address) {
    payload.address = {
      "@type": "PostalAddress",
      ...(company.address ? { streetAddress: company.address } : {}),
      ...(locality ? { addressLocality: locality } : {}),
      addressCountry: "LK",
    };
  }

  payload.parentOrganization = {
    "@type": "Organization",
    name: "JobsFinder.lk",
    url: siteUrl,
  };

  return payload;
}

export function buildItemListJsonLd(jobs: Job[], listName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: jobs.length,
    itemListElement: jobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/jobs/${job.slug}`),
      name: job.title,
    })),
  };
}

export function buildFaqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

function mapEmploymentType(type?: string | null): string | undefined {
  if (!type) return undefined;
  const normalized = type.toLowerCase();
  if (normalized.includes("full")) return "FULL_TIME";
  if (normalized.includes("part")) return "PART_TIME";
  if (normalized.includes("intern")) return "INTERN";
  if (normalized.includes("contract")) return "CONTRACTOR";
  if (normalized.includes("temporary") || normalized.includes("temp")) return "TEMPORARY";
  return undefined;
}

function isRemoteWork(workArrangement?: string | null): boolean {
  if (!workArrangement) return false;
  const normalized = workArrangement.toLowerCase();
  return normalized.includes("remote") || normalized.includes("hybrid");
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function buildJobPostingJsonLd(job: Job, siteUrl: string) {
  const employerName = getJobEmployerName(job);
  const location = getJobLocationLabel(job);
  const jobUrl = absoluteUrl(`/jobs/${job.slug}`);

  const hiringOrganization: Record<string, unknown> = {
    "@type": "Organization",
    name: employerName,
    url: job.company.slug ? absoluteUrl(`/companies/${job.company.slug}`) : siteUrl,
  };

  const logo = job.company.logoUrl ?? job.governmentOrganization?.logoUrl;
  if (logo) {
    hiringOrganization.logo = logo.startsWith("http") ? logo : absoluteUrl(logo);
  }

  const orgWebsite = job.company.website ?? job.governmentOrganization?.website;
  if (orgWebsite) {
    hiringOrganization.sameAs = orgWebsite.startsWith("http")
      ? orgWebsite
      : `https://${orgWebsite}`;
  }

  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: stripHtml(job.description),
    identifier: {
      "@type": "PropertyValue",
      name: "JobsFinder.lk",
      value: job.id,
    },
    url: jobUrl,
    directApply: Boolean(job.applyViaOneClick),
    hiringOrganization,
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: location,
        addressCountry: "LK",
      },
    },
  };

  if (isRemoteWork(job.workArrangement)) {
    payload.jobLocationType = "TELECOMMUTE";
  }

  if (job.applyViaEmail && job.applicationEmail) {
    payload.applicationContact = {
      "@type": "ContactPoint",
      email: job.applicationEmail,
      contactType: "application",
    };
  }

  const datePosted = job.publishedAt ?? job.createdAt;
  if (datePosted) payload.datePosted = datePosted;

  if (job.applicationDeadline) payload.validThrough = job.applicationDeadline;

  const employmentType = mapEmploymentType(job.employmentType);
  if (employmentType) payload.employmentType = employmentType;

  if (job.salaryMin != null || job.salaryMax != null) {
    payload.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "LKR",
      value: {
        "@type": "QuantitativeValue",
        ...(job.salaryMin != null ? { minValue: job.salaryMin } : {}),
        ...(job.salaryMax != null ? { maxValue: job.salaryMax } : {}),
        unitText: "MONTH",
      },
    };
  }

  return payload;
}

export function buildArticleJsonLd(post: BlogPost, siteUrl: string) {
  const articleUrl = absoluteUrl(`/career-advice/${post.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: articleUrl,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "JobsFinder.lk",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.svg"),
      },
    },
    ...(post.coverImageUrl
      ? {
          image: post.coverImageUrl.startsWith("http")
            ? post.coverImageUrl
            : absoluteUrl(post.coverImageUrl),
        }
      : {}),
  };
}
