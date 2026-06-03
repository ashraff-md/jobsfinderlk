export type UserRole = "SEEKER" | "EMPLOYER" | "ADMIN" | "MODERATOR";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type Company = {
  id: string;
  name: string;
  slug: string;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  industry?: string | null;
  address?: string | null;
  city?: string | null;
  location?: string | null;
  companyType?: string | null;
  emailDomain?: string | null;
  verified: boolean;
  lifeAtCompanyImages?: string[];
  _count?: { jobs: number };
};

export type CompanySuggestion = Company & {
  score: number;
  matchType: "exact" | "fuzzy" | "phonetic" | "domain";
};

export type CompanyRequest = {
  id: string;
  companyName: string;
  industry?: string | null;
  website?: string | null;
  emailDomain?: string | null;
  address?: string | null;
  city?: string | null;
  location?: string | null;
  companyType?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  lifeAtCompanyImages?: string[];
  status: "PENDING" | "APPROVED" | "REJECTED" | "MERGED";
  reviewNotes?: string | null;
  createdAt: string;
  mergedInto?: Pick<Company, "id" | "name" | "slug" | "verified"> | null;
  requestedBy?: {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    employerUsers?: Array<{
      company: Pick<Company, "id" | "name" | "verified">;
    }>;
  };
  similarCompanies?: CompanySuggestion[];
};

export type CompanyDetail = Company & {
  jobs: Job[];
};

export type EmployerJob = Job & {
  updatedAt?: string;
  _count?: { applications: number };
};

export type Job = {
  id: string;
  title: string;
  slug: string;
  description: string;
  responsibilities?: string | null;
  requirements?: string | null;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  employmentType?: string | null;
  workArrangement?: string | null;
  experienceLevel?: string | null;
  educationRequirement?: string | null;
  ageMin?: number | null;
  ageMax?: number | null;
  industry?: string | null;
  category?: string | null;
  city?: string | null;
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  isFeatured: boolean;
  status?: string;
  jobSourceType?: string | null;
  verificationLevel?: string | null;
  createdAt?: string;
  publishedAt?: string | null;
  applicationDeadline?: string | null;
  vacancyArtworkUrl?: string | null;
  company: Company;
  _count?: { applications: number };
};

export type JobsSearchResponse = {
  items: Job[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type Application = {
  id: string;
  status: string;
  createdAt: string;
  job: Job;
};
