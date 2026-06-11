export type UserRole = "SEEKER" | "EMPLOYER" | "ADMIN" | "MODERATOR";

export type JobCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string;
  sortOrder: number;
  totalJobs?: number;
};

export type PlatformPartner = {
  id: string;
  name: string;
  screenText?: string | null;
  website?: string | null;
  sortOrder?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminJobCategory = JobCategory & {
  active: boolean;
  totalJobs: number;
  activeJobs: number;
  updatedAt: string;
};

export type BannerAspectRatio = "RATIO_3_2" | "RATIO_2_5";

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
  updatedAt?: string;
  _count?: { jobs: number };
};

export type CompanySuggestion = Company & {
  score: number;
  matchType: "exact" | "fuzzy" | "phonetic" | "domain";
  pendingReview?: boolean;
};

export type GovernmentOrganizationParent = {
  id: string;
  name: string;
  organizationType: string;
  shortName?: string | null;
};

export type GovernmentOrganization = {
  id: string;
  name: string;
  slug: string;
  organizationType: string;
  parentOrganizationId?: string | null;
  shortName?: string | null;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  contactNumber?: string | null;
  headOfficeAddress?: string | null;
  district?: string | null;
  province?: string | null;
  logoUrl?: string | null;
  parent?: GovernmentOrganizationParent | null;
  createdBy?: ReviewedByAdmin | null;
  _count?: { jobs: number };
  createdAt?: string;
  updatedAt?: string;
};

export type GovernmentOrganizationSuggestion = Pick<
  GovernmentOrganization,
  "id" | "name" | "slug" | "organizationType" | "shortName" | "district" | "province" | "logoUrl" | "parent"
> & {
  score: number;
  matchType: "exact" | "fuzzy" | "phonetic";
};

export type CreateGovernmentOrganizationBody = {
  name: string;
  organizationType: string;
  parentOrganizationId?: string;
  shortName?: string;
  description?: string;
  website?: string;
  email?: string;
  contactNumber?: string;
  headOfficeAddress?: string;
  district?: string;
  province?: string;
  logoUrl?: string;
};

export type ReviewedByAdmin = {
  id: string;
  email: string;
  adminProfile?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
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
  placeholderCompanyId?: string | null;
  placeholderCompany?: Pick<Company, "id" | "name" | "slug" | "verified" | "logoUrl"> | null;
  reviewNotes?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: ReviewedByAdmin | null;
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

export type AdminTalentStatus = "COMPLETE" | "ACTIVE" | "VERIFIED" | "INCOMPLETE";

export type AdminTalent = {
  id: string;
  email: string;
  fullName?: string | null;
  headline?: string | null;
  resumeUrl?: string | null;
  emailVerified: boolean;
  applicationCount: number;
  profileStatus: AdminTalentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminTalentStats = {
  total: number;
  completeProfiles: number;
  activeApplicants: number;
  emailVerified: number;
  joinedThisMonth: number;
  growthPercent: number;
  monthlySignups: Array<{ month: string; count: number }>;
  distribution: Array<{ label: string; count: number; percent: number }>;
};

export type AdminRecruiter = {
  id: string;
  userId: string;
  email: string;
  fullName?: string | null;
  title?: string | null;
  contactNo?: string | null;
  companyName?: string | null;
  companyId?: string | null;
  companyLogoUrl?: string | null;
  companyVerified: boolean;
  emailVerified: boolean;
  verificationStatus: "VERIFIED" | "PENDING" | "UNLINKED";
  reviewedAt?: string | null;
  reviewedBy?: ReviewedByAdmin | null;
  createdAt: string;
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
  viewCount?: number;
  status?: string;
  jobSourceType?: string | null;
  verificationLevel?: string | null;
  requestedCompanyName?: string | null;
  governmentOrganizationId?: string | null;
  governmentOrganization?: GovernmentOrganization | null;
  recruiterRole?: string | null;
  positionsCount?: number | null;
  createdAt?: string;
  publishedAt?: string | null;
  applicationDeadline?: string | null;
  applyViaEmail?: boolean;
  applyViaExternalLink?: boolean;
  applyViaWalkIn?: boolean;
  applyViaRegisteredPost?: boolean;
  applyViaOneClick?: boolean;
  applicationEmail?: string | null;
  applicationExternalUrl?: string | null;
  walkInDetails?: string | null;
  registeredPostDetails?: string | null;
  reviewedAt?: string | null;
  vacancyArtworkUrl?: string | null;
  company: Company;
  reviewedBy?: ReviewedByAdmin | null;
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

export type JobApplication = {
  id: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    seekerProfile?: {
      fullName?: string | null;
      headline?: string | null;
    } | null;
  };
};

export type BlogPostStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  authorName: string;
  authorTitle?: string | null;
  authorBio?: string | null;
  authorImageUrl?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  readMinutes: number;
  featured: boolean;
  status: BlogPostStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostStats = {
  total: number;
  drafts: number;
  scheduled: number;
  published: number;
};
