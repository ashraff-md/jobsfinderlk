"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { SRI_LANKA_DISTRICTS } from "@/lib/jobs/post-job.constants";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-outline-variant py-3 pl-10 pr-4 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

function matchesQuery(option: string, query: string) {
  return option.toLowerCase().includes(query.trim().toLowerCase());
}

type CitySearchFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options?: readonly string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
};

export function CitySearchField({
  label = "City",
  value,
  onChange,
  options = SRI_LANKA_DISTRICTS,
  placeholder = "Search city or district…",
  required,
  className,
}: CitySearchFieldProps) {
  const inputId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const suggestions = useMemo(() => {
    const query = value.trim();
    const filtered = query
      ? options.filter((option) => matchesQuery(option, query))
      : [...options];
    return filtered.slice(0, 10);
  }, [options, value]);

  const showDropdown = open && (suggestions.length > 0 || value.trim().length > 0);

  useEffect(() => {
    setHighlightIndex(0);
  }, [value, suggestions.length]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectOption = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = suggestions[highlightIndex];
      if (pick) selectOption(pick);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={cn("w-full min-w-0 space-y-2", className)}>
      <label className="font-label-bold text-on-surface-variant" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative w-full min-w-0">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline"
        />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className={inputClass}
        />
        {showDropdown && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-outline-variant bg-white py-1 shadow-lg"
          >
            {suggestions.map((option, index) => (
              <li key={option} role="option" aria-selected={index === highlightIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(option)}
                  className={cn(
                    "flex w-full px-4 py-2.5 text-left text-label-sm transition-colors",
                    index === highlightIndex
                      ? "bg-surface-container-low font-medium text-primary"
                      : "text-on-surface hover:bg-surface-container-low",
                  )}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        )}
        {showDropdown && value.trim() && suggestions.length === 0 && (
          <p className="absolute z-20 mt-1 w-full rounded-lg border border-outline-variant bg-white px-4 py-3 text-label-sm text-on-surface-variant shadow-lg">
            No matching cities
          </p>
        )}
      </div>
    </div>
  );
}
