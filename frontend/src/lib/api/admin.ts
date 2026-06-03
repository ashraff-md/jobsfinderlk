import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type { CompanyRequest, Job } from "./types";

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

export async function getPendingCompanyRequests() {
  return apiFetch<CompanyRequest[]>("/admin/company-requests/pending", {
    token: getAccessToken(),
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
