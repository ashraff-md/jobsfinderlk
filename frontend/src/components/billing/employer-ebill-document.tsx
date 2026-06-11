import type { EmployerPurchaseRecord } from "@/lib/api/employer-billing";
import { resolvePurchaseAmounts } from "@/lib/billing/ebill-amounts";
import { JOBSFINDER_BILLING } from "@/lib/billing/ebill.constants";
import {
  formatLkr,
  formatPaymentMethod,
  formatPurchaseDate,
  formatPurchaseProduct,
} from "@/lib/employer/purchases";

export type EbillBuyer = {
  name: string;
  email: string;
  billingAddress?: string;
};

type EmployerEbillDocumentProps = {
  purchase: EmployerPurchaseRecord;
  buyer: EbillBuyer;
  logoSrc: string;
};

function formatInvoiceNumber(purchaseId: string) {
  return `INV-${purchaseId.replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

function lineItemSubtitle(purchase: EmployerPurchaseRecord) {
  const parts = [purchase.duration, formatPaymentMethod(purchase.paymentMethod)].filter(Boolean);
  return parts.join(" · ");
}

const billFont = "var(--font-manrope), Manrope, system-ui, sans-serif";

export function EmployerEbillDocument({
  purchase,
  buyer,
  logoSrc,
}: EmployerEbillDocumentProps) {
  const { subtotal, discount, total } = resolvePurchaseAmounts(purchase);
  const issueDate = formatPurchaseDate(purchase.purchasedAt);
  const invoiceNumber = formatInvoiceNumber(purchase.id);
  const billingAddressLines = buyer.billingAddress
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <article
      className="employer-ebill-document box-border flex h-[297mm] w-[210mm] flex-col overflow-hidden border border-[#c7c5cf] bg-white p-10 text-[#0d1c2e]"
      style={{ fontFamily: billFont }}
    >
      <section className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="JobsFinder.lk Logo"
            data-ebill-logo="true"
            src={logoSrc}
            width={40}
            height={40}
            className="block h-10 w-10 shrink-0 object-contain"
          />
          <span className="text-[24px] font-extrabold leading-none tracking-tight text-[#0c1538]">
            {JOBSFINDER_BILLING.platformName}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <h2 className="mb-1.5 text-[20px] font-bold leading-none text-[#0051d5]">E-BILL</h2>
          <span className="inline-flex min-w-[52px] items-center justify-center rounded bg-[#dbe1ff] px-3 py-1 text-center text-[12px] font-semibold leading-none text-[#00174b]">
            PAID
          </span>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-2 gap-6 border-y border-[#c7c5cf] py-5">
        <div className="space-y-2.5 text-[13px]">
          <div>
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-[#46464e]">
              Invoice Number
            </span>
            <span className="font-semibold">{invoiceNumber}</span>
          </div>
          <div>
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-[#46464e]">
              Issue Date
            </span>
            <span>{issueDate}</span>
          </div>
          <div>
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-[#46464e]">
              Payment Method
            </span>
            <span>{formatPaymentMethod(purchase.paymentMethod)}</span>
          </div>
        </div>
        <div className="border-l border-[#c7c5cf] pl-5 text-right text-[13px] leading-relaxed">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#46464e]">
            Issued By
          </span>
          <p>
            {JOBSFINDER_BILLING.platformName}
            <br />
            {JOBSFINDER_BILLING.companyName}
            <br />
            {JOBSFINDER_BILLING.companyEmail}
          </p>
        </div>
      </section>

      <section className="mb-5">
        <div className="rounded border border-[#c7c5cf] bg-[#eff4ff] p-3.5">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#46464e]">
            Bill To
          </span>
          <h3 className="text-[18px] font-bold">{buyer.name}</h3>
          <div className="text-[13px] text-[#46464e]">
            {billingAddressLines && billingAddressLines.length > 0 ? (
              <p className="mt-1 whitespace-pre-line">
                {billingAddressLines.join("\n")}
              </p>
            ) : (
              <p className="mt-1 italic">No billing address on file</p>
            )}
            <p className="mt-2">{buyer.email}</p>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="bg-[#000000] text-white">
              <th className="px-3 py-2.5 text-[11px] font-semibold uppercase">Description</th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase">Qty</th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase">
                Unit Price
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#c7c5cf]">
              <td className="px-3 py-4">
                <span className="block font-semibold">
                  {formatPurchaseProduct(purchase.product)} — {purchase.plan}
                </span>
                {lineItemSubtitle(purchase) ? (
                  <span className="text-[11px] text-[#46464e]">{lineItemSubtitle(purchase)}</span>
                ) : null}
              </td>
              <td className="px-3 py-4 text-center">1</td>
              <td className="px-3 py-4 text-right">{formatLkr(subtotal)}</td>
              <td className="px-3 py-4 text-right font-semibold">{formatLkr(subtotal)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-5 flex justify-end">
        <div className="w-full max-w-[240px] space-y-2 text-[13px]">
          <div className="flex justify-between text-[#46464e]">
            <span>Subtotal</span>
            <span>{formatLkr(subtotal)}</span>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between text-[#0051d5]">
              <span>
                Discount{purchase.promoCode ? ` (${purchase.promoCode})` : ""}
              </span>
              <span>- {formatLkr(discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-[#000000] pt-2 text-[18px] font-bold text-[#000000]">
            <span>TOTAL</span>
            <span>{formatLkr(total)}</span>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-[#c7c5cf] pt-5 text-[11px] leading-relaxed text-[#46464e]">
        <div className="mb-4 grid grid-cols-2 gap-6">
          <div>
            <h4 className="mb-1 text-[11px] font-bold uppercase text-[#000000]">Payment Details</h4>
            <p>Bank: {JOBSFINDER_BILLING.bankName}</p>
            <p>Account: {JOBSFINDER_BILLING.bankAccountName}</p>
            <p>A/C No: {JOBSFINDER_BILLING.bankAccountNumber}</p>
            <p>Swift: {JOBSFINDER_BILLING.swiftCode}</p>
          </div>
          <div className="text-right">
            <h4 className="mb-1 text-[11px] font-bold uppercase text-[#000000]">Support</h4>
            <p>{JOBSFINDER_BILLING.companyEmail}</p>
            <p>{JOBSFINDER_BILLING.supportUrl}</p>
          </div>
        </div>
        <p className="text-center text-[12px] text-[#46464e]">
          Thank you for choosing {JOBSFINDER_BILLING.platformName}.
        </p>
        <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-wide text-[#76767f]">
          {JOBSFINDER_BILLING.computerGeneratedNotice}
        </p>
      </footer>
    </article>
  );
}
