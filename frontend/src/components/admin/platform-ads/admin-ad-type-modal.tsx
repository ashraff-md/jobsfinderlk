"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type AdminAdTypeModalProps = {
  open: boolean;
  onClose: () => void;
};

const AD_TYPES = [
  {
    type: "wide",
    href: "/admin/platform-ads/new?type=wide",
    icon: "dashboard_customize",
    label: "Banner 3x2",
    sub: "Recommended",
  },
  {
    type: "tall",
    href: "/admin/platform-ads/new?type=tall",
    icon: "view_column",
    label: "Banner 2x5",
    sub: "Side rail",
  },
  {
    type: "sponsored",
    href: "/admin/platform-ads/new?type=sponsored",
    icon: "list_alt",
    label: "Sponsored List",
    sub: "In-Feed",
  },
] as const;

export function AdminAdTypeModal({ open, onClose }: AdminAdTypeModalProps) {
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
        aria-labelledby="ad-type-modal-title"
        className={cn(
          "relative w-full max-w-2xl overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl transition-transform duration-300",
          open ? "scale-100" : "scale-95",
        )}
      >
        <div className="border-b border-outline-variant bg-primary-container px-6 py-4 text-on-primary">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="ad-type-modal-title" className="text-headline-md font-bold">
                Ad Configuration
              </h2>
              <p className="mt-1 text-label-sm text-on-primary-container">
                Choose the format for your new campaign.
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

        <div className="grid gap-4 p-6 sm:grid-cols-3">
          {AD_TYPES.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => choose(item.href)}
              className="group relative flex flex-col items-center rounded-xl border border-outline-variant p-4 text-center transition-all hover:border-secondary hover:bg-secondary/5 hover:shadow-md"
            >
              <div className="mb-3 flex h-24 w-full items-center justify-center rounded-lg bg-surface-container">
                <Icon name={item.icon} className="text-4xl text-outline group-hover:text-secondary" />
              </div>
              <p className="font-label-bold text-on-surface">{item.label}</p>
              <p className="mt-1 text-[10px] uppercase text-on-surface-variant">{item.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
