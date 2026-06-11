import { getPlatformBanners, type PlatformBannerSlide } from "@/lib/api/platform-ads";
import { BANNER_SLIDES_PER_POSITION } from "@/lib/platform-ads/banner-rotation";
import type { HomeBannerCard, HomeBannerSlide } from "@/lib/home/home-banner-ads";

export const BANNER_SLOT_KEYS = {
  widePrimary: "HOME_WIDE_PRIMARY",
  wideSecondary: "HOME_WIDE_SECONDARY",
  tallPrimary: "SHARED_TALL_PRIMARY",
  tallSecondary: "JOB_DETAIL_TALL_SECONDARY",
} as const;

function validSlides(slides: PlatformBannerSlide[]): HomeBannerSlide[] {
  return slides.filter(
    (slide): slide is HomeBannerSlide =>
      Boolean(slide.imageUrl && slide.href),
  );
}

function padSlidesToCarousel(slides: HomeBannerSlide[]): HomeBannerSlide[] {
  if (slides.length === 0) return [];
  if (slides.length >= BANNER_SLIDES_PER_POSITION) {
    return slides.slice(0, BANNER_SLIDES_PER_POSITION);
  }
  const padded: HomeBannerSlide[] = [...slides];
  while (padded.length < BANNER_SLIDES_PER_POSITION) {
    padded.push(slides[padded.length % slides.length]);
  }
  return padded;
}

function slotToCard(
  slotsByKey: Record<string, { slides: PlatformBannerSlide[] } | undefined>,
  key: string,
): HomeBannerCard | null {
  const slot = slotsByKey[key];
  if (!slot?.slides.length) return null;
  const slides = padSlidesToCarousel(validSlides(slot.slides));
  if (slides.length === 0) return null;
  return { slides };
}

function slotKeysForOptions(options: {
  variant: "wide" | "tall";
  columns?: 1 | 2;
}): string[] {
  if (options.variant === "wide" && options.columns === 2) {
    return [BANNER_SLOT_KEYS.widePrimary, BANNER_SLOT_KEYS.wideSecondary];
  }
  if (options.variant === "tall") {
    if (options.columns === 2) {
      return [BANNER_SLOT_KEYS.tallPrimary, BANNER_SLOT_KEYS.tallSecondary];
    }
    return [BANNER_SLOT_KEYS.tallPrimary];
  }
  return [BANNER_SLOT_KEYS.widePrimary];
}

export async function loadBannerCards(options: {
  variant: "wide" | "tall";
  columns?: 1 | 2;
}): Promise<readonly HomeBannerCard[]> {
  const aspectRatio = options.variant === "wide" ? "RATIO_3_2" : "RATIO_2_5";
  const { slots } = await getPlatformBanners(aspectRatio);
  const byKey = Object.fromEntries(slots.map((s) => [s.key, s]));

  const cards: HomeBannerCard[] = [];
  for (const key of slotKeysForOptions(options)) {
    const card = slotToCard(byKey, key);
    if (card) cards.push(card);
  }
  return cards;
}
