"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  EMPLOYER_PROFILE_PATH,
  RECRUITER_PROFILE_LABELS,
  type RecruiterProfileField,
} from "@/lib/auth/recruiter-profile";

type CompleteRecruiterProfilePromptProps = {
  missingFields: RecruiterProfileField[];
};

export function CompleteRecruiterProfilePrompt({
  missingFields,
}: CompleteRecruiterProfilePromptProps) {
  const needsCompany = missingFields.includes("company");
  const missingLabels = missingFields
    .filter((field) => field !== "company")
    .map((field) => RECRUITER_PROFILE_LABELS[field]);

  return (
    <div className="professional-card mx-auto max-w-2xl space-y-5 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
      <div className="flex items-start gap-3">
        <Icon name="person" className="mt-0.5 text-primary" />
        <div>
          <h2 className="text-headline-md text-on-surface">Complete your profile first</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            {needsCompany && missingLabels.length === 0 ? (
              <>Link a company to your account before posting a vacancy.</>
            ) : needsCompany ? (
              <>
                Before posting a vacancy, register your company and finish your recruiter profile
                with your {missingLabels.join(", ")}.
              </>
            ) : (
              <>
                Before posting a vacancy, finish your recruiter profile with your{" "}
                {missingLabels.join(", ")}.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {needsCompany ? (
          <Link
            href="/employer/companies/new"
            className="inline-flex rounded-lg border border-primary px-6 py-3 font-label-bold text-primary"
          >
            Register company
          </Link>
        ) : null}
        <Link
          href={EMPLOYER_PROFILE_PATH}
          className="inline-flex rounded-lg bg-primary px-6 py-3 font-label-bold text-on-primary"
        >
          Go to profile
        </Link>
      </div>
    </div>
  );
}
