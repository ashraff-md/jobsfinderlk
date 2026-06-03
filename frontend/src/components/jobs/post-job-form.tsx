"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import { createJob } from "@/lib/api/jobs";
import { CompanyAutocomplete } from "@/components/companies/company-autocomplete";
import { JobListingMediaUploader } from "@/components/jobs/job-listing-media-uploader";
import { ApplicationDeadlinePicker } from "@/components/ui/application-deadline-picker";
import {
  CATEGORY_SUGGESTIONS,
  CURRENCIES,
  DEFAULT_POST_JOB_VALUES,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  FORM_SECTIONS,
  JOB_TITLE_SUGGESTIONS,
  JOB_TYPES,
  PostJobFormValues,
  RECRUITER_ROLES,
  SALARY_TYPES,
  SRI_LANKA_DISTRICTS,
  WORK_ARRANGEMENTS,
} from "@/lib/jobs/post-job.constants";
import { applicationDeadlineError } from "@/lib/jobs/application-deadline";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-outline-variant px-4 py-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "font-label-bold text-on-surface-variant";

function Section({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="professional-card scroll-mt-28 space-y-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-4">
        <Icon name={icon} className="text-primary" />
        <h2 className="text-headline-md text-on-surface">{title}</h2>
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

function TagInput({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <label className={labelClass}>{label}</label>
      <div className="flex flex-wrap gap-2 rounded-lg border border-outline-variant bg-white p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-label-sm text-on-primary"
          >
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))}>
              <Icon name="close" className="text-[14px]" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(draft);
            }
          }}
          onBlur={() => addTag(draft)}
          placeholder={placeholder}
          className="min-w-[140px] flex-1 border-none p-0 text-body-md outline-none"
        />
      </div>
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

type PostJobFormProps = {
  mode?: "employer" | "admin";
};

export function PostJobForm({ mode = "employer" }: PostJobFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = mode === "admin";
  const signInUrl = signInPath(isAdmin ? "admin" : "employer", pathname);
  const [form, setForm] = useState<PostJobFormValues>(DEFAULT_POST_JOB_VALUES);
  const [activeStep, setActiveStep] = useState<string>(FORM_SECTIONS[0].id);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const patch = useCallback((partial: Partial<PostJobFormValues>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const scrollToSection = (id: string) => {
    setActiveStep(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = () => {
    if (!form.companyId) {
      return "Select a company from the suggestions or create a new company first.";
    }
    if (!form.title.trim()) return "Job title is required.";
    if (form.description.trim().length < 20) {
      return "Job description must be at least 20 characters.";
    }
    if (!form.applyViaEmail && !form.applyViaExternalLink && !form.applyViaWalkIn && !form.applyViaOneClick) {
      return "Select at least one application method.";
    }
    if (form.applyViaEmail && !form.applicationEmail.trim()) {
      return "Enter an application email address.";
    }
    if (form.applyViaExternalLink && !form.applicationExternalUrl.trim()) {
      return "Enter an external application link.";
    }
    if (form.salaryType === "Range" && form.salaryMin && form.salaryMax) {
      if (Number(form.salaryMin) > Number(form.salaryMax)) {
        return "Minimum salary cannot exceed maximum salary.";
      }
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
    title: form.title.trim(),
    description: form.description.trim(),
    responsibilities: form.responsibilities.trim() || undefined,
    companyId: form.companyId,
    recruiterRole: form.recruiterRole,
    category: form.category.trim() || undefined,
    positionsCount: form.positionsCount ? Number(form.positionsCount) : undefined,
    employmentType: form.employmentType,
    workArrangement: form.workArrangement,
    city: form.city.trim() || undefined,
    location: [form.city, form.workArrangement].filter(Boolean).join(" • "),
    salaryType: form.salaryType,
    salaryMin:
      form.salaryType !== "Negotiable" && form.salaryMin
        ? Number(form.salaryMin)
        : undefined,
    salaryMax:
      form.salaryType !== "Negotiable" && form.salaryMax
        ? Number(form.salaryMax)
        : undefined,
    salaryCurrency: form.salaryCurrency,
    experienceLevel: form.experienceLevel,
    educationRequirement: form.educationRequirement,
    ageMin: form.ageMin ? Number(form.ageMin) : undefined,
    ageMax: form.ageMax ? Number(form.ageMax) : undefined,
    requiredSkills: form.requiredSkills,
    niceToHaveSkills: form.niceToHaveSkills,
    applicationDeadline: form.applicationDeadline || undefined,
    applyViaEmail: form.applyViaEmail,
    applyViaExternalLink: form.applyViaExternalLink,
    applyViaWalkIn: form.applyViaWalkIn,
    applyViaOneClick: form.applyViaOneClick,
    applicationEmail: form.applyViaEmail ? form.applicationEmail.trim() : undefined,
    applicationExternalUrl: form.applyViaExternalLink
      ? form.applicationExternalUrl.trim()
      : undefined,
    walkInDetails: form.applyViaWalkIn ? form.walkInDetails.trim() : undefined,
    publish,
  });

  const handleSubmit = async (publish: boolean) => {
    if (!getAccessToken()) {
      router.push(signInUrl);
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
      const job = await createJob(buildPayload(publish));
      if (isAdmin) {
        router.push(publish ? "/admin/jobs" : "/admin/jobs/new");
      } else {
        router.push(publish ? `/jobs/${job.slug}` : "/employer");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInUrl);
        return;
      }
      setError(err instanceof ApiError ? err.message : "Failed to save job listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const completionScore = useMemo(() => {
    let score = 0;
    if (form.title) score += 10;
    if (form.description.length >= 20) score += 15;
    if (form.responsibilities) score += 10;
    if (form.requiredSkills.length) score += 10;
    if (form.city) score += 5;
    if (form.category) score += 15;
    if (form.companyId) score += 10;
    if (form.salaryType === "Negotiable" || form.salaryMin || form.salaryMax) score += 10;
    if (form.applicationDeadline) score += 5;
    if (form.niceToHaveSkills.length) score += 10;
    return Math.min(score, 100);
  }, [form]);

  return (
    <div className="flex flex-col gap-gutter lg:flex-row">
      <aside className="lg:w-1/4">
        <div className="sticky top-28 space-y-6">
          <div>
            <h1 className="text-headline-lg text-primary">Create Job Listing</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Structured listing for search, AI matching, and admin review.
            </p>
          </div>

          <nav className="relative max-h-[50vh] space-y-2 overflow-y-auto pr-1">
            <div className="absolute bottom-2 left-[11px] top-2 w-[2px] bg-outline-variant" />
            {FORM_SECTIONS.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => scrollToSection(step.id)}
                className="group relative z-10 flex w-full items-center gap-3 text-left"
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    activeStep === step.id
                      ? "step-active"
                      : "bg-surface-container-highest text-on-surface-variant",
                  )}
                >
                  {step.number}
                </div>
                <span
                  className={cn(
                    "text-label-sm",
                    activeStep === step.id
                      ? "font-bold text-primary"
                      : "text-on-surface-variant group-hover:text-primary",
                  )}
                >
                  {step.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="rounded-xl border border-primary/10 bg-surface-container-low p-5">
            <div className="mb-2 flex items-center justify-between text-label-sm">
              <span className="font-label-bold text-primary">Listing completeness</span>
              <span className="font-bold text-primary">{completionScore}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completionScore}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      <div className="space-y-8 pb-32 lg:w-3/4">
        {error && (
          <div className="rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-md text-on-error-container">
            {error}
          </div>
        )}

        <Section id="company" icon="corporate_fare" title="1. Company">
          <CompanyAutocomplete
            value={form.companySearch}
            selectedCompanyId={form.companyId || undefined}
            onQueryChange={(companySearch) => patch({ companySearch })}
            onSelect={(company) =>
              patch({ companyId: company.id, companySearch: company.name })
            }
            onClear={() => patch({ companyId: "" })}
            required
            createHref={isAdmin ? "/admin/companies" : "/employer/companies/new"}
          />
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
              {RECRUITER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </Section>

        <Section id="basics" icon="work" title="2. Job Basic Info">
          <DatalistField
            label="Job title"
            listId="job-title-list"
            options={JOB_TITLE_SUGGESTIONS}
            value={form.title}
            onChange={(title) => patch({ title })}
            placeholder="e.g. Senior Software Engineer"
            required
          />
          <DatalistField
            label="Category"
            listId="category-list"
            options={CATEGORY_SUGGESTIONS}
            value={form.category}
            onChange={(category) => patch({ category })}
            placeholder="e.g. IT"
          />
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
        </Section>

        <Section id="employment" icon="schedule" title="3. Employment Type">
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
        </Section>

        <Section id="location" icon="location_on" title="4. Location">
          <DatalistField
            label="City / district"
            listId="city-list"
            options={SRI_LANKA_DISTRICTS}
            value={form.city}
            onChange={(city) => patch({ city })}
            placeholder="e.g. Colombo"
          />
        </Section>

        <Section id="salary" icon="payments" title="5. Salary Information">
          <ChipGroup
            label="Salary type"
            options={SALARY_TYPES}
            value={form.salaryType as (typeof SALARY_TYPES)[number]}
            onChange={(salaryType) => patch({ salaryType })}
          />
          {form.salaryType !== "Negotiable" && (
            <div className="grid gap-6 md:grid-cols-3">
              {form.salaryType === "Range" && (
                <>
                  <div className="space-y-2">
                    <label className={labelClass}>Min salary (monthly)</label>
                    <input
                      type="number"
                      value={form.salaryMin}
                      onChange={(e) => patch({ salaryMin: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Max salary (monthly)</label>
                    <input
                      type="number"
                      value={form.salaryMax}
                      onChange={(e) => patch({ salaryMax: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </>
              )}
              {form.salaryType === "Fixed" && (
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Salary amount (monthly)</label>
                  <input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => patch({ salaryMin: e.target.value, salaryMax: e.target.value })}
                    className={inputClass}
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className={labelClass}>Currency</label>
                <select
                  value={form.salaryCurrency}
                  onChange={(e) => patch({ salaryCurrency: e.target.value })}
                  className={inputClass}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </Section>

        <Section id="requirements" icon="school" title="6. Requirements">
          <div className="space-y-2">
            <label className={labelClass}>Experience level</label>
            <select
              value={form.experienceLevel}
              onChange={(e) => patch({ experienceLevel: e.target.value })}
              className={inputClass}
            >
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
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
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <span className={labelClass}>Age requirement (years)</span>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              Optional. Leave blank for no limit. You can set a starting age only, an ending age only, or both.
            </p>
          </div>
        </Section>

        <Section id="details" icon="description" title="7. Job Details">
          <div className="space-y-2">
            <label className={labelClass}>Job description</label>
            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Overview of the role, team, and impact…"
              className={cn(inputClass, "resize-y")}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Responsibilities</label>
            <textarea
              rows={5}
              value={form.responsibilities}
              onChange={(e) => patch({ responsibilities: e.target.value })}
              placeholder="Bullet-style responsibilities (one per line)…"
              className={cn(inputClass, "resize-y")}
            />
          </div>
          <TagInput
            label="Required skills / target expertise"
            tags={form.requiredSkills}
            onChange={(requiredSkills) => patch({ requiredSkills })}
            placeholder="Type skill and press Enter"
          />
          <TagInput
            label="Nice-to-have skills (optional)"
            tags={form.niceToHaveSkills}
            onChange={(niceToHaveSkills) => patch({ niceToHaveSkills })}
            placeholder="Optional skills"
          />
        </Section>

        <Section id="application" icon="send" title="8. Application Settings">
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
              { key: "applyViaExternalLink" as const, label: "External link (ATS / form / website)" },
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
                placeholder="careers@company.com"
                className={inputClass}
              />
            </div>
          )}
          {form.applyViaExternalLink && (
            <div className="space-y-2">
              <label className={labelClass}>External application URL</label>
              <input
                type="url"
                value={form.applicationExternalUrl}
                onChange={(e) => patch({ applicationExternalUrl: e.target.value })}
                placeholder="https://"
                className={inputClass}
              />
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
        </Section>

        <Section id="media" icon="upload_file" title="9. Media Upload">
          <JobListingMediaUploader
            jobDocumentName={form.jobDocumentName}
            vacancyArtworkName={form.vacancyArtworkName}
            onJobDocumentChange={(jobDocumentName) => patch({ jobDocumentName })}
            onVacancyArtworkChange={(vacancyArtworkName) => patch({ vacancyArtworkName })}
            disabled={submitting}
          />
        </Section>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant pt-8">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(false)}
            className="rounded-lg px-6 py-3 font-label-bold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save as draft"}
          </button>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="rounded-lg bg-primary px-10 py-3 font-label-bold text-on-primary shadow-lg transition-all hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : isAdmin ? "Publish listing" : "Submit for review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
