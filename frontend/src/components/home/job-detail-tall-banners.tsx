"use client";

import { useEffect, useState } from "react";
import { HomeBannerCardCarousel } from "@/components/home/home-banner-card-carousel";
import { HOME_BANNER_AD, HOME_BANNER_AD_SECOND, type HomeBannerCard } from "@/lib/home/home-banner-ads";
import { loadBannerCards } from "@/lib/platform-ads/load-banners";

export function JobDetailTallBanners() {
  const [cards, setCards] = useState<readonly [HomeBannerCard, HomeBannerCard]>([
    HOME_BANNER_AD,
    HOME_BANNER_AD_SECOND,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadBannerCards({ variant: "tall" });
      if (!cancelled && loaded.length >= 2) {
        setCards([loaded[0], loaded[1]]);
      } else if (!cancelled && loaded.length === 1) {
        setCards([loaded[0], loaded[0]]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <HomeBannerCardCarousel card={cards[0]} aspectClassName="aspect-[2/5]" />
      <HomeBannerCardCarousel card={cards[1]} aspectClassName="aspect-[2/5]" />
    </>
  );
}
