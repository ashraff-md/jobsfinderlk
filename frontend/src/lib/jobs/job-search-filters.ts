import {
  CATEGORY_SUGGESTIONS,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  SRI_LANKA_DISTRICTS,
  WORK_ARRANGEMENTS,
} from "@/lib/jobs/post-job.constants";

export {
  CATEGORY_SUGGESTIONS,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  SRI_LANKA_DISTRICTS,
  WORK_ARRANGEMENTS,
};

export type JobSearchFilters = {
  q: string;
  cities: string[];
  categories: string[];
  employmentType: string;
  workArrangement: string;
  experienceLevel: string;
  educationRequirement: string;
  salaryMin: string;
  /** Seeker's age — matches vacancies whose age requirement includes this age */
  age: string;
};

export const DEFAULT_JOB_SEARCH_FILTERS: JobSearchFilters = {
  q: "",
  cities: [],
  categories: [],
  employmentType: "",
  workArrangement: "",
  experienceLevel: "",
  educationRequirement: "",
  salaryMin: "",
  age: "",
};

export function buildJobSearchParams(
  filters: JobSearchFilters,
  extra?: { page?: number; limit?: number },
): Record<string, string | number | string[] | undefined> {
  const params: Record<string, string | number | string[] | undefined> = {
    ...extra,
  };

  if (filters.q.trim()) params.q = filters.q.trim();
  if (filters.cities.length) params.city = filters.cities;
  if (filters.categories.length) params.category = filters.categories;
  if (filters.employmentType) params.employmentType = filters.employmentType;
  if (filters.workArrangement) params.workArrangement = filters.workArrangement;
  if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
  if (filters.educationRequirement) params.educationRequirement = filters.educationRequirement;
  if (filters.salaryMin) params.salaryMin = Number(filters.salaryMin);
  if (filters.age) params.age = Number(filters.age);

  return params;
}

export function formatActiveFiltersSummary(filters: JobSearchFilters): string {
  const parts: string[] = [];
  if (filters.q.trim()) parts.push(`"${filters.q.trim()}"`);
  if (filters.experienceLevel) parts.push(filters.experienceLevel);
  if (filters.workArrangement) parts.push(filters.workArrangement);
  if (filters.employmentType) parts.push(filters.employmentType);
  if (filters.educationRequirement) parts.push(filters.educationRequirement);
  if (filters.cities.length) parts.push(filters.cities.join(", "));
  if (filters.categories.length) parts.push(filters.categories.join(", "));
  if (filters.age) parts.push(`Your age ${filters.age}`);
  if (filters.salaryMin) {
    parts.push(`Salary LKR ${Number(filters.salaryMin).toLocaleString()}+`);
  }
  return parts.length ? parts.join(" · ") : "All vacancies";
}
