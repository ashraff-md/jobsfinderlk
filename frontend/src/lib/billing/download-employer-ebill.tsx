import { createRoot } from "react-dom/client";
import {
  EmployerEbillDocument,
  type EbillBuyer,
} from "@/components/billing/employer-ebill-document";
import type { EmployerPurchaseRecord } from "@/lib/api/employer-billing";
import { loadLogoDataUrl } from "@/lib/billing/load-logo-data-url";

function invoiceFilename(purchase: EmployerPurchaseRecord) {
  const stamp = purchase.purchasedAt.slice(0, 10).replace(/-/g, "");
  const suffix = purchase.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `JobsFinder-ebill-${stamp}-${suffix}.pdf`;
}

export async function downloadEmployerEbill(
  purchase: EmployerPurchaseRecord,
  buyer: EbillBuyer,
) {
  const logoSrc = await loadLogoDataUrl();

  const host = document.createElement("div");
  host.className = "font-sans";
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.width = "210mm";
  host.style.background = "#ffffff";
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(<EmployerEbillDocument purchase={purchase} buyer={buyer} logoSrc={logoSrc} />);

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await new Promise((resolve) => setTimeout(resolve, 100));

    const element = host.querySelector(".employer-ebill-document") as HTMLElement | null;
    if (!element) throw new Error("E-bill render failed");

    const logoImg = element.querySelector(
      'img[data-ebill-logo="true"]',
    ) as HTMLImageElement | null;
    if (logoImg && !logoImg.complete) {
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => reject(new Error("E-bill logo failed to load"));
      });
    }

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

    pdf.save(invoiceFilename(purchase));
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}
