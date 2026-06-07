"use client";

import { FilterMultiSearchAutocomplete } from "@/components/jobs/filter-multi-search-autocomplete";
import {
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  type JobSearchFilters,
  SRI_LANKA_DISTRICTS,
  WORK_ARRANGEMENTS,
} from "@/lib/jobs/job-search-filters";
import { useJobCategories } from "@/lib/jobs/use-job-categories";

const labelClass =
  "block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant";

const chipIdleClass =
  "rounded border border-outline-variant px-3 py-1.5 text-label-sm text-on-surface-variant transition-all hover:border-primary hover:text-primary";
const chipSelectedClass =
  "rounded bg-primary px-3 py-1.5 text-label-sm font-bold text-on-primary";

function FilterChipGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-8">
      <span className={`${labelClass} mb-3`}>{label}</span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("")}
          className={!value ? chipSelectedClass : chipIdleClass}
        >
          All
        </button>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={value === option ? chipSelectedClass : chipIdleClass}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

type JobSearchFiltersSidebarProps = {
  filters: JobSearchFilters;
  hasUnappliedChanges?: boolean;
  onChange: (patch: Partial<JobSearchFilters>) => void;
  onApply: () => void;
  onReset: () => void;
};

export function JobSearchFiltersSidebar({
  filters,
  hasUnappliedChanges = false,
  onChange,
  onApply,
  onReset,
}: JobSearchFiltersSidebarProps) {
  const { names: categoryOptions } = useJobCategories();
  const salaryValue = filters.salaryMin ? Number(filters.salaryMin) : 50000;

  return (
    <div className="job-card-shadow rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-[20px] font-semibold text-primary">Filters</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-label-sm font-bold text-secondary hover:underline"
        >
          Reset All
        </button>
      </div>

      <FilterMultiSearchAutocomplete
        label="Location / District"
        values={filters.cities}
        options={SRI_LANKA_DISTRICTS}
        onChange={(cities) => onChange({ cities })}
        placeholder="Search districts…"
      />

      <FilterMultiSearchAutocomplete
        label="Category"
        values={filters.categories}
        options={categoryOptions}
        onChange={(categories) => onChange({ categories })}
        placeholder="Search categories…"
      />

      <div className="mb-8">
        <label className={`${labelClass} mb-3`}>Minimum salary (monthly, LKR)</label>
        <div className="px-2">
          <input
            type="range"
            min={50000}
            max={1000000}
            step={10000}
            value={salaryValue}
            onChange={(e) =>
              onChange({ salaryMin: Number(e.target.value) <= 50000 ? "" : e.target.value })
            }
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-container accent-primary"
          />
          <div className="mt-3 flex justify-between text-label-sm text-outline">
            <span>Any</span>
            <span className="font-bold text-primary">
              {filters.salaryMin
                ? `LKR ${Number(filters.salaryMin).toLocaleString()}+`
                : "No minimum"}
            </span>
            <span>1M+</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className={`${labelClass} mb-3`} htmlFor="filter-age">
          Your age (years)
        </label>
        <input
          id="filter-age"
          type="number"
          min={16}
          max={70}
          placeholder="e.g. 28"
          value={filters.age}
          onChange={(e) => onChange({ age: e.target.value })}
          className="w-full rounded border border-outline-variant bg-surface-container-low px-4 py-3 text-body-md outline-none transition-all [appearance:textfield] focus:border-primary focus:ring-2 focus:ring-primary/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>

      <FilterChipGroup
        label="Experience level"
        value={filters.experienceLevel}
        options={EXPERIENCE_LEVELS}
        onChange={(experienceLevel) => onChange({ experienceLevel })}
      />

      <FilterChipGroup
        label="Education requirement"
        value={filters.educationRequirement}
        options={EDUCATION_LEVELS}
        onChange={(educationRequirement) => onChange({ educationRequirement })}
      />

      <FilterChipGroup
        label="Work arrangement"
        value={filters.workArrangement}
        options={WORK_ARRANGEMENTS}
        onChange={(workArrangement) => onChange({ workArrangement })}
      />

      <FilterChipGroup
        label="Employment type"
        value={filters.employmentType}
        options={JOB_TYPES}
        onChange={(employmentType) => onChange({ employmentType })}
      />

      <button
        type="button"
        onClick={onApply}
        disabled={!hasUnappliedChanges}
        className="w-full rounded-lg bg-primary py-3 text-label-sm font-bold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Apply filters
      </button>
    </div>
  );
}
