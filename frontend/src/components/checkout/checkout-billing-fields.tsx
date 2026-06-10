"use client";

import { checkoutInputClass } from "@/lib/checkout/checkout-utils";

type CheckoutBillingFieldsProps = {
  companyName: string;
  onCompanyNameChange: (value: string) => void;
  address: string;
  onAddressChange: (value: string) => void;
  vatNumber: string;
  onVatNumberChange: (value: string) => void;
  postalCode: string;
  onPostalCodeChange: (value: string) => void;
  className?: string;
};

export function CheckoutBillingFields({
  companyName,
  onCompanyNameChange,
  address,
  onAddressChange,
  vatNumber,
  onVatNumberChange,
  postalCode,
  onPostalCodeChange,
  className,
}: CheckoutBillingFieldsProps) {
  return (
    <section
      className={
        className ??
        "rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg"
      }
    >
      <h2 className="mb-stack-lg font-headline-md text-headline-md">Billing Information</h2>
      <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="block font-label-bold text-label-bold">Company Name</label>
          <input
            className={checkoutInputClass}
            placeholder="e.g. Acme Corp Institutional"
            type="text"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block font-label-bold text-label-bold">Headquarters Address</label>
          <input
            className={checkoutInputClass}
            placeholder="Street, Building, Suite"
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block font-label-bold text-label-bold">
            VAT Number <span className="font-normal text-on-surface-variant">(Optional)</span>
          </label>
          <input
            className={checkoutInputClass}
            placeholder="TAX-1234567"
            type="text"
            value={vatNumber}
            onChange={(e) => onVatNumberChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block font-label-bold text-label-bold">Postal Code</label>
          <input
            className={checkoutInputClass}
            placeholder="00100"
            type="text"
            value={postalCode}
            onChange={(e) => onPostalCodeChange(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
