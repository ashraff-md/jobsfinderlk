export const RECRUITER_ROLES = ["HR", "Manager", "Agency", "Owner"] as const;

export const JOB_TITLE_SUGGESTIONS = [
  "Software Engineer",
  "Senior Software Engineer",
  "Full Stack Developer",
  "Product Manager",
  "Marketing Executive",
  "Accountant",
  "Sales Representative",
  "Customer Support Executive",
  "Data Analyst",
  "UI/UX Designer",
  "HR Executive",
  "Operations Manager",
];

export const CATEGORY_SUGGESTIONS = [
  "IT",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
  "Human Resources",
  "Engineering",
  "Design",
  "Customer Service",
  "Administration",
];

export const INDUSTRY_SUGGESTIONS = [
  "Information Technology",
  "Banking & Finance",
  "Manufacturing",
  "Retail & E-commerce",
  "Healthcare",
  "Education",
  "Hospitality & Tourism",
  "Logistics",
  "Telecommunications",
  "Government",
];

export const JOB_TYPES = ["Full Time", "Part Time", "Internship", "Contract"] as const;

export const WORK_ARRANGEMENTS = ["Remote", "Hybrid", "Onsite"] as const;

export const SALARY_TYPES = ["Fixed", "Range", "Negotiable"] as const;

export const CURRENCIES = ["LKR", "USD"] as const;

export const EXPERIENCE_LEVELS = [
  "No experience",
  "0–1 years",
  "1–3 years",
  "3–5 years",
  "5+ years",
] as const;

export const EDUCATION_LEVELS = ["O/L", "A/L", "Diploma", "HND", "Degree", "Masters"] as const;

export const SRI_LANKA_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

export const FORM_SECTIONS = [
  { id: "company", label: "Company", number: 1, icon: "corporate_fare" },
  { id: "basics", label: "Job Basics", number: 2, icon: "work" },
  { id: "employment", label: "Employment Type", number: 3, icon: "schedule" },
  { id: "location", label: "Location", number: 4, icon: "location_on" },
  { id: "salary", label: "Salary", number: 5, icon: "payments" },
  { id: "requirements", label: "Requirements", number: 6, icon: "school" },
  { id: "details", label: "Job Details", number: 7, icon: "description" },
  { id: "application", label: "Application", number: 8, icon: "send" },
  { id: "media", label: "Media Upload", number: 9, icon: "upload_file" },
] as const;

export type PostJobFormValues = {
  companyId: string;
  companySearch: string;
  recruiterRole: string;
  title: string;
  category: string;
  positionsCount: string;
  employmentType: string;
  workArrangement: string;
  city: string;
  salaryType: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  experienceLevel: string;
  educationRequirement: string;
  ageMin: string;
  ageMax: string;
  description: string;
  responsibilities: string;
  requirements: string;
  applicationDeadline: string;
  applyViaEmail: boolean;
  applyViaExternalLink: boolean;
  applyViaWalkIn: boolean;
  applyViaOneClick: boolean;
  applicationEmail: string;
  applicationExternalUrl: string;
  walkInDetails: string;
  vacancyArtworkName: string;
};

export const DEFAULT_POST_JOB_VALUES: PostJobFormValues = {
  companyId: "",
  companySearch: "",
  recruiterRole: "HR",
  title: "",
  category: "",
  positionsCount: "1",
  employmentType: "Full Time",
  workArrangement: "Hybrid",
  city: "Colombo",
  salaryType: "Range",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "LKR",
  experienceLevel: "1–3 years",
  educationRequirement: "Degree",
  ageMin: "",
  ageMax: "",
  description: "",
  responsibilities: "",
  requirements: "",
  applicationDeadline: "",
  applyViaEmail: false,
  applyViaExternalLink: false,
  applyViaWalkIn: false,
  applyViaOneClick: true,
  applicationEmail: "",
  applicationExternalUrl: "",
  walkInDetails: "",
  vacancyArtworkName: "",
};
