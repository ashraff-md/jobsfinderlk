import {
  BANNER_IMAGE_LIMITS,
  type ImageDataLimits,
} from './image-storage.constants';
import { isImageDataUrl, parseImageDataUrl } from './image-data.util';

export const VACANCY_ARTWORK_LIMITS: ImageDataLimits = BANNER_IMAGE_LIMITS;

const PDF_DATA_PATTERN = /^data:application\/pdf;base64,/i;

export function isVacancyArtworkDataUrl(
  value: string,
  limits: ImageDataLimits = VACANCY_ARTWORK_LIMITS,
): boolean {
  const trimmed = value.trim();
  return isImageDataUrl(trimmed, limits) || PDF_DATA_PATTERN.test(trimmed);
}

export function parseVacancyArtworkDataUrl(
  dataUrl: string,
  limits: ImageDataLimits = VACANCY_ARTWORK_LIMITS,
): { buffer: Buffer; ext: string } | null {
  const image = parseImageDataUrl(dataUrl, limits);
  if (image) return image;

  const trimmed = dataUrl.trim();
  const match = trimmed.match(/^data:application\/pdf;base64,(.+)$/i);
  if (!match) return null;

  const buffer = Buffer.from(match[1], 'base64');
  if (buffer.length === 0 || buffer.length > limits.maxBytes) return null;

  return { buffer, ext: 'pdf' };
}
