export type HomeBannerSlide = {
  href: string;
  imageUrl: string;
  alt: string;
};

export type HomeBannerCard = {
  slides: readonly HomeBannerSlide[];
};

export {
  BANNER_SLIDE_INTERVAL_MS as HOME_BANNER_SLIDE_INTERVAL_MS,
  BANNER_SLIDES_PER_POSITION,
} from "@/lib/platform-ads/banner-rotation";
