import {
  DEFAULT_POST_JOB_VALUES,
  type PostJobFormValues,
} from "@/lib/jobs/post-job.constants";

export const PUBLIC_SERVICE_GRADES = [
  "Grade I (Executive)",
  "Grade II (Management)",
  "Grade III (Operational)",
  "Special Class",
] as const;

export type PublicServiceGrade = (typeof PUBLIC_SERVICE_GRADES)[number];

export type GovernmentJobFormValues = PostJobFormValues & {
  gazetteReference: string;
  gazetteDate: string;
  designation: string;
  publicServiceGrade: PublicServiceGrade;
  salaryScale: string;
  eligibilityCriteria: string;
};

export const DEFAULT_GOVERNMENT_JOB_VALUES: GovernmentJobFormValues = {
  ...DEFAULT_POST_JOB_VALUES,
  companySearch: "",
  category: "Administration",
  employmentType: "Full Time",
  workArrangement: "Onsite",
  applyViaOneClick: false,
  applyViaExternalLink: true,
  gazetteReference: "",
  gazetteDate: "",
  designation: "",
  publicServiceGrade: "Grade I (Executive)",
  salaryScale: "",
  eligibilityCriteria: "",
  applicationExternalUrl: "",
};

export const GOVERNMENT_POSTING_GUIDELINES = [
  "Ensure Gazette numbers match the official Friday release exactly.",
  "Salary scales must follow the current Public Administration circular (e.g., 03/2016).",
  "Age limits and residency requirements must be clearly stated in criteria.",
] as const;
