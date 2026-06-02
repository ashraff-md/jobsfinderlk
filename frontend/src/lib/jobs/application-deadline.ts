export const MAX_APPLICATION_DEADLINE_DAYS = 60;

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function maxApplicationDeadlineDate(from = new Date()) {
  const max = startOfDay(from);
  max.setDate(max.getDate() + MAX_APPLICATION_DEADLINE_DAYS);
  return max;
}

export function daysFromToday(iso: string, from = new Date()) {
  const date = parseApplicationDeadline(iso);
  if (!date) return null;
  const diff = startOfDay(date).getTime() - startOfDay(from).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function parseApplicationDeadline(value: string) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function isValidApplicationDeadline(iso: string, from = new Date()) {
  const days = daysFromToday(iso, from);
  if (days === null) return false;
  return days >= 0 && days <= MAX_APPLICATION_DEADLINE_DAYS;
}

export function applicationDeadlineError(iso: string) {
  const days = daysFromToday(iso);
  if (days === null) return "Enter a valid closing date.";
  if (days < 0) return "Closing date cannot be in the past.";
  if (days > MAX_APPLICATION_DEADLINE_DAYS) {
    return `Closing date cannot be more than ${MAX_APPLICATION_DEADLINE_DAYS} days from today.`;
  }
  return null;
}

/** Parses API ISO datetime or `YYYY-MM-DD` form values. */
export function parseJobClosingDate(value: string) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parseApplicationDeadline(value);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return startOfDay(parsed);
}

export function formatJobClosingDate(value?: string | null) {
  const date = value ? parseJobClosingDate(value) : null;
  if (!date) return "No closing date";
  return new Intl.DateTimeFormat("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
