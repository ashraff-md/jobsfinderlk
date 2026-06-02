export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function uniqueSlug(base: string, suffix?: string): string {
  const slug = slugify(base);
  return suffix ? `${slug}-${suffix.slice(0, 8)}` : slug;
}

const SCAM_PATTERNS = [
  /pay\s*(to\s*)?apply/i,
  /registration\s*fee/i,
  /send\s*money/i,
  /wire\s*transfer/i,
  /processing\s*fee/i,
];

export function detectScamContent(text: string): boolean {
  return SCAM_PATTERNS.some((pattern) => pattern.test(text));
}
