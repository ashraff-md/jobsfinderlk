export function normalizeBannerDestinationUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "/jobs";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(trimmed)) {
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }

  const path = trimmed.replace(/^\//, "");
  return `/${path}`;
}

export function formatBannerDestinationForInput(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) return "";
  return trimmed;
}

export function isExternalBannerUrl(href: string): boolean {
  return /^https?:\/\//i.test(href.trim());
}
