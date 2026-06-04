import { getPlatformBanners, type PlatformBannerSlide } from "@/lib/api/platform-ads";
import {
  HOME_BANNER_AD,
  HOME_BANNER_AD_SECOND,
  HOME_BANNER_ADS_WIDE,
  type HomeBannerCard,
  type HomeBannerSlide,
} from "@/lib/home/home-banner-ads";

export const BANNER_SLOT_KEYS = {
  widePrimary: "HOME_WIDE_PRIMARY",
  wideSecondary: "HOME_WIDE_SECONDARY",
  tallPrimary: "SHARED_TALL_PRIMARY",
  tallSecondary: "JOB_DETAIL_TALL_SECONDARY",
} as const;

function padSlidesToThree(
  slides: PlatformBannerSlide[],
): [HomeBannerSlide, HomeBannerSlide, HomeBannerSlide] {
  if (slides.length >= 3) {
    return [slides[0], slides[1], slides[2]];
  }
  const padded: HomeBannerSlide[] = [...slides];
  while (padded.length < 3) {
    const last = padded[padded.length - 1] ?? slides[0];
    if (!last) break;
    padded.push(last);
  }
  if (padded.length < 3) {
    return HOME_BANNER_AD.slides;
  }
  return [padded[0], padded[1], padded[2]];
}

function slotToCard(
  slotsByKey: Record<string, { slides: PlatformBannerSlide[] } | undefined>,
  key: string,
  fallback: HomeBannerCard,
): HomeBannerCard {
  const slot = slotsByKey[key];
  if (!slot?.slides.length) return fallback;
  return { slides: padSlidesToThree(slot.slides) };
}

export async function loadBannerCards(options: {
  variant: "wide" | "tall";
  columns?: 1 | 2;
}): Promise<readonly HomeBannerCard[]> {
  const aspectRatio = options.variant === "wide" ? "RATIO_3_2" : "RATIO_2_5";
  try {
    const slots = await getPlatformBanners(aspectRatio);
    const byKey = Object.fromEntries(slots.map((s) => [s.key, s]));

    if (options.variant === "wide" && options.columns === 2) {
      return [
        slotToCard(byKey, BANNER_SLOT_KEYS.widePrimary, HOME_BANNER_AD),
        slotToCard(byKey, BANNER_SLOT_KEYS.wideSecondary, HOME_BANNER_AD_SECOND),
      ];
    }

    if (options.variant === "tall") {
      return [
        slotToCard(byKey, BANNER_SLOT_KEYS.tallPrimary, HOME_BANNER_AD),
        slotToCard(byKey, BANNER_SLOT_KEYS.tallSecondary, HOME_BANNER_AD_SECOND),
      ];
    }

    const primary = slotToCard(byKey, BANNER_SLOT_KEYS.widePrimary, HOME_BANNER_AD);
    return [primary];
  } catch {
    if (options.variant === "wide" && options.columns === 2) {
      return HOME_BANNER_ADS_WIDE;
    }
    if (options.variant === "tall") {
      return [HOME_BANNER_AD, HOME_BANNER_AD_SECOND];
    }
    return [HOME_BANNER_AD];
  }
}
