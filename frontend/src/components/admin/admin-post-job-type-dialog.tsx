"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type AdminPostJobTypeDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminPostJobTypeDialog({ open, onClose }: AdminPostJobTypeDialogProps) {
  const router = useRouter();

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

  const choose = (href: string) => {
    onClose();
    router.push(href);
  };

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
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-job-type-title"
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl transition-transform duration-300",
          open ? "scale-100" : "scale-95",
        )}
      >
        <div className="border-b border-outline-variant bg-primary-container px-6 py-4 text-on-primary">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="post-job-type-title" className="text-headline-md font-bold">
                Post New Job
              </h2>
              <p className="mt-1 text-label-sm text-on-primary-container">
                Is this a government sector vacancy or a regular listing?
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
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => choose("/admin/jobs/new")}
            className="group flex flex-col items-start rounded-xl border border-outline-variant bg-surface-container-low p-5 text-left transition-all hover:border-secondary hover:shadow-md"
          >
            <Icon
              name="work"
              className="mb-3 rounded-lg bg-secondary-container/20 p-2 text-secondary"
            />
            <span className="font-label-bold text-on-surface">Regular listing</span>
            <span className="mt-1 text-label-sm text-on-surface-variant">
              Private sector, corporate, or agency vacancy
            </span>
          </button>
          <button
            type="button"
            onClick={() => choose("/admin/jobs/government/new")}
            className="group flex flex-col items-start rounded-xl border border-outline-variant bg-surface-container-low p-5 text-left transition-all hover:border-secondary hover:shadow-md"
          >
            <Icon
              name="account_balance"
              className="mb-3 rounded-lg bg-primary-fixed/20 p-2 text-on-primary-fixed-variant"
            />
            <span className="font-label-bold text-on-surface">Government posting</span>
            <span className="mt-1 text-label-sm text-on-surface-variant">
              Official civil service vacancy with gazette details
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
