import {
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  SRI_LANKA_DISTRICTS,
  WORK_ARRANGEMENTS,
} from "@/lib/jobs/post-job.constants";

export {
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

export type ParsedJobSearchParams = {
  filters: JobSearchFilters;
  page: number;
  limit: number;
};

const JOBS_PER_PAGE_OPTIONS = [10, 20, 50] as const;

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = searchParams[key];
  if (!value) return "";
  return Array.isArray(value) ? (value[0] ?? "") : value;
}

function readSearchParamAll(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string[] {
  const value = searchParams[key];
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

export function parseJobSearchParamsFromUrl(
  searchParams: Record<string, string | string[] | undefined>,
): ParsedJobSearchParams {
  let categories = readSearchParamAll(searchParams, "category");
  const legacyIndustry = readSearchParam(searchParams, "industry");
  if (!categories.length && legacyIndustry) {
    categories = [legacyIndustry];
  }

  const page = Math.max(1, Number(readSearchParam(searchParams, "page")) || 1);
  const limitRaw = Number(readSearchParam(searchParams, "limit")) || 10;
  const limit = JOBS_PER_PAGE_OPTIONS.includes(
    limitRaw as (typeof JOBS_PER_PAGE_OPTIONS)[number],
  )
    ? limitRaw
    : 10;

  return {
    filters: {
      q: readSearchParam(searchParams, "q"),
      cities: readSearchParamAll(searchParams, "city"),
      categories,
      employmentType: readSearchParam(searchParams, "employmentType"),
      workArrangement: readSearchParam(searchParams, "workArrangement"),
      experienceLevel: readSearchParam(searchParams, "experienceLevel"),
      educationRequirement: readSearchParam(searchParams, "educationRequirement"),
      salaryMin: readSearchParam(searchParams, "salaryMin"),
      age: readSearchParam(searchParams, "age"),
    },
    page,
    limit,
  };
}

export function buildJobsSearchCanonicalPath(parsed: ParsedJobSearchParams): string {
  const extra: { page?: number; limit?: number } = {};
  if (parsed.page > 1) extra.page = parsed.page;
  if (parsed.limit !== 10) extra.limit = parsed.limit;
  return buildJobsSearchApiPath(parsed.filters, extra);
}

export function getJobsPaginationPaths(
  parsed: ParsedJobSearchParams,
  totalPages: number,
): { prev?: string; next?: string } {
  const result: { prev?: string; next?: string } = {};
  if (parsed.page > 1) {
    result.prev = buildJobsSearchCanonicalPath({ ...parsed, page: parsed.page - 1 });
  }
  if (parsed.page < totalPages) {
    result.next = buildJobsSearchCanonicalPath({ ...parsed, page: parsed.page + 1 });
  }
  return result;
}

export function buildJobsSearchApiPath(
  filters: JobSearchFilters,
  extra?: { page?: number; limit?: number },
): string {
  const params = buildJobSearchParams(filters, extra);
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) query.append(key, item);
      });
      return;
    }
    query.set(key, String(value));
  });

  const qs = query.toString();
  return `/jobs${qs ? `?${qs}` : ""}`;
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
