import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type {
  AdminJobCategory,
  AdminRecruiter,
  PlatformPartner,
  BannerAspectRatio,
  CompanyRequest,
  Job,
  JobsSearchResponse,
} from "./types";

export type AdminJobsFilters = {
  status?: string;
  q?: string;
  source?: string;
  page?: number;
  limit?: number;
};

export type AdminJobStats = {
  total: number;
  pending: number;
  published: number;
};

export async function getAdminJobStats() {
  return apiFetch<AdminJobStats>("/admin/jobs/stats", { token: getAccessToken() });
}

export async function getAdminJobs(filters?: AdminJobsFilters) {
  const query = new URLSearchParams();
  if (filters?.status && filters.status !== "all") {
    query.set("status", filters.status);
  }
  if (filters?.q?.trim()) {
    query.set("q", filters.q.trim());
  }
  if (filters?.source && filters.source !== "all") {
    query.set("source", filters.source);
  }
  if (filters?.page != null && filters.page > 0) {
    query.set("page", String(filters.page));
  }
  if (filters?.limit != null && filters.limit > 0) {
    query.set("limit", String(filters.limit));
  }
  const qs = query.toString();
  return apiFetch<JobsSearchResponse>(`/admin/jobs${qs ? `?${qs}` : ""}`, {
    token: getAccessToken(),
  });
}

export async function getPendingJobs() {
  return apiFetch<Job[]>("/admin/jobs/pending", { token: getAccessToken() });
}

export async function getGovernmentJobs() {
  return apiFetch<Job[]>("/admin/jobs/government", { token: getAccessToken() });
}

export async function getAdminJob(id: string) {
  return apiFetch<Job>(`/admin/jobs/${id}`, { token: getAccessToken() });
}

export async function updateAdminJob(id: string, body: Record<string, unknown>) {
  return apiFetch<Job>(`/admin/jobs/${id}`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function approveJob(id: string) {
  return apiFetch<Job>(`/admin/jobs/${id}/approve`, {
    method: "PATCH",
    token: getAccessToken(),
  });
}

export async function rejectJob(id: string) {
  return apiFetch<Job>(`/admin/jobs/${id}/reject`, {
    method: "PATCH",
    token: getAccessToken(),
  });
}

export type AdminRecruitersFilters = {
  status?: string;
  q?: string;
};

export async function getAdminRecruiters(filters?: AdminRecruitersFilters) {
  const query = new URLSearchParams();
  if (filters?.status && filters.status !== "all") {
    query.set("status", filters.status);
  }
  if (filters?.q?.trim()) {
    query.set("q", filters.q.trim());
  }
  const qs = query.toString();
  return apiFetch<AdminRecruiter[]>(`/admin/recruiters${qs ? `?${qs}` : ""}`, {
    token: getAccessToken(),
  });
}

export async function getAdminRecruiter(userId: string) {
  return apiFetch<AdminRecruiter>(`/admin/recruiters/${userId}`, {
    token: getAccessToken(),
  });
}

export async function approveRecruiter(userId: string) {
  return apiFetch<AdminRecruiter>(`/admin/recruiters/${userId}/approve`, {
    method: "PATCH",
    token: getAccessToken(),
  });
}

export async function rejectRecruiter(userId: string) {
  return apiFetch<AdminRecruiter>(`/admin/recruiters/${userId}/reject`, {
    method: "PATCH",
    token: getAccessToken(),
  });
}

export type AdminCompanyRequestsFilters = {
  status?: string;
  q?: string;
};

export async function getCompanyRequests(filters?: AdminCompanyRequestsFilters) {
  const query = new URLSearchParams();
  if (filters?.status && filters.status !== "all") {
    query.set("status", filters.status);
  }
  if (filters?.q?.trim()) {
    query.set("q", filters.q.trim());
  }
  const qs = query.toString();
  return apiFetch<CompanyRequest[]>(`/admin/company-requests${qs ? `?${qs}` : ""}`, {
    token: getAccessToken(),
  });
}

export async function getPendingCompanyRequests() {
  return apiFetch<CompanyRequest[]>("/admin/company-requests/pending", {
    token: getAccessToken(),
  });
}

export async function getCompanyRequest(id: string) {
  return apiFetch<CompanyRequest>(`/admin/company-requests/${id}`, {
    token: getAccessToken(),
  });
}

export type UpdateCompanyRequestBody = {
  companyName?: string;
  industry?: string;
  website?: string;
  emailDomain?: string;
  address?: string;
  city?: string;
  companyType?: string;
  description?: string;
  logoUrl?: string;
  lifeAtCompanyImages?: string[];
};

export async function updateCompanyRequest(id: string, body: UpdateCompanyRequestBody) {
  return apiFetch<CompanyRequest>(`/admin/company-requests/${id}`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function approveCompanyRequest(id: string) {
  return apiFetch<CompanyRequest>(`/admin/company-requests/${id}/approve`, {
    method: "PATCH",
    token: getAccessToken(),
  });
}

export async function mergeCompanyRequest(id: string, companyId: string, reviewNotes?: string) {
  return apiFetch<CompanyRequest>(`/admin/company-requests/${id}/merge`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify({ companyId, reviewNotes }),
  });
}

export async function rejectCompanyRequest(id: string, reviewNotes?: string) {
  return apiFetch<CompanyRequest>(`/admin/company-requests/${id}/reject`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify({ reviewNotes }),
  });
}

export type AdminBannerSlide = {
  id?: string;
  href: string;
  imageUrl?: string | null;
  alt: string;
  active?: boolean;
};

export type AdminBannerSlot = {
  id: string;
  key: string;
  label: string;
  aspectRatio: BannerAspectRatio;
  active: boolean;
  startsAt: string;
  endsAt: string;
  sortOrder: number;
  slides: AdminBannerSlide[];
};

export type AdminBannerCampaign = {
  id: string;
  label: string;
  aspectRatio: BannerAspectRatio;
  href: string;
  imageUrl?: string | null;
  alt: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
  sortOrder: number;
  viewCount: number;
};

export type CreateAdminBannerCampaignBody = {
  aspectRatio: BannerAspectRatio;
  label?: string;
  href: string;
  imageUrl: string;
  alt?: string;
  startsAt: string;
  promotionDays: PromotionPeriodDays;
};

export type UpdateAdminBannerCampaignBody = {
  label?: string;
  href?: string;
  imageUrl?: string;
  alt?: string;
  startsAt?: string;
  promotionDays?: PromotionPeriodDays;
  active?: boolean;
};

export type AdminSponsoredAd = {
  id: string;
  jobId: string;
  sortOrder: number;
  active: boolean;
  viewCount: number;
  startsAt: string;
  endsAt: string;
  job: Job;
};

export type PromotionPeriodDays = 3 | 5 | 7 | 14 | 30;

export type CreateAdminSponsoredAdBody = {
  jobId: string;
  startsAt: string;
  promotionDays: PromotionPeriodDays;
};

export type UpdateAdminSponsoredAdBody = {
  startsAt?: string;
  promotionDays?: PromotionPeriodDays;
  active?: boolean;
};

export async function getAdminBannerSlots(aspectRatio?: BannerAspectRatio) {
  const query = aspectRatio ? `?aspectRatio=${aspectRatio}` : "";
  return apiFetch<AdminBannerSlot[]>(`/admin/platform-ads/banner-slots${query}`, {
    token: getAccessToken(),
  });
}

export async function updateAdminBannerSlot(
  id: string,
  body: {
    label?: string;
    active?: boolean;
    startsAt?: string;
    promotionDays?: PromotionPeriodDays;
    slides?: AdminBannerSlide[];
  },
) {
  return apiFetch<AdminBannerSlot>(`/admin/platform-ads/banner-slots/${id}`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function getAdminBannerCampaigns(aspectRatio?: BannerAspectRatio) {
  const query = aspectRatio ? `?aspectRatio=${aspectRatio}` : "";
  return apiFetch<AdminBannerCampaign[]>(`/admin/platform-ads/banner-campaigns${query}`, {
    token: getAccessToken(),
  });
}

export async function getAdminBannerCampaign(id: string) {
  return apiFetch<AdminBannerCampaign>(`/admin/platform-ads/banner-campaigns/${id}`, {
    token: getAccessToken(),
  });
}

export async function createAdminBannerCampaign(body: CreateAdminBannerCampaignBody) {
  return apiFetch<AdminBannerCampaign[]>("/admin/platform-ads/banner-campaigns", {
    method: "POST",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function updateAdminBannerCampaign(
  id: string,
  body: UpdateAdminBannerCampaignBody,
) {
  return apiFetch<AdminBannerCampaign>(`/admin/platform-ads/banner-campaigns/${id}`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function deleteAdminBannerCampaign(id: string) {
  return apiFetch<AdminBannerCampaign[]>(`/admin/platform-ads/banner-campaigns/${id}`, {
    method: "DELETE",
    token: getAccessToken(),
  });
}

export async function getAdminSponsoredAds() {
  return apiFetch<AdminSponsoredAd[]>("/admin/platform-ads/sponsored", {
    token: getAccessToken(),
  });
}

export async function createAdminSponsoredAd(body: CreateAdminSponsoredAdBody) {
  return apiFetch<AdminSponsoredAd[]>("/admin/platform-ads/sponsored", {
    method: "POST",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function reorderAdminSponsoredAds(jobIds: string[]) {
  return apiFetch<AdminSponsoredAd[]>("/admin/platform-ads/sponsored/reorder", {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify({ jobIds }),
  });
}

export async function updateAdminSponsoredAd(id: string, body: UpdateAdminSponsoredAdBody) {
  return apiFetch<AdminSponsoredAd[]>(`/admin/platform-ads/sponsored/${id}`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function deleteAdminSponsoredAd(id: string) {
  return apiFetch<AdminSponsoredAd[]>(`/admin/platform-ads/sponsored/${id}`, {
    method: "DELETE",
    token: getAccessToken(),
  });
}

export async function getAdminJobCategories() {
  return apiFetch<AdminJobCategory[]>("/admin/job-categories", {
    token: getAccessToken(),
  });
}

export type CreateAdminJobCategoryBody = {
  name: string;
  description?: string;
  icon?: string;
};

export type UpdateAdminJobCategoryBody = {
  name?: string;
  description?: string;
  icon?: string;
  active?: boolean;
};

export async function createAdminJobCategory(body: CreateAdminJobCategoryBody) {
  return apiFetch<AdminJobCategory>("/admin/job-categories", {
    method: "POST",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function updateAdminJobCategory(id: string, body: UpdateAdminJobCategoryBody) {
  return apiFetch<AdminJobCategory>(`/admin/job-categories/${id}`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function deleteAdminJobCategory(id: string) {
  return apiFetch<{ deleted: boolean }>(`/admin/job-categories/${id}`, {
    method: "DELETE",
    token: getAccessToken(),
  });
}

export async function getAdminPartners() {
  return apiFetch<PlatformPartner[]>("/admin/partners", {
    token: getAccessToken(),
  });
}

export type CreateAdminPartnerBody = {
  name: string;
  screenText?: string;
  website?: string;
};

export type UpdateAdminPartnerBody = {
  name?: string;
  screenText?: string;
  website?: string;
};

export async function createAdminPartner(body: CreateAdminPartnerBody) {
  return apiFetch<PlatformPartner>("/admin/partners", {
    method: "POST",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function updateAdminPartner(id: string, body: UpdateAdminPartnerBody) {
  return apiFetch<PlatformPartner>(`/admin/partners/${id}`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}
