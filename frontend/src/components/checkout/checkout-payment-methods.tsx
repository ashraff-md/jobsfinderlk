"use client";

import { Icon } from "@/components/ui/icon";
import { CheckoutPaymentOption } from "@/components/checkout/checkout-payment-option";
import {
  checkoutInputClass,
  type CheckoutPaymentType,
} from "@/lib/checkout/checkout-utils";
import { cn } from "@/lib/utils";

type CheckoutPaymentMethodsProps = {
  paymentType: CheckoutPaymentType;
  onPaymentTypeChange: (type: CheckoutPaymentType) => void;
  idPrefix?: string;
  className?: string;
};

export function CheckoutPaymentMethods({
  paymentType,
  onPaymentTypeChange,
  idPrefix = "",
  className,
}: CheckoutPaymentMethodsProps) {
  const id = (suffix: string) => `${idPrefix}${suffix}`;

  return (
    <section
      className={
        className ??
        "rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg"
      }
    >
      <div className="mb-stack-lg flex items-center gap-stack-md">
        <Icon name="payments" className="text-secondary" />
        <h2 className="font-headline-md text-headline-md">Payment Method</h2>
      </div>
      <div className="space-y-stack-md">
        <CheckoutPaymentOption
          id={id("card")}
          selected={paymentType === "card"}
          onSelect={() => onPaymentTypeChange("card")}
          icon="credit_card"
          title="Credit / Debit Card"
          badge={
            <div className="flex gap-2">
              <div className="h-5 w-8 rounded-sm bg-outline-variant" />
              <div className="h-5 w-8 rounded-sm bg-outline-variant" />
            </div>
          }
        >
          <div
            className={cn(
              "mt-2 grid grid-cols-1 gap-stack-md md:grid-cols-2",
              paymentType !== "card" && "hidden",
            )}
          >
            <div className="space-y-2 md:col-span-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Card Number
              </label>
              <input className={checkoutInputClass} placeholder="0000 0000 0000 0000" type="text" />
            </div>
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Expiry Date
              </label>
              <input className={checkoutInputClass} placeholder="MM / YY" type="text" />
            </div>
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant">CVV</label>
              <input className={checkoutInputClass} placeholder="***" type="password" />
            </div>
          </div>
        </CheckoutPaymentOption>

        <CheckoutPaymentOption
          id={id("bank")}
          selected={paymentType === "bank"}
          onSelect={() => onPaymentTypeChange("bank")}
          icon="account_balance"
          title="Local Bank Transfer"
        >
          <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">
            Direct wire to our local HNB or Sampath Bank accounts. Details provided after
            confirmation.
          </p>
        </CheckoutPaymentOption>

        <CheckoutPaymentOption
          id={id("po")}
          selected={paymentType === "po"}
          onSelect={() => onPaymentTypeChange("po")}
          icon="description"
          title="Institutional Purchase Order (PO)"
          badge={
            <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-[10px] font-bold text-on-secondary-fixed">
              NET-30
            </span>
          }
        >
          <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">
            For established corporate partners. Subject to credit verification.
          </p>
        </CheckoutPaymentOption>
      </div>
    </section>
  );
}
