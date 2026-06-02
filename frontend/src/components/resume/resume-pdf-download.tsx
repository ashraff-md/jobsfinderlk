"use client";

import { useCallback, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ResumeDocument } from "@/components/resume/resume-document";
import { ResumeThemePickerModal } from "@/components/resume/resume-theme-picker-modal";
import { Icon } from "@/components/ui/icon";
import { DEMO_RESUME_PROFILE } from "@/lib/resume/resume-profile-data";
import {
  DEFAULT_RESUME_THEME,
  RESUME_THEMES,
  type ResumeThemeId,
} from "@/lib/resume/resume-themes";

export function ResumePdfDownload() {
  const [modalOpen, setModalOpen] = useState(false);
  const [themeId, setThemeId] = useState<ResumeThemeId>(DEFAULT_RESUME_THEME);
  const [downloading, setDownloading] = useState(false);
  const renderHostRef = useRef<HTMLDivElement | null>(null);

  const downloadPdf = useCallback(async () => {
    setDownloading(true);
    try {
      const host = document.createElement("div");
      host.style.position = "fixed";
      host.style.left = "-10000px";
      host.style.top = "0";
      host.style.width = "210mm";
      document.body.appendChild(host);
      renderHostRef.current = host;

      const root = createRoot(host);
      root.render(<ResumeDocument profile={DEMO_RESUME_PROFILE} themeId={themeId} />);

      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => setTimeout(resolve, 150));

      const element = host.querySelector(".resume-document") as HTMLElement;
      if (!element) throw new Error("Resume render failed");

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const themeName = RESUME_THEMES.find((t) => t.id === themeId)?.name ?? "Resume";
      const slug = DEMO_RESUME_PROFILE.fullName.replace(/\s+/g, "-").toLowerCase();
      pdf.save(`${slug}-${themeName.replace(/\s+/g, "-")}.pdf`);

      root.unmount();
      document.body.removeChild(host);
      renderHostRef.current = null;
      setModalOpen(false);
    } catch {
      window.alert("Could not generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [themeId]);

  const handleDownloadClick = () => {
    downloadPdf();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-outline-variant bg-primary-container py-4 font-label-bold text-on-primary shadow-sm transition-all hover:opacity-90"
      >
        <Icon name="download" />
        Download PDF Resume
      </button>

      <ResumeThemePickerModal
        open={modalOpen}
        selectedThemeId={themeId}
        onSelectTheme={setThemeId}
        onClose={() => !downloading && setModalOpen(false)}
        onDownload={handleDownloadClick}
        downloading={downloading}
      />
    </>
  );
}
