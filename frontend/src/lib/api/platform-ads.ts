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

export async function getPlatformBanners(aspectRatio?: BannerAspectRatio) {
  const query = aspectRatio ? `?aspectRatio=${aspectRatio}` : "";
  return apiFetch<PlatformBannerSlotPublic[]>(`/platform-ads/banners${query}`);
}

export async function getPlatformSponsoredJobs(limit = 3) {
  return apiFetch<Job[]>(`/platform-ads/sponsored?limit=${limit}`);
}
