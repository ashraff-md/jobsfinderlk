"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import {
  createAdminJobCategory,
  updateAdminJobCategory,
  type CreateAdminJobCategoryBody,
} from "@/lib/api/admin";
import type { AdminJobCategory } from "@/lib/api/types";
import { JOB_CATEGORY_ICON_OPTIONS } from "@/lib/jobs/job-category-icons";
import { cn } from "@/lib/utils";

type JobCategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  category?: AdminJobCategory | null;
};

const inputClass =
  "w-full rounded-lg border border-outline-variant px-4 py-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

export function JobCategoryFormModal({
  open,
  onClose,
  onSaved,
  category,
}: JobCategoryFormModalProps) {
  const isEdit = Boolean(category);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string>(JOB_CATEGORY_ICON_OPTIONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
    setIcon(category?.icon ?? JOB_CATEGORY_ICON_OPTIONS[0]);
    setError(null);
  }, [open, category]);

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
      setError("Category name is required.");
      return;
    }

    const body: CreateAdminJobCategoryBody = {
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
    };

    setSubmitting(true);
    setError(null);
    try {
      if (isEdit && category) {
        await updateAdminJobCategory(category.id, body);
      } else {
        await createAdminJobCategory(body);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save category.");
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
          aria-labelledby="job-category-modal-title"
          className={cn(
            "relative flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl transition-transform duration-300",
            open ? "scale-100" : "scale-95",
          )}
        >
          <div className="shrink-0 border-b border-outline-variant/40 px-6 py-5">
            <h2 id="job-category-modal-title" className="text-headline-md text-on-surface">
              {isEdit ? "Edit Job Category" : "Create New Category"}
            </h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              {isEdit
                ? "Update how this category appears across job listings and search filters."
                : "Define a new classification for job listings on the platform."}
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
            <label className="font-label-bold text-on-surface-variant" htmlFor="category-name">
              Category name
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Software Development"
              required
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className="font-label-bold text-on-surface-variant" htmlFor="category-description">
              Description
            </label>
            <textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the roles included in this category…"
              rows={3}
              className={cn(inputClass, "resize-y")}
            />
          </div>

          <div className="space-y-3">
            <span className="font-label-bold text-on-surface-variant">Category icon</span>
            <div className="flex flex-wrap gap-2">
              {JOB_CATEGORY_ICON_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setIcon(option)}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-lg border transition-all",
                    icon === option
                      ? "border-primary text-primary ring-2 ring-primary/20"
                      : "border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary",
                  )}
                  aria-label={option}
                  title={option}
                >
                  <Icon name={option} className="text-xl" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-outline-variant/50 bg-surface-container-low p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Preview
            </p>
            <div className="flex items-start gap-3">
              <Icon name={icon} className="mt-0.5 shrink-0 text-2xl text-primary" />
              <div>
                <p className="font-label-bold text-on-surface">{name.trim() || "Category name"}</p>
                <p className="text-label-sm text-on-surface-variant">
                  {description.trim() || "Category description will appear here."}
                </p>
              </div>
            </div>
          </div>

            </div>

            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-outline-variant/40 bg-surface-container-lowest px-6 py-4">
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
                {submitting ? "Saving…" : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
