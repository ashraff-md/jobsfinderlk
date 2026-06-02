"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

type JobArtworkBannerProps = {
  artworkUrl: string;
  title: string;
  companyName: string;
  showOverlay: boolean;
};

export function JobArtworkBanner({
  artworkUrl,
  title,
  companyName,
  showOverlay,
}: JobArtworkBannerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative block w-full overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
        aria-label={`View full artwork for ${title}`}
      >
        <div className="relative h-44 w-full bg-surface-container-low sm:h-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${title} artwork`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            src={artworkUrl}
          />
          {showOverlay && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 via-navy-deep/15 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3 sm:p-4">
                <p className="text-xs font-label-bold text-white sm:text-sm">{companyName}</p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-white/85 sm:text-xs">{title}</p>
              </div>
            </>
          )}
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-label-bold uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Icon name="zoom_out_map" className="text-[14px]" />
            View full
          </div>
        </div>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} artwork`}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close artwork"
          >
            <Icon name="close" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${title} artwork`}
            className="max-h-[90vh] max-w-full object-contain"
            src={artworkUrl}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
