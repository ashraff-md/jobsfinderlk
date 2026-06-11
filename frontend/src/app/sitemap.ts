import type { MetadataRoute } from "next";
import type { BlogPost, Company, JobsSearchResponse } from "@/lib/api/types";
import { serverFetch } from "@/lib/api/server";
import { getSiteUrl } from "@/lib/seo/site";

const STATIC_PATHS = [
  "/",
  "/jobs",
  "/companies",
  "/internships",
  "/career-advice",
  "/pricing",
  "/contact",
  "/help",
  "/legal/terms",
  "/legal/privacy",
  "/legal/cookies",
] as const;

async function fetchAllJobSlugs(): Promise<Array<{ slug: string; lastModified?: string }>> {
  const results: Array<{ slug: string; lastModified?: string }> = [];
  let page = 1;
  let pages = 1;

  while (page <= pages) {
    const response = await serverFetch<JobsSearchResponse>(`/jobs?page=${page}&limit=50`);
    if (!response?.items.length) break;

    pages = response.pages;
    for (const job of response.items) {
      results.push({
        slug: job.slug,
        lastModified: job.publishedAt ?? job.createdAt,
      });
    }
    page += 1;
  }

  return results;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/jobs" ? 0.9 : 0.7,
  }));

  const [jobs, companies, posts] = await Promise.all([
    fetchAllJobSlugs(),
    serverFetch<Company[]>("/companies"),
    serverFetch<BlogPost[]>("/blog-posts"),
  ]);

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${siteUrl}/jobs/${job.slug}`,
    lastModified: job.lastModified ? new Date(job.lastModified) : now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const companyEntries: MetadataRoute.Sitemap = (companies ?? []).map((company) => ({
    url: `${siteUrl}/companies/${company.slug}`,
    lastModified: company.updatedAt ? new Date(company.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${siteUrl}/career-advice/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...jobEntries, ...companyEntries, ...blogEntries];
}
