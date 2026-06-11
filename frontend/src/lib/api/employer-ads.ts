import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type { Job } from "./types";
import type { PlatformAdReviewStatus } from "@/lib/platform-ads/sponsored-schedule";

export type EmployerCampaignStatus =
  | "Pending Review"
  | "Rejected"
  | "Active"
  | "Scheduled"
  | "Paused"
  | "Inactive";

export type EmployerSponsoredCampaign = {
  kind: "sponsored";
  id: string;
  jobId: string;
  sortOrder: number;
  active: boolean;
  reviewStatus: PlatformAdReviewStatus;
  submittedById?: string;
  viewCount: number;
  clickCount?: number;
  startsAt: string;
  endsAt: string;
  status: EmployerCampaignStatus;
  job: Job;
};

export type EmployerBannerCampaign = {
  kind: "banner";
  id: string;
  label: string;
  aspectRatio: "RATIO_3_2" | "RATIO_2_5";
  href: string;
  imageUrl?: string | null;
  alt: string;
  active: boolean;
  reviewStatus: PlatformAdReviewStatus;
  submittedById?: string;
  startsAt: string;
  endsAt: string;
  sortOrder: number;
  viewCount: number;
  clickCount?: number;
  status: EmployerCampaignStatus;
};

export type EmployerCampaign = EmployerSponsoredCampaign | EmployerBannerCampaign;

export type EmployerAdsStats = {
  totalImpressions: number;
  totalClicks: number;
  pendingReviewCount: number;
  activeCount: number;
  scheduledCount: number;
  expiredCount: number;
};

export type EmployerAdsOverview = {
  campaigns: EmployerCampaign[];
  stats: EmployerAdsStats;
};

export async function getEmployerAdsOverview() {
  return apiFetch<EmployerAdsOverview>("/platform-ads/employer/mine", {
    token: getAccessToken(),
  });
}

export async function setEmployerSponsoredCampaignActive(id: string, active: boolean) {
  return apiFetch<EmployerSponsoredCampaign & { status: EmployerCampaignStatus }>(
    `/platform-ads/employer/sponsored/${id}/active`,
    {
      method: "PATCH",
      token: getAccessToken(),
      body: JSON.stringify({ active }),
    },
  );
}

export async function setEmployerBannerCampaignActive(id: string, active: boolean) {
  return apiFetch<EmployerBannerCampaign & { status: EmployerCampaignStatus }>(
    `/platform-ads/employer/banner-campaigns/${id}/active`,
    {
      method: "PATCH",
      token: getAccessToken(),
      body: JSON.stringify({ active }),
    },
  );
}
