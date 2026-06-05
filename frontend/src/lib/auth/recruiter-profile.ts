import type { UserProfile } from "@/lib/api/auth";

export type RecruiterProfileField = "fullName" | "title" | "contactNo" | "company";

export const RECRUITER_PROFILE_LABELS: Record<RecruiterProfileField, string> = {
  fullName: "full name",
  title: "professional title",
  contactNo: "phone number",
  company: "company",
};

export function getRecruiterProfileGaps(
  profile: Pick<UserProfile, "employerUsers">,
): RecruiterProfileField[] {
  const link = profile.employerUsers?.[0];
  const missing: RecruiterProfileField[] = [];

  if (!link) {
    missing.push("company");
    return missing;
  }

  if (!link.fullName?.trim()) missing.push("fullName");
  if (!link.title?.trim()) missing.push("title");
  if (!link.contactNo?.trim()) missing.push("contactNo");

  return missing;
}

export function isRecruiterProfileComplete(
  profile: Pick<UserProfile, "employerUsers">,
): boolean {
  return getRecruiterProfileGaps(profile).length === 0;
}

export const EMPLOYER_PROFILE_PATH = "/employer/settings";
