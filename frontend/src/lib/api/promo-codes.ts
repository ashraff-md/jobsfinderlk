import { apiFetch } from "./client";
import type { PurchaseProduct } from "@/lib/employer/purchases";

export type ValidatedPromoCode = {
  id: string;
  code: string;
  description: string | null;
  discountAmount: number;
  subtotalAfterDiscount: number;
  vat: number;
  total: number;
};

export async function validatePromoCodeApi(input: {
  code: string;
  product: PurchaseProduct;
  subtotal: number;
}) {
  return apiFetch<ValidatedPromoCode>("/auth/promo-codes/validate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
