import {
  BANNER_IMAGE_LIMITS,
  DEFAULT_IMAGE_LIMITS,
  IMAGE_DATA_PATTERN,
  MIME_TO_EXT,
  type ImageDataLimits,
} from './image-storage.constants';

export function isImageDataUrl(
  value: string,
  limits: ImageDataLimits = DEFAULT_IMAGE_LIMITS,
): boolean {
  return (
    IMAGE_DATA_PATTERN.test(value.trim()) &&
    value.length <= limits.maxDataLength
  );
}

export function parseImageDataUrl(
  dataUrl: string,
  limits: ImageDataLimits = DEFAULT_IMAGE_LIMITS,
): { buffer: Buffer; ext: string } | null {
  const trimmed = dataUrl.trim();
  const match = trimmed.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,(.+)$/i);
  if (!match) return null;

  const mime = match[1].toLowerCase();
  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0 || buffer.length > limits.maxBytes) return null;

  const ext = MIME_TO_EXT[mime];
  if (!ext) return null;

  return { buffer, ext };
}

export { BANNER_IMAGE_LIMITS, DEFAULT_IMAGE_LIMITS };
