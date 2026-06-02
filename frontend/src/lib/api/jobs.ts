import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type {
  Application,
  Company,
  CompanyDetail,
  Job,
  JobsSearchResponse,
} from "./types";

export async function searchJobs(
  params: Record<string, string | number | string[] | undefined>,
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) query.append(key, item);
      });
      return;
    }
    query.set(key, String(value));
  });
  const qs = query.toString();
  return apiFetch<JobsSearchResponse>(`/jobs${qs ? `?${qs}` : ""}`);
}

export async function getJob(slug: string) {
  return apiFetch<Job>(`/jobs/${slug}`);
}

export async function getCompanies(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<Company[]>(`/companies${qs}`);
}

export async function getCompany(slug: string) {
  return apiFetch<CompanyDetail>(`/companies/${slug}`);
}

export async function applyToJob(slug: string) {
  return apiFetch<Application>(`/applications/by-slug/${slug}`, {
    method: "POST",
    token: getAccessToken(),
  });
}

export async function createJob(body: Record<string, unknown>) {
  return apiFetch<Job>("/jobs", {
    method: "POST",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function myApplications() {
  return apiFetch<Application[]>("/applications/mine", {
    token: getAccessToken(),
  });
}

export function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Salary negotiable";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}
