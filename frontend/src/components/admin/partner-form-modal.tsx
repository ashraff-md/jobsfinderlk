"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  createAdminPartner,
  updateAdminPartner,
  type CreateAdminPartnerBody,
} from "@/lib/api/admin";
import type { PlatformPartner } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type PartnerFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  partner?: PlatformPartner | null;
};

const inputClass =
  "w-full rounded-lg border border-outline-variant px-4 py-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

export function PartnerFormModal({
  open,
  onClose,
  onSaved,
  partner,
}: PartnerFormModalProps) {
  const isEdit = Boolean(partner);
  const [name, setName] = useState("");
  const [screenText, setScreenText] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(partner?.name ?? "");
    setScreenText(partner?.screenText ?? "");
    setWebsite(partner?.website ?? "");
    setError(null);
  }, [open, partner]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, submitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Company name is required.");
      return;
    }

    const body: CreateAdminPartnerBody = {
      name: name.trim(),
      screenText: screenText.trim() || undefined,
      website: website.trim() || undefined,
    };

    setSubmitting(true);
    setError(null);
    try {
      if (isEdit && partner) {
        await updateAdminPartner(partner.id, body);
      } else {
        await createAdminPartner(body);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save partner.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 overflow-y-auto transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <button
          type="button"
          className="fixed inset-0 bg-primary/50 backdrop-blur-sm"
          aria-label="Close"
          onClick={() => !submitting && onClose()}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="partner-modal-title"
          className={cn(
            "relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl transition-transform duration-300",
            open ? "scale-100" : "scale-95",
          )}
        >
          <div className="shrink-0 border-b border-outline-variant/40 px-6 py-5">
            <h2 id="partner-modal-title" className="text-headline-md text-on-surface">
              {isEdit ? "Update Partner" : "Onboard New Partner"}
            </h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              {isEdit
                ? "Update the partner details shown on the platform."
                : "Add a partner organization to display on the platform."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {error && (
                <p className="rounded-lg border border-error/30 bg-error-container px-4 py-3 text-label-sm text-on-error-container">
                  {error}
                </p>
              )}

              <div className="space-y-2">
                <label className="font-label-bold text-on-surface-variant" htmlFor="partner-name">
                  Company name
                </label>
                <input
                  id="partner-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dialog Axiata"
                  required
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className="font-label-bold text-on-surface-variant" htmlFor="partner-screen-text">
                  Screen text
                </label>
                <input
                  id="partner-screen-text"
                  type="text"
                  value={screenText}
                  onChange={(e) => setScreenText(e.target.value)}
                  placeholder="e.g. DIALOG"
                  className={inputClass}
                />
                <p className="text-label-sm text-on-surface-variant">
                  Short label shown on screen (homepage marquee). Leave blank to use the company name.
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-label-bold text-on-surface-variant" htmlFor="partner-website">
                  Company website
                </label>
                <input
                  id="partner-website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.example.com"
                  className={inputClass}
                />
                <p className="text-label-sm text-on-surface-variant">Optional link to the partner&apos;s website.</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-outline-variant/40 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-label-sm font-bold text-on-surface-variant hover:text-primary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-5 py-2.5 text-label-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Saving…" : isEdit ? "Save changes" : "Onboard partner"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
