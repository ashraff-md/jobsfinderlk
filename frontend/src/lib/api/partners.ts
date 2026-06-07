import { apiFetch } from "./client";
import type { PlatformPartner } from "./types";

export async function getPartners() {
  return apiFetch<PlatformPartner[]>("/partners");
}
