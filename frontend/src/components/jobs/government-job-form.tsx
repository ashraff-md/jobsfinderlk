"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CompanyAutocomplete } from "@/components/companies/company-autocomplete";
import { JobListingMediaUploader } from "@/components/jobs/job-listing-media-uploader";
import { ApplicationDeadlinePicker } from "@/components/ui/application-deadline-picker";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import { createJob } from "@/lib/api/jobs";
import { applicationDeadlineError } from "@/lib/jobs/application-deadline";
import {
  DEFAULT_GOVERNMENT_JOB_VALUES,
  GOVERNMENT_POSTING_GUIDELINES,
  GovernmentJobFormValues,
  PUBLIC_SERVICE_GRADES,
} from "@/lib/jobs/government-job.constants";
import {
  CATEGORY_SUGGESTIONS,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  RECRUITER_ROLES,
  SRI_LANKA_DISTRICTS,
  WORK_ARRANGEMENTS,
} from "@/lib/jobs/post-job.constants";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0";
const labelClass = "font-label-bold text-on-surface";

function FormCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-stack-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm">
      <div className="mb-stack-md flex items-center gap-2">
        <Icon name={icon} className="text-primary" />
        <h3 className="text-headline-md text-on-surface">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function DatalistField({
  label,
  listId,
  options,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  listId: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className={labelClass} htmlFor={listId}>
        {label}
      </label>
      <input
        id={listId}
        list={listId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </div>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <span className={labelClass}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-lg px-4 py-2 text-label-sm font-bold transition-all",
              value === opt
                ? "bg-primary text-on-primary"
                : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function buildDescription(values: GovernmentJobFormValues) {
  const lines: string[] = [
    "Official government sector vacancy posted via JobsFinder.lk admin portal.",
  ];
  if (values.gazetteReference.trim()) {
    lines.push(`Gazette Reference: ${values.gazetteReference.trim()}`);
  }
  if (values.gazetteDate) {
    lines.push(`Gazette Date: ${values.gazetteDate}`);
  }
  if (values.publicServiceGrade) {
    lines.push(`Public Service Grade: ${values.publicServiceGrade}`);
  }
  if (values.salaryScale.trim()) {
    lines.push(`Salary Scale: ${values.salaryScale.trim()}`);
  }
  if (values.description.trim()) {
    lines.push("", values.description.trim());
  }
  if (values.eligibilityCriteria.trim()) {
    lines.push("", "Eligibility Criteria:", values.eligibilityCriteria.trim());
  }
  return lines.join("\n");
}

function normalizeExternalUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function ministryPreviewName(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return "MINISTRY / DEPARTMENT";
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}…` : trimmed.toUpperCase();
}

function gradePreviewTag(grade: string) {
  const roman = grade.match(/Grade\s+([IVX]+)/i)?.[1];
  if (roman) return `GRADE ${roman.toUpperCase()}`;
  if (/special/i.test(grade)) return "SPECIAL CLASS";
  return "GRADE";
}

function employmentPreviewTag(type: string) {
  return type.replace(/\s+/g, " ").toUpperCase();
}

export function GovernmentJobForm() {
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState<GovernmentJobFormValues>(DEFAULT_GOVERNMENT_JOB_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const patch = (partial: Partial<GovernmentJobFormValues>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const previewGazette = form.gazetteReference.trim() || "GZ-—";
  const previewSalary = form.salaryScale.trim() || "Scale pending";

  const validate = () => {
    if (!form.companyId) {
      return "Select a ministry or department from the suggestions.";
    }
    if (!form.designation.trim()) return "Designation (official title) is required.";
    if (buildDescription(form).length < 20) {
      return "Add a job description, eligibility criteria, or gazette details (at least 20 characters total).";
    }
    if (
      !form.applyViaEmail &&
      !form.applyViaExternalLink &&
      !form.applyViaWalkIn &&
      !form.applyViaOneClick
    ) {
      return "Select at least one application method.";
    }
    if (form.applyViaEmail && !form.applicationEmail.trim()) {
      return "Enter an application email address.";
    }
    if (form.applyViaExternalLink && !form.applicationExternalUrl.trim()) {
      return "Enter an official application portal link.";
    }
    if (form.applicationDeadline) {
      const deadlineError = applicationDeadlineError(form.applicationDeadline);
      if (deadlineError) return deadlineError;
    }
    if (form.ageMin || form.ageMax) {
      const min = form.ageMin !== "" ? Number(form.ageMin) : undefined;
      const max = form.ageMax !== "" ? Number(form.ageMax) : undefined;
      if (form.ageMin !== "" && (min === undefined || Number.isNaN(min) || min < 16 || min > 70)) {
        return "Starting age must be between 16 and 70.";
      }
      if (form.ageMax !== "" && (max === undefined || Number.isNaN(max) || max < 16 || max > 70)) {
        return "Ending age must be between 16 and 70.";
      }
      if (min !== undefined && max !== undefined && min > max) {
        return "Starting age cannot exceed ending age.";
      }
    }
    return null;
  };

  const buildPayload = (publish: boolean) => ({
    title: form.designation.trim(),
    description: buildDescription(form),
    responsibilities: form.responsibilities.trim() || undefined,
    requirements: form.requirements.trim() || undefined,
    companyId: form.companyId,
    recruiterRole: form.recruiterRole,
    category: form.category.trim() || "Government",
    sector: "Government",
    positionsCount: form.positionsCount ? Number(form.positionsCount) : undefined,
    employmentType: form.employmentType,
    workArrangement: form.workArrangement,
    city: form.city.trim() || undefined,
    location: [form.city, form.workArrangement].filter(Boolean).join(" • "),
    salaryType: "Negotiable",
    experienceLevel: form.experienceLevel,
    educationRequirement: form.educationRequirement,
    ageMin: form.ageMin ? Number(form.ageMin) : undefined,
    ageMax: form.ageMax ? Number(form.ageMax) : undefined,
    applicationDeadline: form.applicationDeadline || undefined,
    applyViaEmail: form.applyViaEmail,
    applyViaExternalLink: form.applyViaExternalLink,
    applyViaWalkIn: form.applyViaWalkIn,
    applyViaOneClick: form.applyViaOneClick,
    applicationEmail: form.applyViaEmail ? form.applicationEmail.trim() : undefined,
    applicationExternalUrl: form.applyViaExternalLink
      ? normalizeExternalUrl(form.applicationExternalUrl)
      : undefined,
    walkInDetails: form.applyViaWalkIn ? form.walkInDetails.trim() : undefined,
    jobSourceType: "GOVERNMENT",
    verificationLevel: "GOVT_CERTIFIED",
    publish,
  });

  const handleSubmit = async (publish: boolean) => {
    if (!getAccessToken()) {
      router.push(signInPath("admin", pathname));
      return;
    }
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createJob(buildPayload(publish));
      router.push(publish ? "/admin/jobs/government" : "/admin/jobs/government/new");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin", pathname));
        return;
      }
      setError(err instanceof ApiError ? err.message : "Failed to save government posting.");
    } finally {
      setSubmitting(false);
    }
  };

  const previewMinistry = useMemo(
    () => ministryPreviewName(form.companySearch),
    [form.companySearch],
  );

  return (
    <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
      <div className="space-y-stack-lg lg:col-span-8">
        <FormCard icon="account_balance" title="Authority & Identification">
          <div className="grid grid-cols-1 gap-stack-lg sm:grid-cols-2">
            <div className="col-span-full">
              <CompanyAutocomplete
                label="Ministry/Department"
                value={form.companySearch}
                selectedCompanyId={form.companyId || undefined}
                onQueryChange={(companySearch) => patch({ companySearch, companyId: "" })}
                onSelect={(company) =>
                  patch({ companySearch: company.name, companyId: company.id })
                }
                onClear={() => patch({ companySearch: "", companyId: "" })}
                placeholder="e.g. Ministry of Public Administration, Home Affairs, Provincial Councils"
                required
                createHref="/admin/companies"
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass} htmlFor="recruiter-role">
                Recruiter role
              </label>
              <select
                id="recruiter-role"
                value={form.recruiterRole}
                onChange={(e) => patch({ recruiterRole: e.target.value })}
                className={inputClass}
              >
                {RECRUITER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <DatalistField
              label="Category"
              listId="gov-category-list"
              options={CATEGORY_SUGGESTIONS}
              value={form.category}
              onChange={(category) => patch({ category })}
              placeholder="e.g. Administration"
            />
            <div className="space-y-2">
              <label className={labelClass} htmlFor="gazette-ref">
                Gazette Reference Number
              </label>
              <input
                id="gazette-ref"
                type="text"
                value={form.gazetteReference}
                onChange={(e) => patch({ gazetteReference: e.target.value })}
                placeholder="GZ-2023-11-24-001"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass} htmlFor="gazette-date">
                Gazette Date
              </label>
              <input
                id="gazette-date"
                type="date"
                value={form.gazetteDate}
                onChange={(e) => patch({ gazetteDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </FormCard>

        <FormCard icon="badge" title="Position Hierarchy">
          <div className="grid grid-cols-1 gap-stack-lg sm:grid-cols-2">
            <div className="col-span-full space-y-2">
              <label className={labelClass} htmlFor="designation">
                Designation (Full Official Title)
              </label>
              <input
                id="designation"
                type="text"
                value={form.designation}
                onChange={(e) => patch({ designation: e.target.value })}
                placeholder="e.g. Senior Assistant Secretary (Administration)"
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass} htmlFor="grade">
                Public Service Grade
              </label>
              <select
                id="grade"
                value={form.publicServiceGrade}
                onChange={(e) =>
                  patch({
                    publicServiceGrade: e.target
                      .value as GovernmentJobFormValues["publicServiceGrade"],
                  })
                }
                className={inputClass}
              >
                {PUBLIC_SERVICE_GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass} htmlFor="positions">
                Number of positions
              </label>
              <input
                id="positions"
                type="number"
                min={1}
                value={form.positionsCount}
                onChange={(e) => patch({ positionsCount: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="col-span-full space-y-2">
              <label className={labelClass} htmlFor="salary-scale">
                Salary Scale (SL Standard)
              </label>
              <input
                id="salary-scale"
                type="text"
                value={form.salaryScale}
                onChange={(e) => patch({ salaryScale: e.target.value })}
                placeholder="SL-1-2016: Rs. 47,615 - 10 x 1,335..."
                className={inputClass}
              />
            </div>
          </div>
        </FormCard>

        <FormCard icon="schedule" title="Employment & Location">
          <ChipGroup
            label="Job type"
            options={JOB_TYPES}
            value={form.employmentType as (typeof JOB_TYPES)[number]}
            onChange={(employmentType) => patch({ employmentType })}
          />
          <ChipGroup
            label="Work arrangement"
            options={WORK_ARRANGEMENTS}
            value={form.workArrangement as (typeof WORK_ARRANGEMENTS)[number]}
            onChange={(workArrangement) => patch({ workArrangement })}
          />
          <DatalistField
            label="City / district"
            listId="gov-city-list"
            options={SRI_LANKA_DISTRICTS}
            value={form.city}
            onChange={(city) => patch({ city })}
            placeholder="e.g. Colombo"
          />
        </FormCard>

        <FormCard icon="school" title="Requirements">
          <div className="grid grid-cols-1 gap-stack-lg sm:grid-cols-2">
            <div className="space-y-2">
              <label className={labelClass}>Experience level</label>
              <select
                value={form.experienceLevel}
                onChange={(e) => patch({ experienceLevel: e.target.value })}
                className={inputClass}
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Education requirement</label>
              <select
                value={form.educationRequirement}
                onChange={(e) => patch({ educationRequirement: e.target.value })}
                className={inputClass}
              >
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <span className={labelClass}>Age requirement (years)</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-label-sm text-on-surface-variant" htmlFor="age-min">
                  Starting age
                </label>
                <input
                  id="age-min"
                  type="number"
                  min={16}
                  max={70}
                  placeholder="e.g. 21"
                  value={form.ageMin}
                  onChange={(e) => patch({ ageMin: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-sm text-on-surface-variant" htmlFor="age-max">
                  Ending age
                </label>
                <input
                  id="age-max"
                  type="number"
                  min={16}
                  max={70}
                  placeholder="e.g. 35"
                  value={form.ageMax}
                  onChange={(e) => patch({ ageMax: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <p className="text-label-sm text-on-surface-variant">
              Optional. Leave blank for no limit.
            </p>
          </div>
        </FormCard>

        <FormCard icon="description" title="Job Details">
          <div className="space-y-2">
            <label className={labelClass} htmlFor="description">
              Job description
            </label>
            <textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Overview of the role, department mandate, and reporting structure…"
              className={cn(inputClass, "resize-y")}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="responsibilities">
              Responsibilities
            </label>
            <textarea
              id="responsibilities"
              rows={4}
              value={form.responsibilities}
              onChange={(e) => patch({ responsibilities: e.target.value })}
              placeholder="Key duties as per the service minute…"
              className={cn(inputClass, "resize-y")}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="eligibility">
              Eligibility Criteria (Summary)
            </label>
            <textarea
              id="eligibility"
              rows={4}
              value={form.eligibilityCriteria}
              onChange={(e) => patch({ eligibilityCriteria: e.target.value })}
              placeholder="Detailed qualifications as per Service Minutes…"
              className={cn(inputClass, "resize-y")}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="requirements">
              Requirements
            </label>
            <textarea
              id="requirements"
              rows={4}
              value={form.requirements}
              onChange={(e) => patch({ requirements: e.target.value })}
              placeholder="Bullet-style requirements (one per line)…"
              className={cn(inputClass, "resize-y")}
            />
          </div>
        </FormCard>

        <FormCard icon="send" title="Application Settings">
          <ApplicationDeadlinePicker
            value={form.applicationDeadline}
            onChange={(applicationDeadline) => patch({ applicationDeadline })}
            disabled={submitting}
          />
          <div className="space-y-3">
            <span className={labelClass}>Receive applications via</span>
            {[
              { key: "applyViaOneClick" as const, label: "One-click Apply (JobsFinder)" },
              { key: "applyViaEmail" as const, label: "Email" },
              { key: "applyViaExternalLink" as const, label: "External link (official portal)" },
              { key: "applyViaWalkIn" as const, label: "Walk-in interview" },
            ].map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => patch({ [key]: e.target.checked })}
                  className="h-5 w-5 rounded border-outline-variant text-primary"
                />
                <span className="font-body-md">{label}</span>
              </label>
            ))}
          </div>
          {form.applyViaEmail && (
            <div className="space-y-2">
              <label className={labelClass}>Application email</label>
              <input
                type="email"
                value={form.applicationEmail}
                onChange={(e) => patch({ applicationEmail: e.target.value })}
                placeholder="careers@ministry.gov.lk"
                className={inputClass}
              />
            </div>
          )}
          {form.applyViaExternalLink && (
            <div className="space-y-2">
              <label className={labelClass}>Official Application Portal/Link</label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-outline-variant bg-surface-container-low px-3 font-label-sm text-on-surface-variant">
                  https://
                </span>
                <input
                  type="text"
                  value={form.applicationExternalUrl.replace(/^https?:\/\//i, "")}
                  onChange={(e) => patch({ applicationExternalUrl: e.target.value })}
                  placeholder="applications.gov.lk/apply"
                  className={cn(inputClass, "rounded-l-none")}
                />
              </div>
            </div>
          )}
          {form.applyViaWalkIn && (
            <div className="space-y-2">
              <label className={labelClass}>Walk-in details</label>
              <textarea
                rows={3}
                value={form.walkInDetails}
                onChange={(e) => patch({ walkInDetails: e.target.value })}
                placeholder="Address, dates, and times…"
                className={cn(inputClass, "resize-y")}
              />
            </div>
          )}
        </FormCard>

        <FormCard icon="image" title="Vacancy artwork">
          <JobListingMediaUploader
            vacancyArtworkName={form.vacancyArtworkName}
            onVacancyArtworkChange={(vacancyArtworkName) => patch({ vacancyArtworkName })}
            disabled={submitting}
          />
        </FormCard>

        {error && (
          <p className="rounded-lg border border-error/30 bg-error-container/30 px-4 py-3 text-body-md text-error">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-stack-md pb-stack-lg">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(false)}
            className="rounded-lg border border-primary-container px-8 py-3 font-label-bold text-primary-container transition-all hover:bg-surface-container-low disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(true)}
            className="rounded-lg bg-primary px-12 py-3 font-label-bold text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {submitting ? "Publishing…" : "Publish Official Posting"}
          </button>
        </div>
      </div>

      <aside className="space-y-stack-lg lg:col-span-4">
        <div className="overflow-hidden rounded-xl border-2 border-secondary-container shadow-[0_0_40px_-10px_rgba(49,107,243,0.15)]">
          <div className="flex items-center justify-between bg-primary-container p-stack-md">
            <span className="font-label-bold uppercase tracking-widest text-on-primary">
              Live Preview
            </span>
            <Icon name="visibility" className="text-secondary-fixed" filled />
          </div>
          <div className="bg-surface-container-lowest p-stack-lg">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-surface-container-high">
                <Icon name="account_balance" className="text-on-surface" />
              </div>
              <div>
                <h4 className="font-label-bold text-secondary">{previewMinistry}</h4>
                <p className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                  Gazette: {previewGazette}
                </p>
              </div>
            </div>
            <h2 className="text-headline-md leading-tight text-on-background">
              {form.designation.trim() || "Official designation"}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded bg-surface-container-high px-2 py-1 text-[11px] font-bold text-on-surface-variant">
                {gradePreviewTag(form.publicServiceGrade)}
              </span>
              <span className="rounded bg-surface-container-high px-2 py-1 text-[11px] font-bold text-on-surface-variant">
                {employmentPreviewTag(form.employmentType)}
              </span>
              {form.city && (
                <span className="rounded bg-surface-container-high px-2 py-1 text-[11px] font-bold text-on-surface-variant">
                  {form.city.toUpperCase()}
                </span>
              )}
              <span className="rounded bg-secondary-container/10 px-2 py-1 text-[11px] font-bold text-secondary">
                GOVT-CERTIFIED
              </span>
            </div>
            <div className="mt-6 border-t border-outline-variant/30 pt-4">
              <p className="mb-2 font-label-sm text-on-surface-variant">Monthly Scale:</p>
              <p className="text-headline-md text-primary-container">{previewSalary}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-stack-lg">
          <h3 className="mb-4 flex items-center gap-2 font-label-bold text-primary">
            <Icon name="info" className="text-sm" />
            POSTING GUIDELINES
          </h3>
          <ul className="space-y-3">
            {GOVERNMENT_POSTING_GUIDELINES.map((text) => (
              <li key={text} className="flex items-start gap-3">
                <Icon name="check_circle" className="mt-0.5 text-sm text-secondary" />
                <p className="font-label-sm text-on-surface-variant">{text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-outline-variant/30 pt-4 text-center">
            <Link href="/help" className="font-label-bold text-secondary hover:underline">
              Download Templates
            </Link>
          </div>
        </div>

        <div className="group relative h-48 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Government Building"
            className="h-full w-full object-cover grayscale brightness-50 transition-all duration-700 group-hover:brightness-75 group-hover:grayscale-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzwlyVPFXTxbMKuZoFEqQ0K7ao5hStNcF1SoveOlOIUGIFTchhu-g7oTCJL0cC6pvbGupaXvmMhxt7HxZ47j7695Ptvr4bI7XbEn_0--y-3tyIWLxc1lpQ6KGqzb7tazewz_g6qpuTLszqx-CWJiT9HOYBQKMpNTdh6FdtyOXhnvhc3bXXCMgCbI2FqmmWj65PTcnhsK3-3PtKiSH-1qGdR44gX-hHQBpZLm1DCRrAMZ4x24K6aWouxi95sRdhWnqO1eKVSGoBfCtB"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary-container/80 to-transparent p-stack-md">
            <p className="text-headline-md text-on-primary">Civil Service Excellence</p>
            <p className="font-label-sm text-on-primary-container">Official Recruitment Authority</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
