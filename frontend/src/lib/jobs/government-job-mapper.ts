import type { Job } from "@/lib/api/types";
import {
  DEFAULT_GOVERNMENT_JOB_VALUES,
  PUBLIC_SERVICE_GRADES,
  type GovernmentJobFormValues,
  type PublicServiceGrade,
} from "@/lib/jobs/government-job.constants";
import { isVacancyArtworkPdf } from "@/lib/jobs/vacancy-artwork";

type ParsedGovernmentDescription = {
  gazetteReference: string;
  gazetteDate: string;
  publicServiceGrade: PublicServiceGrade;
  salaryScale: string;
  description: string;
  eligibilityCriteria: string;
};

function matchPublicServiceGrade(value: string): PublicServiceGrade {
  const trimmed = value.trim();
  return (PUBLIC_SERVICE_GRADES as readonly string[]).includes(trimmed)
    ? (trimmed as PublicServiceGrade)
    : DEFAULT_GOVERNMENT_JOB_VALUES.publicServiceGrade;
}

export function parseGovernmentJobDescription(description: string): ParsedGovernmentDescription {
  const result: ParsedGovernmentDescription = {
    gazetteReference: "",
    gazetteDate: "",
    publicServiceGrade: DEFAULT_GOVERNMENT_JOB_VALUES.publicServiceGrade,
    salaryScale: "",
    description: "",
    eligibilityCriteria: "",
  };

  const lines = description.split("\n");
  const salaryLines: string[] = [];
  const bodyLines: string[] = [];
  const eligibilityLines: string[] = [];
  let section: "header" | "salary" | "body" | "eligibility" = "header";

  for (const line of lines) {
    if (section === "header") {
      if (line.startsWith("Gazette Reference:")) {
        result.gazetteReference = line.replace("Gazette Reference:", "").trim();
        continue;
      }
      if (line.startsWith("Gazette Date:")) {
        result.gazetteDate = line.replace("Gazette Date:", "").trim();
        continue;
      }
      if (line.startsWith("Public Service Grade:")) {
        result.publicServiceGrade = matchPublicServiceGrade(
          line.replace("Public Service Grade:", ""),
        );
        continue;
      }
      if (line === "Salary:" || line.startsWith("Salary Scale:")) {
        section = "salary";
        if (line.startsWith("Salary Scale:")) {
          const inline = line.replace("Salary Scale:", "").trim();
          if (inline) salaryLines.push(inline);
        }
        continue;
      }
      if (line.startsWith("Official government sector vacancy")) continue;
      if (line.trim()) {
        section = "body";
        bodyLines.push(line);
      }
      continue;
    }

    if (section === "salary") {
      if (line === "Eligibility Criteria:") {
        section = "eligibility";
        continue;
      }
      if (!line.trim()) {
        section = "body";
        continue;
      }
      salaryLines.push(line);
      continue;
    }

    if (section === "body") {
      if (line === "Eligibility Criteria:") {
        section = "eligibility";
        continue;
      }
      bodyLines.push(line);
      continue;
    }

    eligibilityLines.push(line);
  }

  result.salaryScale = salaryLines.join("\n").trim();
  result.description = bodyLines.join("\n").trim();
  result.eligibilityCriteria = eligibilityLines.join("\n").trim();
  return result;
}

function formatDeadline(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function artworkFileName(url: string) {
  const segment = url.split("/").pop() ?? "vacancy-artwork";
  return segment.split("?")[0] || "vacancy-artwork";
}

export function jobToGovernmentFormValues(job: Job): GovernmentJobFormValues {
  const parsed = parseGovernmentJobDescription(job.description);
  const artworkUrl = job.vacancyArtworkUrl ?? "";
  const isPdf = isVacancyArtworkPdf(null, artworkUrl);

  return {
    ...DEFAULT_GOVERNMENT_JOB_VALUES,
    governmentOrganizationId:
      job.governmentOrganization?.id ?? job.governmentOrganizationId ?? "",
    governmentOrganizationSearch:
      job.governmentOrganization?.name?.trim() ?? job.requestedCompanyName?.trim() ?? "",
    designation: job.title,
    gazetteReference: parsed.gazetteReference,
    gazetteDate: parsed.gazetteDate,
    publicServiceGrade: parsed.publicServiceGrade,
    salaryScale: parsed.salaryScale,
    description: parsed.description,
    eligibilityCriteria: parsed.eligibilityCriteria,
    recruiterRole: job.recruiterRole ?? DEFAULT_GOVERNMENT_JOB_VALUES.recruiterRole,
    category: job.category ?? DEFAULT_GOVERNMENT_JOB_VALUES.category,
    positionsCount: job.positionsCount != null ? String(job.positionsCount) : "1",
    employmentType: job.employmentType ?? DEFAULT_GOVERNMENT_JOB_VALUES.employmentType,
    workArrangement: job.workArrangement ?? DEFAULT_GOVERNMENT_JOB_VALUES.workArrangement,
    city: job.city ?? DEFAULT_GOVERNMENT_JOB_VALUES.city,
    experienceLevel: job.experienceLevel ?? DEFAULT_GOVERNMENT_JOB_VALUES.experienceLevel,
    educationRequirement:
      job.educationRequirement ?? DEFAULT_GOVERNMENT_JOB_VALUES.educationRequirement,
    ageMin: job.ageMin != null ? String(job.ageMin) : "",
    ageMax: job.ageMax != null ? String(job.ageMax) : "",
    responsibilities: job.responsibilities ?? "",
    requirements: job.requirements ?? "",
    applicationDeadline: formatDeadline(job.applicationDeadline),
    applyViaEmail: job.applyViaEmail ?? false,
    applyViaExternalLink: job.applyViaExternalLink ?? false,
    applyViaWalkIn: job.applyViaWalkIn ?? false,
    applyViaRegisteredPost: job.applyViaRegisteredPost ?? DEFAULT_GOVERNMENT_JOB_VALUES.applyViaRegisteredPost,
    applyViaOneClick: job.applyViaOneClick ?? false,
    applicationEmail: job.applicationEmail ?? "",
    applicationExternalUrl: job.applicationExternalUrl ?? "",
    walkInDetails: job.walkInDetails ?? "",
    registeredPostDetails: job.registeredPostDetails ?? "",
    vacancyArtworkUrl: artworkUrl,
    vacancyArtworkName: artworkUrl ? artworkFileName(artworkUrl) : "",
    vacancyArtworkMime: isPdf ? "application/pdf" : artworkUrl ? "image/jpeg" : "",
  };
}
