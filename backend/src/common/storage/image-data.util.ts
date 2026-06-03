import {
  IMAGE_DATA_PATTERN,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_DATA_LENGTH,
  MIME_TO_EXT,
} from './image-storage.constants';

export function isImageDataUrl(value: string): boolean {
  return IMAGE_DATA_PATTERN.test(value.trim()) && value.length <= MAX_IMAGE_DATA_LENGTH;
}

export function parseImageDataUrl(
  dataUrl: string,
): { buffer: Buffer; ext: string } | null {
  const trimmed = dataUrl.trim();
  const match = trimmed.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,(.+)$/i);
  if (!match) return null;

  const mime = match[1].toLowerCase();
  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) return null;

  const ext = MIME_TO_EXT[mime];
  if (!ext) return null;

  return { buffer, ext };
}
