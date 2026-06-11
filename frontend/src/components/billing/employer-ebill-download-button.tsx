"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { EmployerPurchaseRecord } from "@/lib/api/employer-billing";
import type { EbillBuyer } from "@/components/billing/employer-ebill-document";
import { downloadEmployerEbill } from "@/lib/billing/download-employer-ebill";

type EmployerEbillDownloadButtonProps = {
  purchase: EmployerPurchaseRecord;
  buyer: EbillBuyer;
};

export function EmployerEbillDownloadButton({
  purchase,
  buyer,
}: EmployerEbillDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  return (
    <button
      type="button"
      disabled={downloading}
      onClick={() => {
        setDownloading(true);
        void downloadEmployerEbill(purchase, buyer).catch(() => {
          window.alert("Could not download e-bill. Please try again.");
        }).finally(() => setDownloading(false));
      }}
      className="inline-flex items-center gap-1 rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary disabled:opacity-50"
      aria-label={`Download e-bill for ${purchase.plan}`}
      title="Download e-bill"
    >
      <Icon name="download" />
    </button>
  );
}
