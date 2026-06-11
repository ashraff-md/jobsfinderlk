export type ShareJobOptions = {
  title: string;
  url: string;
  text?: string;
};

export function resolveShareUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") return url;
  return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function shareContent(options: ShareJobOptions): Promise<"shared" | "copied"> {
  const shareUrl = resolveShareUrl(options.url);
  const payload = {
    title: options.title,
    text: options.text ?? options.title,
    url: shareUrl,
  };

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareUrl);
    return "copied";
  }

  throw new Error("Sharing is not supported in this browser.");
}

export function jobShareUrl(slug: string) {
  return resolveShareUrl(`/jobs/${slug}`);
}
