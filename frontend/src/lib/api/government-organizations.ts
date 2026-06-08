import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type {
  CreateGovernmentOrganizationBody,
  GovernmentOrganization,
  GovernmentOrganizationSuggestion,
} from "./types";

export async function suggestGovernmentOrganizations(q: string, signal?: AbortSignal) {
  if (!q.trim()) return [] as GovernmentOrganizationSuggestion[];
  return apiFetch<GovernmentOrganizationSuggestion[]>(
    `/government-organizations/suggest?q=${encodeURIComponent(q.trim())}`,
    { token: getAccessToken(), signal },
  );
}

export async function checkGovernmentOrganizationDuplicates(name: string, signal?: AbortSignal) {
  if (!name.trim()) return [] as GovernmentOrganizationSuggestion[];
  return apiFetch<GovernmentOrganizationSuggestion[]>(
    `/government-organizations/check-duplicates?name=${encodeURIComponent(name.trim())}`,
    { token: getAccessToken(), signal },
  );
}

export async function getGovernmentOrganizations(search?: string) {
  const qs = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return apiFetch<GovernmentOrganization[]>(`/government-organizations${qs}`, {
    token: getAccessToken(),
  });
}

export async function getGovernmentOrganization(id: string) {
  return apiFetch<GovernmentOrganization>(`/government-organizations/${id}`, {
    token: getAccessToken(),
  });
}

export async function createGovernmentOrganization(body: CreateGovernmentOrganizationBody) {
  return apiFetch<GovernmentOrganization>("/government-organizations", {
    method: "POST",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function updateGovernmentOrganization(
  id: string,
  body: Partial<CreateGovernmentOrganizationBody> & {
    parentOrganizationId?: string | null;
  },
) {
  return apiFetch<GovernmentOrganization>(`/government-organizations/${id}`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export type { CreateGovernmentOrganizationBody, GovernmentOrganization };
