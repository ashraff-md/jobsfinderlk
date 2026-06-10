import { apiFetch } from "./client";
import type { ListingAllowance } from "./employer-billing";

export type RecruiterVerificationStatus = {
  profileComplete: boolean;
  missingProfileFields: Array<"fullName" | "title" | "contactNo" | "company">;
  email: string;
  emailVerified: boolean;
  contactNo: string | null;
  phoneVerified: boolean;
  canPostJobs: boolean;
  listingAllowance: ListingAllowance;
  canPostListing: boolean;
};

export async function getVerificationStatus(token?: string | null) {
  return apiFetch<RecruiterVerificationStatus>("/auth/verification-status", {
    token,
  });
}

export async function sendEmailVerification(token?: string | null) {
  return apiFetch<{ message: string; alreadyVerified: boolean }>(
    "/auth/verify-email/send",
    {
      method: "POST",
      token,
    },
  );
}

export async function verifyEmailToken(emailToken: string) {
  return apiFetch<{ message: string; email: string }>(
    `/auth/verify-email?token=${encodeURIComponent(emailToken)}`,
  );
}

export async function sendPhoneOtp(contactNo: string, token?: string | null) {
  return apiFetch<{
    message: string;
    contactNo: string;
    alreadyVerified: boolean;
  }>("/auth/verify-phone/send-otp", {
    method: "POST",
    token,
    body: JSON.stringify({ contactNo }),
  });
}

export async function confirmPhoneOtp(code: string, token?: string | null) {
  return apiFetch<{ message: string; contactNo: string }>(
    "/auth/verify-phone/confirm",
    {
      method: "POST",
      token,
      body: JSON.stringify({ code }),
    },
  );
}
