import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type { PurchaseProduct } from "@/lib/employer/purchases";

export type ListingAllowance = {
  freeSlots: number;
  purchasedSlots: number;
  totalSlots: number;
  usedSlots: number;
  remainingSlots: number;
};

export type EmployerAdCampaignPayload = {
  jobId?: string;
  aspectRatio?: "RATIO_3_2" | "RATIO_2_5";
  label?: string;
  href?: string;
  imageUrl?: string;
  promotionDays?: number;
  startsAt?: string;
};

export type EmployerPurchaseRecord = {
  id: string;
  product: PurchaseProduct;
  plan: string;
  duration?: string;
  jobSlots?: number;
  subtotal?: number;
  promoCode?: string;
  promoDiscount?: number;
  total: number;
  paymentMethod: "card" | "bank" | "po";
  purchasedAt: string;
};

export async function getListingAllowance(token?: string | null) {
  return apiFetch<ListingAllowance>("/auth/listing-allowance", {
    token: token ?? getAccessToken(),
  });
}

export async function listEmployerPurchasesApi(token?: string | null) {
  return apiFetch<EmployerPurchaseRecord[]>("/auth/purchases", {
    token: token ?? getAccessToken(),
  });
}

export async function recordEmployerPurchaseApi(input: {
  product: PurchaseProduct;
  plan: string;
  duration?: string;
  subtotal: number;
  total: number;
  promoCode?: string;
  paymentMethod: "card" | "bank" | "po";
  adCampaign?: EmployerAdCampaignPayload;
}) {
  return apiFetch<{
    purchase: EmployerPurchaseRecord;
    listingAllowance?: ListingAllowance;
  }>("/auth/purchases", {
    method: "POST",
    token: getAccessToken(),
    body: JSON.stringify(input),
  });
}
