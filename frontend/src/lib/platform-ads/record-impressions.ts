import { API_URL } from "@/lib/api/client";

async function postEngagement(path: string, body: Record<string, string[]>) {
  try {
    await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    /* best-effort analytics */
  }
}

export function recordBannerImpressions(campaignIds: string[]) {
  const ids = campaignIds.filter(Boolean);
  if (!ids.length) return;
  void postEngagement("/platform-ads/banners/impressions", { campaignIds: ids });
}

export function recordSponsoredImpressions(sponsoredAdIds: string[]) {
  const ids = sponsoredAdIds.filter(Boolean);
  if (!ids.length) return;
  void postEngagement("/platform-ads/sponsored/impressions", { sponsoredAdIds: ids });
}

export function recordBannerClicks(campaignIds: string[]) {
  const ids = campaignIds.filter(Boolean);
  if (!ids.length) return;
  void postEngagement("/platform-ads/banners/clicks", { campaignIds: ids });
}

export function recordSponsoredClicks(sponsoredAdIds: string[]) {
  const ids = sponsoredAdIds.filter(Boolean);
  if (!ids.length) return;
  void postEngagement("/platform-ads/sponsored/clicks", { sponsoredAdIds: ids });
}
