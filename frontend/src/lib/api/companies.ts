import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type { Company, CompanyRequest, CompanySuggestion } from "./types";

export async function suggestCompanies(q: string) {
  if (!q.trim()) return [] as CompanySuggestion[];
  return apiFetch<CompanySuggestion[]>(
    `/companies/suggest?q=${encodeURIComponent(q.trim())}`,
  );
}

export async function checkCompanyDuplicates(params: {
  name: string;
  website?: string;
  emailDomain?: string;
}) {
  const query = new URLSearchParams({ name: params.name });
  if (params.website) query.set("website", params.website);
  if (params.emailDomain) query.set("emailDomain", params.emailDomain);
  return apiFetch<CompanySuggestion[]>(`/companies/check-duplicates?${query}`);
}

export type CreateCompanyRequestBody = {
  companyName: string;
  industry: string;
  website?: string;
  emailDomain?: string;
  location: string;
  companyType: string;
  description?: string;
  lifeAtCompanyImages?: string[];
};

export async function createCompanyRequest(body: CreateCompanyRequestBody) {
  return apiFetch<CompanyRequest>("/company-requests", {
    method: "POST",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function getMyCompanyRequests() {
  return apiFetch<CompanyRequest[]>("/company-requests/mine", {
    token: getAccessToken(),
  });
}

export { getCompanies, getCompany } from "./jobs";
export type { Company };
