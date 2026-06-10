export type CheckoutPaymentType = "card" | "bank" | "po";

export const CHECKOUT_VAT_RATE = 0.08;

export const checkoutInputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-bright p-stack-md font-body-md text-body-md outline-none focus:border-primary focus:shadow-[0_0_0_1px_#0d1c2e]";

export function formatCheckoutLkr(amount: number) {
  return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculateCheckoutTotal(subtotal: number, promoDiscount = 0) {
  const subtotalAfterDiscount = Math.max(0, subtotal - promoDiscount);
  const vat = Math.round(subtotalAfterDiscount * CHECKOUT_VAT_RATE);
  return {
    subtotal,
    promoDiscount,
    subtotalAfterDiscount,
    vat,
    total: subtotalAfterDiscount + vat,
  };
}

export type AppliedPromoCode = {
  code: string;
  description?: string | null;
  discountAmount: number;
};
