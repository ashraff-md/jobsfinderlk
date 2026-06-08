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

export type GovernmentJobFormValues = Omit<PostJobFormValues, "companyId" | "companySearch"> & {
  governmentOrganizationId: string;
  governmentOrganizationSearch: string;
  gazetteReference: string;
  gazetteDate: string;
  designation: string;
  publicServiceGrade: PublicServiceGrade;
  salaryScale: string;
  eligibilityCriteria: string;
};

export const DEFAULT_GOVERNMENT_JOB_VALUES: GovernmentJobFormValues = {
  ...DEFAULT_POST_JOB_VALUES,
  governmentOrganizationId: "",
  governmentOrganizationSearch: "",
  category: "Administration",
  employmentType: "Full Time",
  workArrangement: "Onsite",
  applyViaOneClick: false,
  applyViaExternalLink: false,
  applyViaRegisteredPost: true,
  gazetteReference: "",
  gazetteDate: "",
  designation: "",
  publicServiceGrade: "Grade I (Executive)",
  salaryScale: "",
  eligibilityCriteria: "",
  applicationExternalUrl: "",
};

export const GOVERNMENT_SALARY_PLACEHOLDER = `Effective 2026-01-01: Rs. 81,675 + Rs. 17,800 Cost of Living Allowance
Effective 2027-01-01: Rs. 91,650 + Rs. 17,800 Cost of Living Allowance`;

export const REGISTERED_POST_PLACEHOLDER = `Applications from employees in Government Departments, State Corporations and Statutory Bodies should be forwarded through their respective Heads of Institutions.

Applications giving full bio-data with copies of relevant certificates should be forwarded under registered cover to reach the undersigned on or before [closing date]. Please mark the post applied for on the top left-hand corner of the envelope.

Director General
National Building Research Institute,
99/1, Jawatta Road, Colombo 05.`;

export const GOVERNMENT_POSTING_GUIDELINES = [
  "Ensure Gazette numbers match the official Friday release exactly.",
  "List salary by effective date, including allowances (e.g. Cost of Living Allowance).",
  "Age limits and residency requirements must be clearly stated in criteria.",
] as const;
