"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/icon";

const labelClass =
  "block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-4 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

type FilterMultiSearchAutocompleteProps = {
  label: string;
  values: string[];
  options: readonly string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

function matchesQuery(option: string, query: string) {
  return option.toLowerCase().includes(query.trim().toLowerCase());
}

export function FilterMultiSearchAutocomplete({
  label,
  values,
  options,
  onChange,
  placeholder = "Search…",
}: FilterMultiSearchAutocompleteProps) {
  const inputId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const unselected = useMemo(
    () => options.filter((option) => !values.includes(option)),
    [options, values],
  );

  const filteredUnselected = useMemo(() => {
    if (!query.trim()) return unselected;
    return unselected.filter((option) => matchesQuery(option, query));
  }, [unselected, query]);

  const suggestions = useMemo(() => filteredUnselected.slice(0, 8), [filteredUnselected]);

  const showDropdown = open && (suggestions.length > 0 || query.trim().length > 0);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, suggestions.length]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addValue = (option: string) => {
    if (!values.includes(option)) {
      onChange([...values, option]);
    }
    setQuery("");
    setOpen(false);
  };

  const removeValue = (option: string) => {
    onChange(values.filter((v) => v !== option));
  };

  const clearAll = () => {
    onChange([]);
    setQuery("");
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
      if (pick) addValue(pick);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-2">
        <label className={labelClass} htmlFor={inputId}>
          {label}
        </label>
        {values.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[10px] font-bold text-secondary hover:underline"
          >
            All
          </button>
        )}
      </div>

      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline"
        />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={inputClass}
        />
        {showDropdown && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg"
          >
            {suggestions.map((option, index) => (
              <li key={option} role="option" aria-selected={index === highlightIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addValue(option)}
                  className={
                    index === highlightIndex
                      ? "flex w-full bg-surface-container-low px-4 py-2.5 text-left text-label-sm font-medium text-primary"
                      : "flex w-full px-4 py-2.5 text-left text-label-sm text-on-surface transition-colors hover:bg-surface-container-low"
                  }
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        )}
        {showDropdown && query.trim() && suggestions.length === 0 && (
          <p className="absolute z-20 mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-label-sm text-on-surface-variant shadow-lg">
            No matches
          </p>
        )}
      </div>

      {values.length > 0 ? (
        <div className="mt-3 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto overscroll-y-contain pr-1">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded bg-primary py-0.5 pl-2 pr-1 text-[11px] font-bold text-on-primary"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(value)}
                className="rounded p-0.5 text-on-primary/80 transition-colors hover:bg-white/15 hover:text-on-primary"
                aria-label={`Remove ${value}`}
              >
                <Icon name="close" className="text-[14px]" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-label-sm text-on-surface-variant">All</p>
      )}
    </div>
  );
}
