const SPONSORED_BATCH_OFFSET_KEY = "jobsfinder.sponsored.batchOffset";

/** How many sponsored jobs appear per placement (jobs search carousel: 2 × 3 slides). */
export const SPONSORED_JOBS_BATCH_SIZE = 6;

export function readSponsoredBatchOffset(): number {
  if (typeof window === "undefined") return 0;
  const raw = sessionStorage.getItem(SPONSORED_BATCH_OFFSET_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/** Advance stored offset after a successful fetch so the next visit shows the next batch. */
export function advanceSponsoredBatchOffset(totalActive: number, batchSize: number) {
  if (typeof window === "undefined" || totalActive <= batchSize) return;
  const current = readSponsoredBatchOffset();
  const next = (current + batchSize) % totalActive;
  sessionStorage.setItem(SPONSORED_BATCH_OFFSET_KEY, String(next));
}
