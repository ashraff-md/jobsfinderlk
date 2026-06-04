"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HOME_BANNER_SLIDE_INTERVAL_MS,
  type HomeBannerCard,
} from "@/lib/home/home-banner-ads";
import { cn } from "@/lib/utils";

type HomeBannerCardCarouselProps = {
  card: HomeBannerCard;
  aspectClassName?: string;
};

export function HomeBannerCardCarousel({
  card,
  aspectClassName = "aspect-[3/2]",
}: HomeBannerCardCarouselProps) {
  const { slides } = card;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, HOME_BANNER_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const active = slides[index];

  return (
    <Link
      href={active.href}
      className={cn(
        "group relative block w-full overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm transition-all hover:border-secondary/50 hover:shadow-md",
        aspectClassName,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${slide.imageUrl}-${i}`}
          alt={slide.alt}
          src={slide.imageUrl}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
            i === index
              ? "opacity-100 transition-transform duration-500 group-hover:scale-[1.03]"
              : "opacity-0",
          )}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/55 via-navy-deep/10 to-transparent" />
      <div
        className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5"
        aria-hidden
      >
        {slides.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-5 bg-white" : "w-1.5 bg-white/45",
            )}
          />
        ))}
      </div>
      <span className="sr-only">{active.alt}</span>
    </Link>
  );
}
