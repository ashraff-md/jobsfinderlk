import { apiFetch } from "./client";
import type { Job } from "./types";

export type BannerAspectRatio = "RATIO_3_2" | "RATIO_2_5";

export type PlatformBannerSlide = {
  href: string;
  imageUrl: string;
  alt: string;
};

export type PlatformBannerSlotPublic = {
  key: string;
  aspectRatio: BannerAspectRatio;
  slides: PlatformBannerSlide[];
};

export type PlatformBannersResponse = {
  slideRotationSeconds: number;
  slidesPerPosition: number;
  rotationIntervalMs: number;
  slots: PlatformBannerSlotPublic[];
};

export async function getPlatformBanners(aspectRatio?: BannerAspectRatio) {
  const query = aspectRatio ? `?aspectRatio=${aspectRatio}` : "";
  return apiFetch<PlatformBannersResponse>(`/platform-ads/banners${query}`);
}

export type PlatformSponsoredJobsResponse = {
  batchSize: number;
  totalActive: number;
  offset: number;
  nextOffset: number;
  jobs: Job[];
};

export async function getPlatformSponsoredJobs(limit = 3, offset?: number) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (offset !== undefined) params.set("offset", String(offset));
  return apiFetch<PlatformSponsoredJobsResponse>(
    `/platform-ads/sponsored?${params.toString()}`,
  );
}
