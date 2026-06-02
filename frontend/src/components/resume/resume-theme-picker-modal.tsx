"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { RESUME_THEMES, type ResumeThemeId } from "@/lib/resume/resume-themes";
import { cn } from "@/lib/utils";

type ResumeThemePickerModalProps = {
  open: boolean;
  selectedThemeId: ResumeThemeId;
  onSelectTheme: (id: ResumeThemeId) => void;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
};

export function ResumeThemePickerModal({
  open,
  selectedThemeId,
  onSelectTheme,
  onClose,
  onDownload,
  downloading,
}: ResumeThemePickerModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 bg-primary/50 backdrop-blur-sm"
        aria-label="Close theme picker"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-theme-modal-title"
        className={cn(
          "relative flex max-h-[min(90vh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl transition-transform duration-300",
          open ? "scale-100" : "scale-95",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-outline-variant bg-primary-container px-6 py-4 text-on-primary">
          <div>
            <h2 id="resume-theme-modal-title" className="text-lg font-bold">
              Choose a resume theme
            </h2>
            <p className="text-label-sm text-on-primary/80">
              Select one of 10 templates for your PDF download
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {RESUME_THEMES.map((theme) => {
              const selected = selectedThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelectTheme(theme.id)}
                  className={cn(
                    "flex flex-col rounded-xl border p-4 text-left transition-all",
                    selected
                      ? "border-secondary bg-secondary/5 ring-2 ring-secondary/30"
                      : "border-outline-variant hover:border-primary/30 hover:bg-surface-container-low",
                  )}
                >
                  <div
                    className="mb-3 h-20 w-full overflow-hidden rounded-lg border border-outline-variant/40"
                    style={{ backgroundColor: theme.preview.body }}
                  >
                    <div
                      className="h-8 px-3 py-2"
                      style={{ backgroundColor: theme.preview.header }}
                    >
                      <div
                        className="mb-1 h-2 w-2/3 rounded-sm opacity-90"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                      <div
                        className="h-1.5 w-1/2 rounded-sm opacity-50"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                    </div>
                    <div className="space-y-1.5 px-3 pt-2">
                      <div className="h-1 w-full rounded bg-outline-variant/30" />
                      <div className="h-1 w-4/5 rounded bg-outline-variant/20" />
                      <div className="h-1 w-3/5 rounded bg-outline-variant/20" />
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-label-bold text-primary-container">{theme.name}</p>
                      <p className="text-label-sm text-outline">{theme.description}</p>
                    </div>
                    {selected && (
                      <Icon name="check_circle" className="shrink-0 text-secondary" filled />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-outline-variant bg-surface-container-low p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={downloading}
            className="rounded-xl border border-outline-variant px-6 py-3 font-label-bold text-primary-container transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-container px-8 py-3 font-label-bold text-on-primary transition-all hover:opacity-90 disabled:opacity-60"
          >
            <Icon name="download" />
            {downloading ? "Generating PDF…" : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
