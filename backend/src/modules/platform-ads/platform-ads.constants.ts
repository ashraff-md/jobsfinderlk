/** Each slot exposes three rotating banner creatives. */
export const BANNER_SLIDES_PER_SLOT = 3;

/** Seconds each slide is shown before advancing (equal exposure per slide). */
export const BANNER_SLIDE_ROTATION_SECONDS = 6;

export const BANNER_SLIDE_ROTATION_MS = BANNER_SLIDE_ROTATION_SECONDS * 1000;

/** Default sponsored jobs shown per page load. */
export const SPONSORED_JOBS_BATCH_SIZE = 3;

/** When no offset is sent, advance batch every minute (fair rotation without client state). */
export const SPONSORED_BATCH_PERIOD_MS = 60_000;

/** Safety cap when building the sponsored rotation pool. */
export const SPONSORED_POOL_MAX = 500;
