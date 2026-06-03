const MAX_LIFE_AT_IMAGES = 6;
const MAX_IMAGE_DATA_LENGTH = 900_000;

const IMAGE_DATA_PATTERN = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i;

export function sanitizeLifeAtCompanyImages(
  images?: string[] | null,
): string[] {
  if (!images?.length) return [];

  const sanitized = images
    .map((item) => item.trim())
    .filter(
      (item) =>
        IMAGE_DATA_PATTERN.test(item) && item.length <= MAX_IMAGE_DATA_LENGTH,
    )
    .slice(0, MAX_LIFE_AT_IMAGES);

  return sanitized;
}

export function sanitizeLogoDataUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const item = url.trim();
  if (IMAGE_DATA_PATTERN.test(item) && item.length <= MAX_IMAGE_DATA_LENGTH) {
    return item;
  }
  return null;
}
