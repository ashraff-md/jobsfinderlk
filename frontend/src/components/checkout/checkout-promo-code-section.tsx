"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { validatePromoCodeApi } from "@/lib/api/promo-codes";
import type { AppliedPromoCode } from "@/lib/checkout/checkout-utils";
import { formatCheckoutLkr } from "@/lib/checkout/checkout-utils";
import type { PurchaseProduct } from "@/lib/employer/purchases";
import { cn } from "@/lib/utils";

type CheckoutPromoCodeSectionProps = {
  product: PurchaseProduct;
  subtotal: number;
  appliedPromo: AppliedPromoCode | null;
  onAppliedPromoChange: (promo: AppliedPromoCode | null) => void;
  className?: string;
};

export function CheckoutPromoCodeSection({
  product,
  subtotal,
  appliedPromo,
  onAppliedPromoChange,
  className,
}: CheckoutPromoCodeSectionProps) {
  const [code, setCode] = useState(appliedPromo?.code ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyCode = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter a promo code.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await validatePromoCodeApi({
        code: trimmed,
        product,
        subtotal,
      });
      onAppliedPromoChange({
        code: result.code,
        description: result.description,
        discountAmount: result.discountAmount,
      });
      setCode(result.code);
    } catch (e) {
      onAppliedPromoChange(null);
      setError(e instanceof Error ? e.message : "Could not apply promo code.");
    } finally {
      setLoading(false);
    }
  };

  const removeCode = () => {
    setCode("");
    setError(null);
    onAppliedPromoChange(null);
  };

  return (
    <section
      className={cn(
        "rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg",
        className,
      )}
    >
      <div className="mb-stack-md flex items-center gap-stack-md">
        <Icon name="sell" className="text-secondary" />
        <h2 className="font-headline-md text-headline-md">Promo Code</h2>
      </div>

      {appliedPromo ? (
        <div className="flex flex-col gap-3 rounded-lg border border-secondary/30 bg-secondary-container/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-label-bold text-label-bold text-secondary">{appliedPromo.code}</p>
            {appliedPromo.description && (
              <p className="text-body-sm text-on-surface-variant">{appliedPromo.description}</p>
            )}
            <p className="mt-1 text-body-sm text-on-surface">
              You save {formatCheckoutLkr(appliedPromo.discountAmount)}
            </p>
          </div>
          <button
            type="button"
            onClick={removeCode}
            className="font-label-bold text-label-bold text-on-surface-variant hover:text-error"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="e.g. WELCOME10"
              className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-bright px-4 py-3 font-body-md uppercase outline-none focus:border-primary"
              aria-label="Promo code"
            />
            <button
              type="button"
              onClick={() => void applyCode()}
              disabled={loading}
              className="rounded-lg bg-primary px-6 py-3 font-label-bold text-label-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Applying…" : "Apply"}
            </button>
          </div>
          {error && (
            <p className="text-body-sm text-error">{error}</p>
          )}
        </div>
      )}
    </section>
  );
}
