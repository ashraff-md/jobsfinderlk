import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type {
  AdminRecruiter,
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
  sortOrder: number;
  slides: AdminBannerSlide[];
};

export type AdminSponsoredAd = {
  id: string;
  jobId: string;
  sortOrder: number;
  active: boolean;
  job: Job;
};

export async function getAdminBannerSlots(aspectRatio?: BannerAspectRatio) {
  const query = aspectRatio ? `?aspectRatio=${aspectRatio}` : "";
  return apiFetch<AdminBannerSlot[]>(`/admin/platform-ads/banner-slots${query}`, {
    token: getAccessToken(),
  });
}

export async function updateAdminBannerSlot(
  id: string,
  body: { label?: string; active?: boolean; slides?: AdminBannerSlide[] },
) {
  return apiFetch<AdminBannerSlot>(`/admin/platform-ads/banner-slots/${id}`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function getAdminSponsoredAds() {
  return apiFetch<AdminSponsoredAd[]>("/admin/platform-ads/sponsored", {
    token: getAccessToken(),
  });
}

export async function createAdminSponsoredAd(jobId: string) {
  return apiFetch<AdminSponsoredAd[]>("/admin/platform-ads/sponsored", {
    method: "POST",
    token: getAccessToken(),
    body: JSON.stringify({ jobId }),
  });
}

export async function reorderAdminSponsoredAds(jobIds: string[]) {
  return apiFetch<AdminSponsoredAd[]>("/admin/platform-ads/sponsored/reorder", {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify({ jobIds }),
  });
}

export async function patchAdminSponsoredAd(id: string, active: boolean) {
  return apiFetch<AdminSponsoredAd[]>(`/admin/platform-ads/sponsored/${id}`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify({ active }),
  });
}

export async function deleteAdminSponsoredAd(id: string) {
  return apiFetch<AdminSponsoredAd[]>(`/admin/platform-ads/sponsored/${id}`, {
    method: "DELETE",
    token: getAccessToken(),
  });
}
