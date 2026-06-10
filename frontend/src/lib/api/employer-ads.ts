import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type { Job } from "./types";

export type EmployerSponsoredCampaignStatus = "Active" | "Scheduled" | "Inactive";

export type EmployerSponsoredCampaign = {
  id: string;
  jobId: string;
  sortOrder: number;
  active: boolean;
  viewCount: number;
  startsAt: string;
  endsAt: string;
  status: EmployerSponsoredCampaignStatus;
  job: Job;
};

export type EmployerAdsStats = {
  totalImpressions: number;
  activeCount: number;
  scheduledCount: number;
  expiredCount: number;
};

export type EmployerAdsOverview = {
  campaigns: EmployerSponsoredCampaign[];
  stats: EmployerAdsStats;
};

export async function getEmployerAdsOverview() {
  return apiFetch<EmployerAdsOverview>("/platform-ads/employer/mine", {
    token: getAccessToken(),
  });
}
