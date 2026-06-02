"use client";

import { Icon } from "@/components/ui/icon";

type JobSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
};

export function JobSearchBar({ value, onChange, onSubmit, className }: JobSearchBarProps) {
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <div className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Icon name="search" className="ml-2 shrink-0 text-outline" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by role, company, or keyword..."
          className="min-w-0 flex-1 border-none bg-transparent px-2 py-3 font-body-md text-on-surface outline-none placeholder:text-outline/70"
          aria-label="Search jobs"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded p-2 text-outline transition-colors hover:bg-surface-container-low hover:text-primary"
            aria-label="Clear search"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        )}
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-primary px-6 py-3 font-label-bold text-on-primary transition-all hover:opacity-90"
        >
          Search
        </button>
      </div>
    </form>
  );
}
