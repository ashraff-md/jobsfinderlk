"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { suggestCompanies } from "@/lib/api/companies";
import type { CompanySuggestion } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-outline-variant px-4 py-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

type CompanyAutocompleteProps = {
  label?: string;
  value: string;
  selectedCompanyId?: string;
  onQueryChange: (query: string) => void;
  onSelect: (company: CompanySuggestion) => void;
  onClear?: () => void;
  placeholder?: string;
  required?: boolean;
  createHref?: string;
};

export function CompanyAutocomplete({
  label = "Company",
  value,
  selectedCompanyId,
  onQueryChange,
  onSelect,
  onClear,
  placeholder = "Start typing a company name…",
  required,
  createHref = "/employer/companies/new",
}: CompanyAutocompleteProps) {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);

  useEffect(() => {
    if (!value.trim() || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const results = await suggestCompanies(value);
        setSuggestions(results);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showCreateLink = value.trim().length >= 2 && !selectedCompanyId;

  return (
    <div ref={wrapperRef} className="space-y-2">
      <label className="font-label-bold text-on-surface-variant" htmlFor={listId}>
        {label}
      </label>
      <div className="relative">
        <input
          id={listId}
          value={value}
          onChange={(e) => {
            onClear?.();
            onQueryChange(e.target.value);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className={inputClass}
        />
        {selectedCompanyId && (
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-secondary-container px-2 py-0.5 text-[11px] font-bold text-on-secondary-container">
            <Icon name="check_circle" className="text-[14px]" />
            Selected
          </span>
        )}
        {open && (loading || suggestions.length > 0) && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-outline-variant bg-white shadow-lg">
            {loading && (
              <p className="px-4 py-3 text-label-sm text-on-surface-variant">Searching…</p>
            )}
            {!loading &&
              suggestions.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => {
                    onSelect(company);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-3 border-b border-outline-variant/40 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-container-low"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-variant text-label-sm font-bold text-primary">
                    {company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-label-bold">{company.name}</span>
                      {company.verified && (
                        <span className="rounded bg-secondary-container px-1.5 py-0.5 text-[10px] font-bold uppercase text-on-secondary-container">
                          Verified
                        </span>
                      )}
                      <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
                        {company.matchType}
                      </span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant">
                      {[company.industry, company.location].filter(Boolean).join(" • ") ||
                        "Company profile"}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
      {showCreateLink && (
        <p className="text-label-sm text-on-surface-variant">
          Company doesn&apos;t exist?{" "}
          <Link
            href={`${createHref}?name=${encodeURIComponent(value.trim())}`}
            className="font-label-bold text-primary underline-offset-2 hover:underline"
          >
            Create New Company
          </Link>
        </p>
      )}
    </div>
  );
}

export function MatchBadge({ type }: { type: CompanySuggestion["matchType"] }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
        type === "exact" && "bg-secondary-container text-on-secondary-container",
        type === "domain" && "bg-primary-container text-on-primary-container",
        type === "phonetic" && "bg-tertiary-container text-on-tertiary-container",
        type === "fuzzy" && "bg-surface-container-high text-on-surface-variant",
      )}
    >
      {type}
    </span>
  );
}
