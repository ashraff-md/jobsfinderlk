const LEGAL_SUFFIXES =
  /\b(pvt|ltd|limited|inc|corp|corporation|plc|llc|co|private|incorporated)\b/gi;

export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(LEGAL_SUFFIXES, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function phoneticKey(name: string): string {
  return normalizeCompanyName(name).replace(/[aeiouy\s]/g, '');
}

export function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
}

export function similarityScore(a: string, b: string): number {
  const left = normalizeCompanyName(a);
  const right = normalizeCompanyName(b);
  if (!left || !right) return 0;
  if (left === right) return 1;

  if (left.includes(right) || right.includes(left)) {
    const shorter = Math.min(left.length, right.length);
    const longer = Math.max(left.length, right.length);
    return 0.85 + (shorter / longer) * 0.14;
  }

  const maxLen = Math.max(left.length, right.length);
  const distance = levenshtein(left, right);
  let score = 1 - distance / maxLen;

  if (phoneticKey(a) === phoneticKey(b)) {
    score = Math.max(score, 0.82);
  }

  return Math.max(0, Math.min(1, score));
}

export function extractDomain(value?: string | null): string | null {
  if (!value?.trim()) return null;
  const raw = value.trim().toLowerCase();

  try {
    const url = raw.includes('://') ? new URL(raw) : new URL(`https://${raw}`);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return raw.replace(/^www\./, '').split('/')[0] || null;
  }
}

export type MatchReason = 'exact' | 'fuzzy' | 'phonetic' | 'domain';

export function matchReason(query: string, candidate: string): MatchReason {
  const left = normalizeCompanyName(query);
  const right = normalizeCompanyName(candidate);
  if (left === right) return 'exact';
  if (phoneticKey(query) === phoneticKey(candidate)) return 'phonetic';
  return 'fuzzy';
}
