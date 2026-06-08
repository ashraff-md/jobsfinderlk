"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { suggestGovernmentOrganizations } from "@/lib/api/government-organizations";
import type { GovernmentOrganizationSuggestion } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-outline-variant px-4 py-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

type GovernmentOrganizationAutocompleteProps = {
  label?: string;
  value: string;
  selectedOrganizationId?: string;
  onQueryChange: (query: string) => void;
  onSelect: (organization: GovernmentOrganizationSuggestion) => void;
  onClear?: () => void;
  placeholder?: string;
  required?: boolean;
  excludeOrganizationId?: string;
};

export function GovernmentOrganizationAutocomplete({
  label = "Ministry/Department",
  value,
  selectedOrganizationId,
  onQueryChange,
  onSelect,
  onClear,
  placeholder = "Search registered government organizations…",
  required,
  excludeOrganizationId,
}: GovernmentOrganizationAutocompleteProps) {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GovernmentOrganizationSuggestion[]>([]);

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
        const results = await suggestGovernmentOrganizations(value, controller.signal);
        if (controller.signal.aborted) return;
        const filtered = excludeOrganizationId
          ? results.filter((item) => item.id !== excludeOrganizationId)
          : results;
        setSuggestions(filtered);
        setOpen(filtered.length > 0);
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
  }, [value, excludeOrganizationId]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasQuery = value.trim().length >= 2;
  const showDropdown = open && hasQuery && (loading || suggestions.length > 0);

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
          onFocus={() => {
            if (hasQuery && suggestions.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className={inputClass}
        />
        {selectedOrganizationId && (
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-secondary-container px-2 py-0.5 text-[11px] font-bold text-on-secondary-container">
            <Icon name="check_circle" className="text-[14px]" />
            Selected
          </span>
        )}
        {showDropdown && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-outline-variant bg-white shadow-lg">
            {loading && (
              <p className="px-4 py-3 text-label-sm text-on-surface-variant">Searching…</p>
            )}
            {!loading &&
              suggestions.map((organization) => (
                <button
                  key={organization.id}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onSelect(organization);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-3 border-b border-outline-variant/40 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-container-low"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-variant text-label-sm font-bold text-primary">
                    {(organization.shortName || organization.name).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-label-bold">{organization.name}</span>
                      <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
                        {organization.organizationType}
                      </span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant">
                      {organization.parent
                        ? `Under ${organization.parent.name}`
                        : [organization.district, organization.province]
                            .filter(Boolean)
                            .join(" • ") || "Government organization"}
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

export function GovOrgMatchBadge({
  type,
}: {
  type: GovernmentOrganizationSuggestion["matchType"];
}) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
        type === "exact" && "bg-secondary-container text-on-secondary-container",
        type === "phonetic" && "bg-tertiary-container text-on-tertiary-container",
        type === "fuzzy" && "bg-surface-container-high text-on-surface-variant",
      )}
    >
      {type}
    </span>
  );
}
