"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

const labelClass = "font-label-bold text-on-surface-variant";

const inputClass =
  "w-full rounded-lg border border-outline-variant px-4 py-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

function matchesQuery(option: string, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return option.toLowerCase().includes(normalized);
}

type FormSearchAutocompleteProps = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxSuggestions?: number;
};

export function FormSearchAutocomplete({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
  maxSuggestions = 8,
}: FormSearchAutocompleteProps) {
  const inputId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const suggestions = useMemo(() => {
    const filtered = options.filter((option) => matchesQuery(option, value));
    return filtered.slice(0, maxSuggestions);
  }, [options, value, maxSuggestions]);

  const showDropdown = open && options.length > 0;

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
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightIndex((index) => (index + 1) % suggestions.length);
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
      }
      return;
    }

    if (e.key === "Enter") {
      if (suggestions.length > 0) {
        e.preventDefault();
        const pick = suggestions[highlightIndex];
        if (pick) selectOption(pick);
      }
      return;
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="space-y-2">
      <label className={labelClass} htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
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
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          className={inputClass}
        />
        {showDropdown && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-outline-variant bg-white py-1 shadow-lg"
          >
            {suggestions.map((option, index) => (
              <li key={option} role="option" aria-selected={index === highlightIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(option)}
                  className={
                    index === highlightIndex
                      ? "flex w-full bg-surface-container-low px-4 py-2.5 text-left text-body-md font-medium text-primary"
                      : "flex w-full px-4 py-2.5 text-left text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
                  }
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        )}
        {showDropdown && value.trim() && suggestions.length === 0 && (
          <p className="absolute z-20 mt-1 w-full rounded-lg border border-outline-variant bg-white px-4 py-3 text-label-sm text-on-surface-variant shadow-lg">
            No matches
          </p>
        )}
      </div>
    </div>
  );
}
