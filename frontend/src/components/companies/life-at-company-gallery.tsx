"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type LifeAtCompanyGalleryProps = {
  images: string[];
  companyName: string;
};

function GalleryTile({
  image,
  alt,
  onClick,
  className,
  overlay,
}: {
  image: string;
  alt: string;
  onClick: () => void;
  className?: string;
  overlay?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative h-full min-h-0 w-full overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        src={image}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {overlay}
      {!overlay && (
        <span className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <Icon name="zoom_in" className="text-white" />
        </span>
      )}
    </button>
  );
}

export function LifeAtCompanyGallery({ images, companyName }: LifeAtCompanyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length,
    );
  }, [images.length]);
  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % images.length,
    );
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, close, showNext, showPrev]);

  if (images.length === 0) return null;

  const mainImage = images[0];
  const sideImages = images.slice(1, 4);
  const extraCount = Math.max(0, images.length - 4);

  return (
    <>
      {images.length === 1 ? (
        <GalleryTile
          image={mainImage}
          alt={`${companyName} gallery`}
          onClick={() => setActiveIndex(0)}
          className="aspect-[16/10] w-full md:aspect-[21/9]"
        />
      ) : (
        <div className="grid h-auto grid-cols-1 gap-2 md:h-[420px] md:grid-cols-3 md:grid-rows-3">
          <GalleryTile
            image={mainImage}
            alt={`${companyName} gallery 1`}
            onClick={() => setActiveIndex(0)}
            className="aspect-[16/10] md:col-span-2 md:row-span-3 md:aspect-auto"
          />

          {sideImages.map((image, sideIndex) => {
            const imageIndex = sideIndex + 1;
            const isLastSide = sideIndex === sideImages.length - 1;
            const showMoreOverlay = isLastSide && extraCount > 0;

            return (
              <GalleryTile
                key={`${image}-${imageIndex}`}
                image={image}
                alt={`${companyName} gallery ${imageIndex + 1}`}
                onClick={() => setActiveIndex(showMoreOverlay ? 3 : imageIndex)}
                className="aspect-[4/3] md:aspect-auto"
                overlay={
                  showMoreOverlay ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 transition-colors group-hover:bg-black/65">
                      <span className="font-headline-md text-headline-md text-white">+{extraCount}</span>
                    </span>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      )}

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${companyName} photo gallery`}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close gallery"
          >
            <Icon name="close" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                aria-label="Previous photo"
              >
                <Icon name="chevron_left" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                aria-label="Next photo"
              >
                <Icon name="chevron_right" />
              </button>
            </>
          )}

          <div
            className="flex max-h-[85vh] max-w-5xl flex-col items-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${companyName} gallery ${activeIndex + 1}`}
              src={images[activeIndex]}
              className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
            />
            <p className="font-label-sm text-white/80">
              {activeIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
