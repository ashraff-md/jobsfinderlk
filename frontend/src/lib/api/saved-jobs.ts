import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type { Job } from "./types";

export type SavedJobEntry = {
  id: string;
  savedAt: string;
  job: Job;
};

export async function getSavedJobIds() {
  return apiFetch<string[]>("/saved-jobs/ids", { token: getAccessToken() });
}

export async function getSavedJobs() {
  return apiFetch<SavedJobEntry[]>("/saved-jobs", { token: getAccessToken() });
}

export async function saveJob(jobId: string) {
  return apiFetch<SavedJobEntry>(`/saved-jobs/${jobId}`, {
    method: "POST",
    token: getAccessToken(),
  });
}

export async function unsaveJob(jobId: string) {
  return apiFetch<{ removed: boolean }>(`/saved-jobs/${jobId}`, {
    method: "DELETE",
    token: getAccessToken(),
  });
}
