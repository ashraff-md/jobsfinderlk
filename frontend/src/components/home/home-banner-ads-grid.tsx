"use client";

import { useEffect, useState } from "react";
import { HomeBannerCardCarousel } from "@/components/home/home-banner-card-carousel";
import {
  HOME_BANNER_AD,
  HOME_BANNER_ADS_WIDE,
  type HomeBannerCard,
} from "@/lib/home/home-banner-ads";
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

const STATIC_FALLBACK: Record<string, readonly HomeBannerCard[]> = {
  "wide-1": [HOME_BANNER_AD],
  "wide-2": HOME_BANNER_ADS_WIDE,
  "tall-1": [HOME_BANNER_AD],
};

function staticFallback(variant: "wide" | "tall", columns: 1 | 2) {
  const key = `${variant}-${columns}`;
  return STATIC_FALLBACK[key] ?? STATIC_FALLBACK["wide-1"];
}

export function HomeBannerAdsGrid({
  className,
  variant = "wide",
  columns = 1,
  cards: cardsProp,
}: HomeBannerAdsGridProps) {
  const aspectClassName = ASPECT_BY_VARIANT[variant];
  const [cards, setCards] = useState<readonly HomeBannerCard[]>(
    () => cardsProp ?? staticFallback(variant, columns),
  );

  useEffect(() => {
    if (cardsProp) {
      setCards(cardsProp);
      return;
    }
    let cancelled = false;
    (async () => {
      const loaded = await loadBannerCards({ variant, columns });
      if (!cancelled) setCards(loaded);
    })();
    return () => {
      cancelled = true;
    };
  }, [variant, columns, cardsProp]);

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
