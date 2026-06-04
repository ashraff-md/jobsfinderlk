import { getPlatformSponsoredJobs } from "@/lib/api/platform-ads";
import { searchPublishedJobs } from "@/lib/api/jobs";
import type { Job } from "@/lib/api/types";
import { jobToSponsoredCardItem } from "@/lib/jobs/map-job-to-featured-card";
import type { FeaturedJobCardItem } from "@/lib/jobs/featured-jobs";

async function fallbackFeaturedJobs(limit: number): Promise<Job[]> {
  const featured = await searchPublishedJobs({ featured: true, limit });
  let items = featured.items;
  if (items.length < limit) {
    const more = await searchPublishedJobs({ limit });
    const seen = new Set(items.map((j) => j.id));
    for (const job of more.items) {
      if (items.length >= limit) break;
      if (!seen.has(job.id)) {
        items = [...items, job];
        seen.add(job.id);
      }
    }
  }
  return items.slice(0, limit);
}

export async function loadSponsoredJobCards(limit = 3): Promise<FeaturedJobCardItem[]> {
  try {
    const fromAds = await getPlatformSponsoredJobs(limit);
    if (fromAds.length > 0) {
      return fromAds.slice(0, limit).map((job) => jobToSponsoredCardItem(job));
    }
  } catch {
    /* use featured fallback */
  }
  try {
    const items = await fallbackFeaturedJobs(limit);
    return items.map((job) => jobToSponsoredCardItem(job));
  } catch {
    return [];
  }
}
