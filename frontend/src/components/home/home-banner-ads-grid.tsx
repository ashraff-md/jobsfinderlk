"use client";

import { useEffect, useState } from "react";
import { HomeBannerCardCarousel } from "@/components/home/home-banner-card-carousel";
import type { HomeBannerCard } from "@/lib/home/home-banner-ads";
import { loadBannerCards } from "@/lib/platform-ads/load-banners";
import { cn } from "@/lib/utils";

type HomeBannerAdsGridProps = {
  className?: string;
  /** Wide 3:2 (home, job detail footer) or tall 2:5 (job detail sidebar) */
  variant?: "wide" | "tall";
  /** One or two side-by-side cards (wide layout only) */
  columns?: 1 | 2;
  /** Optional preloaded cards (skips fetch) */
  cards?: readonly HomeBannerCard[];
};

const ASPECT_BY_VARIANT = {
  wide: "aspect-[3/2]",
  tall: "aspect-[2/5]",
} as const;

export function HomeBannerAdsGrid({
  className,
  variant = "wide",
  columns = 1,
  cards: cardsProp,
}: HomeBannerAdsGridProps) {
  const aspectClassName = ASPECT_BY_VARIANT[variant];
  const [cards, setCards] = useState<readonly HomeBannerCard[]>(
    () => cardsProp ?? [],
  );

  useEffect(() => {
    if (cardsProp) {
      setCards(cardsProp);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const loaded = await loadBannerCards({ variant, columns });
        if (!cancelled) setCards(loaded);
      } catch {
        if (!cancelled) setCards([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [variant, columns, cardsProp]);

  if (cards.length === 0) return null;

  return (
    <div
      className={cn(
        columns === 2 && variant === "wide" && "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6",
        className,
      )}
    >
      {cards.map((card, cardIndex) => (
        <HomeBannerCardCarousel
          key={cardIndex}
          card={card}
          aspectClassName={aspectClassName}
        />
      ))}
    </div>
  );
}
