"use client";

import { FormSearchAutocomplete } from "@/components/jobs/form-search-autocomplete";
import { ApplicationDeadlinePicker } from "@/components/ui/application-deadline-picker";
import {
  CURRENCIES,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  SALARY_TYPES,
  SRI_LANKA_DISTRICTS,
  WORK_ARRANGEMENTS,
} from "@/lib/jobs/post-job.constants";
import { useJobCategories } from "@/lib/jobs/use-job-categories";
import type { Job } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export type AdminJobEditValues = {
  title: string;
  category: string;
  employmentType: string;
  workArrangement: string;
  experienceLevel: string;
  educationRequirement: string;
  city: string;
  salaryType: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  description: string;
  responsibilities: string;
  requirements: string;
  applicationDeadline: string;
};

const inputClass =
  "w-full rounded-lg border border-outline-variant px-4 py-3 font-body-md outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20";
const labelClass = "font-label-bold text-on-surface-variant";

export function jobToEditValues(job: Job): AdminJobEditValues {
  return {
    title: job.title ?? "",
    category: job.category ?? "",
    employmentType: job.employmentType ?? "Full Time",
    workArrangement: job.workArrangement ?? "Hybrid",
    experienceLevel: job.experienceLevel ?? "",
    educationRequirement: job.educationRequirement ?? "",
    city: job.city ?? "",
    salaryType: job.salaryMin == null && job.salaryMax == null ? "Negotiable" : "Range",
    salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
    salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
    salaryCurrency: "LKR",
    description: job.description ?? "",
    responsibilities: job.responsibilities ?? "",
    requirements: job.requirements ?? "",
    applicationDeadline: job.applicationDeadline?.slice(0, 10) ?? "",
  };
}

export function editValuesToApiBody(values: AdminJobEditValues) {
  return {
    title: values.title.trim(),
    category: values.category.trim() || undefined,
    employmentType: values.employmentType,
    workArrangement: values.workArrangement,
    experienceLevel: values.experienceLevel || undefined,
    educationRequirement: values.educationRequirement || undefined,
    city: values.city.trim() || undefined,
    salaryType: values.salaryType,
    salaryCurrency: values.salaryCurrency,
    salaryMin:
      values.salaryType === "Negotiable"
        ? undefined
        : values.salaryMin
          ? Number(values.salaryMin)
          : undefined,
    salaryMax:
      values.salaryType === "Negotiable"
        ? undefined
        : values.salaryMax
          ? Number(values.salaryMax)
          : undefined,
    description: values.description.trim(),
    responsibilities: values.responsibilities.trim() || undefined,
    requirements: values.requirements.trim() || undefined,
    applicationDeadline: values.applicationDeadline || undefined,
  };
}

export function mergeJobPreview(job: Job, values: AdminJobEditValues): Job {
  const salaryMin =
    values.salaryType === "Negotiable"
      ? null
      : values.salaryMin
        ? Number(values.salaryMin)
        : null;
  const salaryMax =
    values.salaryType === "Negotiable"
      ? null
      : values.salaryMax
        ? Number(values.salaryMax)
        : null;

  return {
    ...job,
    title: values.title.trim() || job.title,
    category: values.category.trim() || null,
    employmentType: values.employmentType,
    workArrangement: values.workArrangement,
    experienceLevel: values.experienceLevel || null,
    educationRequirement: values.educationRequirement || null,
    city: values.city.trim() || null,
    location:
      [values.city.trim(), values.workArrangement].filter(Boolean).join(" • ") ||
      job.location,
    salaryMin,
    salaryMax,
    description: values.description.trim() || job.description,
    responsibilities: values.responsibilities.trim() || null,
    requirements: values.requirements.trim() || null,
    applicationDeadline: values.applicationDeadline
      ? new Date(values.applicationDeadline).toISOString()
      : job.applicationDeadline,
  };
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
              "rounded-lg px-3 py-2 text-label-sm font-bold transition-all",
              value === opt
                ? "bg-secondary text-on-secondary"
                : "border border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

type AdminJobEditFormProps = {
  values: AdminJobEditValues;
  onChange: (patch: Partial<AdminJobEditValues>) => void;
  saving?: boolean;
  saveError?: string | null;
  saveSuccess?: boolean;
  onSave: () => void;
};

export function AdminJobEditForm({
  values,
  onChange,
  saving,
  saveError,
  saveSuccess,
  onSave,
}: AdminJobEditFormProps) {
  const { names: categoryOptions } = useJobCategories();

  return (
    <div className="space-y-6 rounded-lg border border-outline-variant bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-headline-md text-on-surface">Edit listing</h3>
        <p className="mt-1 text-label-sm text-on-surface-variant">
          Update fields before approving. Changes preview live on the right.
        </p>
      </div>

      {saveError && (
        <p className="rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-label-sm text-error">
          {saveError}
        </p>
      )}
      {saveSuccess && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-label-sm text-green-800">
          Changes saved.
        </p>
      )}

      <div className="space-y-2">
        <label className={labelClass} htmlFor="admin-edit-title">
          Job title
        </label>
        <input
          id="admin-edit-title"
          value={values.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className={inputClass}
        />
      </div>

      <FormSearchAutocomplete
        label="Category"
        options={categoryOptions}
        value={values.category}
        onChange={(category) => onChange({ category })}
        placeholder="Search categories…"
        maxSuggestions={10}
      />

      <ChipGroup
        label="Employment type"
        options={JOB_TYPES}
        value={values.employmentType as (typeof JOB_TYPES)[number]}
        onChange={(employmentType) => onChange({ employmentType })}
      />

      <ChipGroup
        label="Work arrangement"
        options={WORK_ARRANGEMENTS}
        value={values.workArrangement as (typeof WORK_ARRANGEMENTS)[number]}
        onChange={(workArrangement) => onChange({ workArrangement })}
      />

      <FormSearchAutocomplete
        label="City / district"
        options={SRI_LANKA_DISTRICTS}
        value={values.city}
        onChange={(city) => onChange({ city })}
        placeholder="e.g. Colombo"
      />

      <div className="space-y-2">
        <label className={labelClass} htmlFor="admin-edit-experience">
          Experience level
        </label>
        <select
          id="admin-edit-experience"
          value={values.experienceLevel}
          onChange={(e) => onChange({ experienceLevel: e.target.value })}
          className={inputClass}
        >
          <option value="">Select level</option>
          {EXPERIENCE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="admin-edit-education">
          Education requirement
        </label>
        <select
          id="admin-edit-education"
          value={values.educationRequirement}
          onChange={(e) => onChange({ educationRequirement: e.target.value })}
          className={inputClass}
        >
          <option value="">Select education</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <ChipGroup
        label="Salary type"
        options={SALARY_TYPES}
        value={values.salaryType as (typeof SALARY_TYPES)[number]}
        onChange={(salaryType) => onChange({ salaryType })}
      />

      {values.salaryType !== "Negotiable" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className={labelClass}>Min salary</label>
            <input
              type="number"
              min={0}
              value={values.salaryMin}
              onChange={(e) => onChange({ salaryMin: e.target.value })}
              className={inputClass}
            />
          </div>
          {values.salaryType === "Range" && (
            <div className="space-y-2">
              <label className={labelClass}>Max salary</label>
              <input
                type="number"
                min={0}
                value={values.salaryMax}
                onChange={(e) => onChange({ salaryMax: e.target.value })}
                className={inputClass}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className={labelClass}>Currency</label>
            <select
              value={values.salaryCurrency}
              onChange={(e) => onChange({ salaryCurrency: e.target.value })}
              className={inputClass}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className={labelClass} htmlFor="admin-edit-description">
          Job description
        </label>
        <textarea
          id="admin-edit-description"
          rows={5}
          value={values.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className={cn(inputClass, "resize-y")}
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="admin-edit-responsibilities">
          Responsibilities
        </label>
        <textarea
          id="admin-edit-responsibilities"
          rows={4}
          value={values.responsibilities}
          onChange={(e) => onChange({ responsibilities: e.target.value })}
          placeholder="One item per line"
          className={cn(inputClass, "resize-y")}
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="admin-edit-requirements">
          Requirements
        </label>
        <textarea
          id="admin-edit-requirements"
          rows={4}
          value={values.requirements}
          onChange={(e) => onChange({ requirements: e.target.value })}
          placeholder="One item per line"
          className={cn(inputClass, "resize-y")}
        />
      </div>

      <ApplicationDeadlinePicker
        value={values.applicationDeadline}
        onChange={(applicationDeadline) => onChange({ applicationDeadline })}
      />

      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-secondary/30 bg-secondary/10 py-3 font-label-bold text-secondary transition-all hover:bg-secondary/15 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
