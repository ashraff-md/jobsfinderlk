"use client";

import { useEffect, useRef, useState } from "react";
import {
  BANNER_SLIDE_INTERVAL_MS,
  BANNER_SLIDES_PER_POSITION,
} from "@/lib/platform-ads/banner-rotation";
import type { HomeBannerCard } from "@/lib/home/home-banner-ads";
import {
  recordBannerClicks,
  recordBannerImpressions,
} from "@/lib/platform-ads/record-impressions";
import { cn } from "@/lib/utils";

type HomeBannerCardCarouselProps = {
  card: HomeBannerCard;
  aspectClassName?: string;
};

export function HomeBannerCardCarousel({
  card,
  aspectClassName = "aspect-[3/2]",
}: HomeBannerCardCarouselProps) {
  const slides = card.slides.slice(0, BANNER_SLIDES_PER_POSITION);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIndex(0);
  }, [slides[0]?.imageUrl, slides[1]?.imageUrl, slides[2]?.imageUrl]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.5));
      },
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const activeSlide = slides[index];
    if (!activeSlide?.campaignId) return;
    recordBannerImpressions([activeSlide.campaignId]);
  }, [index, isVisible, slides]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, BANNER_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  const active = slides[index] ?? slides[0];

  const linkClassName = cn(
    "group relative block w-full overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm transition-all hover:border-secondary/50 hover:shadow-md",
    aspectClassName,
  );
  const handleBannerClick = () => {
    if (active.campaignId) recordBannerClicks([active.campaignId]);
  };

  const linkHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
    onClick: handleBannerClick,
  };

  const slideContent = (
    <>
      <span className="sr-only" aria-live="polite">
        {active.alt}
      </span>
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
    </>
  );

  return (
    <div ref={containerRef}>
      <a
        href={active.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={active.alt}
        className={linkClassName}
        {...linkHandlers}
      >
        {slideContent}
      </a>
    </div>
  );
}
