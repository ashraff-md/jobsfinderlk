"use client";

import { useEffect, useState } from "react";
import { HomeBannerCardCarousel } from "@/components/home/home-banner-card-carousel";
import type { HomeBannerCard } from "@/lib/home/home-banner-ads";
import { loadBannerCards } from "@/lib/platform-ads/load-banners";

export function JobDetailTallBanners() {
  const [cards, setCards] = useState<readonly HomeBannerCard[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await loadBannerCards({ variant: "tall" });
        if (!cancelled) setCards(loaded);
      } catch {
        if (!cancelled) setCards([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (cards.length === 0) return null;

  return (
    <>
      {cards.map((card, index) => (
        <HomeBannerCardCarousel
          key={index}
          card={card}
          aspectClassName="aspect-[2/5]"
        />
      ))}
    </>
  );
}
