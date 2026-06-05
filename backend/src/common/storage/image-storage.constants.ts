export const IMAGE_UPLOAD_FOLDERS = {
  companyLogos: 'company-logos',
  lifeAtCompany: 'life-at-company',
  platformBanners: 'platform-banners',
  recruiterPhotos: 'recruiter-photos',
} as const;

export type ImageUploadFolder =
  (typeof IMAGE_UPLOAD_FOLDERS)[keyof typeof IMAGE_UPLOAD_FOLDERS];

export const MAX_LIFE_AT_IMAGES = 5;
export const MAX_IMAGE_DATA_LENGTH = 900_000;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_BANNER_IMAGE_BYTES = 5 * 1024 * 1024;
/** Base64 expands payload by ~4/3; leave headroom for JSON wrapping. */
export const MAX_BANNER_IMAGE_DATA_LENGTH = 7_500_000;

export type ImageDataLimits = {
  maxDataLength: number;
  maxBytes: number;
};

export const DEFAULT_IMAGE_LIMITS: ImageDataLimits = {
  maxDataLength: MAX_IMAGE_DATA_LENGTH,
  maxBytes: MAX_IMAGE_BYTES,
};

export const BANNER_IMAGE_LIMITS: ImageDataLimits = {
  maxDataLength: MAX_BANNER_IMAGE_DATA_LENGTH,
  maxBytes: MAX_BANNER_IMAGE_BYTES,
};

export const IMAGE_DATA_PATTERN = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i;

export const MIME_TO_EXT: Record<string, string> = {
  jpeg: 'jpg',
  jpg: 'jpg',
  png: 'png',
  webp: 'webp',
  gif: 'gif',
};
