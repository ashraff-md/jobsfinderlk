import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type {
  Application,
  Company,
  CompanyDetail,
  EmployerJob,
  Job,
  JobCategory,
  JobsSearchResponse,
} from "./types";

export async function searchPublishedJobs(options?: {
  q?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}) {
  return searchJobs({
    page: options?.page ?? 1,
    limit: options?.limit ?? 20,
    ...(options?.q?.trim() ? { q: options.q.trim() } : {}),
    ...(options?.featured ? { featured: true } : {}),
  });
}

export async function searchJobs(
  params: Record<string, string | number | boolean | string[] | undefined>,
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
    if (typeof value === "boolean") {
      query.set(key, value ? "true" : "false");
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

export async function getJobCategories() {
  return apiFetch<JobCategory[]>("/jobs/categories");
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

export async function getEmployerJobs() {
  return apiFetch<EmployerJob[]>("/jobs/employer/mine", {
    token: getAccessToken(),
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
