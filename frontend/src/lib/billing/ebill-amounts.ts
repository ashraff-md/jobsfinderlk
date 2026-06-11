import type { EmployerPurchaseRecord } from "@/lib/api/employer-billing";

export function resolvePurchaseAmounts(purchase: EmployerPurchaseRecord) {
  const discount = Math.max(0, purchase.promoDiscount ?? 0);
  const total = purchase.total;
  const subtotal =
    purchase.subtotal != null && purchase.subtotal > 0 ? purchase.subtotal : total + discount;

  return { subtotal, discount, total };
}
