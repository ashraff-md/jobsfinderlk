"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { ListingAllowance } from "@/lib/api/employer-billing";

type ListingSlotsPromptProps = {
  allowance: ListingAllowance;
};

export function ListingSlotsPrompt({ allowance }: ListingSlotsPromptProps) {
  return (
    <div className="professional-card mx-auto max-w-2xl space-y-5 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
      <div className="flex items-start gap-3">
        <Icon name="inventory_2" className="mt-0.5 text-primary" />
        <div>
          <h2 className="text-headline-md text-on-surface">No job listing slots available</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            You have used all {allowance.totalSlots} active listing
            {allowance.totalSlots === 1 ? "" : "s"} ({allowance.freeSlots} free
            {allowance.purchasedSlots > 0
              ? ` + ${allowance.purchasedSlots} purchased`
              : ""}
            ). Purchase a listing package to post more vacancies.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-4">
        <p className="text-label-sm text-on-surface-variant">
          <span className="font-label-bold text-on-surface">Used:</span>{" "}
          {allowance.usedSlots}/{allowance.totalSlots} slots
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/pricing#job-listings-pricing"
          className="inline-flex rounded-lg bg-primary px-6 py-3 font-label-bold text-on-primary"
        >
          View listing packages
        </Link>
        <Link
          href="/employer/settings#billing"
          className="inline-flex rounded-lg border border-primary px-6 py-3 font-label-bold text-primary"
        >
          Billing &amp; purchases
        </Link>
      </div>
    </div>
  );
}
