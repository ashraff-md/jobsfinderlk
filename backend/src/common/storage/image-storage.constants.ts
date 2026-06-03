export const IMAGE_UPLOAD_FOLDERS = {
  companyLogos: 'company-logos',
  lifeAtCompany: 'life-at-company',
} as const;

export type ImageUploadFolder =
  (typeof IMAGE_UPLOAD_FOLDERS)[keyof typeof IMAGE_UPLOAD_FOLDERS];

export const MAX_LIFE_AT_IMAGES = 5;
export const MAX_IMAGE_DATA_LENGTH = 900_000;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export const IMAGE_DATA_PATTERN = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i;

export const MIME_TO_EXT: Record<string, string> = {
  jpeg: 'jpg',
  jpg: 'jpg',
  png: 'png',
  webp: 'webp',
  gif: 'gif',
};
