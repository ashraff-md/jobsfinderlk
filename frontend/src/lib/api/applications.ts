import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type { JobApplication } from "./types";

export async function getJobApplications(jobId: string) {
  return apiFetch<JobApplication[]>(`/applications/job/${jobId}`, {
    token: getAccessToken(),
  });
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  return apiFetch<JobApplication>(`/applications/${applicationId}/status`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify({ status }),
  });
}
