import type { Company } from "@/lib/api/types";

function normalizeAddressSegment(segment: string) {
  return segment
    .toLowerCase()
    .replace(/\.+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Join address fields without repeating city, street, or location segments. */
export function formatCompanyHeadquarters(company: Pick<Company, "address" | "location" | "city">) {
  const raw = [company.address, company.location, company.city]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(", ");

  if (!raw.trim()) return "—";

  const segments: string[] = [];
  const seen = new Set<string>();

  for (const segment of raw.split(",").map((part) => part.trim()).filter(Boolean)) {
    const key = normalizeAddressSegment(segment);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    segments.push(segment);
  }

  return segments.join(", ");
}
