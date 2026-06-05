export type PlatformAdsSlotConfig = {
  wide: { active: boolean; pricePerDay: string; maxConcurrency: number };
  tall: { active: boolean; pricePerDay: string; maxConcurrency: number };
  sponsored: { weightPercent: number; aiPriority: boolean };
};

const STORAGE_KEY = "jobsfinder.platform-ads.config";

export const DEFAULT_PLATFORM_ADS_CONFIG: PlatformAdsSlotConfig = {
  wide: { active: true, pricePerDay: "45.00", maxConcurrency: 12 },
  tall: { active: true, pricePerDay: "120.00", maxConcurrency: 5 },
  sponsored: { weightPercent: 85, aiPriority: true },
};

export function loadPlatformAdsConfig(): PlatformAdsSlotConfig {
  if (typeof window === "undefined") return DEFAULT_PLATFORM_ADS_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLATFORM_ADS_CONFIG;
    return { ...DEFAULT_PLATFORM_ADS_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PLATFORM_ADS_CONFIG;
  }
}

export function savePlatformAdsConfig(config: PlatformAdsSlotConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export type CampaignAdType = "Banner 3x2" | "Banner 2x5" | "Sponsored";

export type CampaignStatus = "Active" | "Scheduled" | "Pending Review" | "Inactive";

export type PlatformCampaignRow = {
  id: string;
  advertiser: string;
  sublabel: string;
  initials: string;
  adType: CampaignAdType;
  status: CampaignStatus;
  timeline: string;
  promotionEndDate: string;
  views: number;
  ctr: string;
  editHref: string;
};
