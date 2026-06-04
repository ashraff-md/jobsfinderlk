import { HomeBannerAdsGrid } from "@/components/home/home-banner-ads-grid";

export function HomeBannerAdsSection() {
  return (
    <section className="w-full bg-surface-container-low px-margin-mobile pb-8 pt-24 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <HomeBannerAdsGrid columns={2} />
      </div>
    </section>
  );
}
