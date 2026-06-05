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
  selectedPendingReview?: boolean;
  onQueryChange: (query: string) => void;
  onSelect: (company: CompanySuggestion) => void;
  onClear?: () => void;
  placeholder?: string;
  required?: boolean;
  createHref?: string;
  showCreateLink?: boolean;
};

export function CompanyAutocomplete({
  label = "Company",
  value,
  selectedCompanyId,
  selectedPendingReview = false,
  onQueryChange,
  onSelect,
  onClear,
  placeholder = "Start typing a company name…",
  required,
  createHref = "/employer/companies/new",
  showCreateLink = true,
}: CompanyAutocompleteProps) {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);

  useEffect(() => {
    if (!value.trim() || value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const results = await suggestCompanies(value, controller.signal);
        if (controller.signal.aborted) return;
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
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

  const showCreateLinkOption = showCreateLink && value.trim().length >= 2 && !selectedCompanyId;
  const showDropdown = open && (loading || suggestions.length > 0);

  return (
    <div ref={wrapperRef} className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <label className="font-label-bold text-on-surface-variant" htmlFor={listId}>
          {label}
        </label>
        {showCreateLinkOption && (
          <p className="text-label-sm text-on-surface-variant">
            Company doesn&apos;t exist?{" "}
            <Link
              href={`${createHref}${createHref.includes("?") ? "&" : "?"}name=${encodeURIComponent(value.trim())}`}
              className="font-label-bold text-primary underline-offset-2 hover:underline"
            >
              Create New Company
            </Link>
          </p>
        )}
      </div>
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
          <span
            className={cn(
              "absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
              selectedPendingReview
                ? "bg-tertiary-container text-on-tertiary-container"
                : "bg-secondary-container text-on-secondary-container",
            )}
          >
            <Icon name={selectedPendingReview ? "hourglass_top" : "check_circle"} className="text-[14px]" />
            {selectedPendingReview ? "Pending review" : "Selected"}
          </span>
        )}
        {showDropdown && (
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
                      {company.pendingReview ? (
                        <span className="rounded bg-tertiary-container px-1.5 py-0.5 text-[10px] font-bold uppercase text-on-tertiary-container">
                          Pending review
                        </span>
                      ) : company.verified ? (
                        <span className="rounded bg-secondary-container px-1.5 py-0.5 text-[10px] font-bold uppercase text-on-secondary-container">
                          Verified
                        </span>
                      ) : null}
                      {!company.pendingReview && (
                        <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
                          {company.matchType}
                        </span>
                      )}
                    </div>
                    <p className="text-label-sm text-on-surface-variant">
                      {company.pendingReview
                        ? "Your submission — visible only to you until approved"
                        : [company.industry, company.location].filter(Boolean).join(" • ") ||
                          "Company profile"}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
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
