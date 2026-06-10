/** Every recruiter gets one free active job listing slot. */
export const FREE_JOB_LISTING_SLOTS = 1;

/** Job listing packages and slot allowances (matches pricing page). */
export const JOB_LISTING_SLOT_PACKAGES: Record<string, number> = {
  'Professional Duo': 2,
  'Growth Suite': 5,
  'Expansion Plan': 10,
  Institutional: 20,
};

export function jobSlotsForPlan(plan: string): number {
  const normalized = plan.trim();
  for (const [name, slots] of Object.entries(JOB_LISTING_SLOT_PACKAGES)) {
    if (normalized === name || normalized.startsWith(`${name} `)) {
      return slots;
    }
  }
  const match = normalized.match(/(\d+)\s*active job slots?/i);
  return match ? Number(match[1]) : 0;
}
