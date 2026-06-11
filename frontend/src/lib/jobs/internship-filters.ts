import type { Job } from "@/lib/api/types";

export const INTERNSHIP_DURATION_OPTIONS = [
  { value: "all", label: "All durations" },
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
] as const;

export type InternshipDuration = (typeof INTERNSHIP_DURATION_OPTIONS)[number]["value"];

const DURATION_PATTERNS: Record<Exclude<InternshipDuration, "all">, RegExp> = {
  "3": /\b3[\s-]*months?\b/i,
  "6": /\b6[\s-]*months?\b/i,
  "12": /\b(12[\s-]*months?|1[\s-]*year|one year)\b/i,
};

function internshipHaystack(job: Job) {
  return [
    job.title,
    job.description,
    job.requirements,
    job.responsibilities,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/<[^>]+>/g, " ");
}

export function matchesInternshipDuration(job: Job, duration: InternshipDuration) {
  if (duration === "all") return true;
  return DURATION_PATTERNS[duration].test(internshipHaystack(job));
}

export function filterJobsByInternshipDuration(jobs: Job[], duration: InternshipDuration) {
  if (duration === "all") return jobs;
  return jobs.filter((job) => matchesInternshipDuration(job, duration));
}
