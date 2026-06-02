export function formatJobAgeRange(ageMin?: number | null, ageMax?: number | null): string | null {
  if (ageMin == null && ageMax == null) return null;
  if (ageMin != null && ageMax != null) return `${ageMin}–${ageMax} years`;
  if (ageMin != null) return `${ageMin}+ years`;
  return `Up to ${ageMax} years`;
}
