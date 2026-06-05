"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { getAdminJob, getAdminJobs } from "@/lib/api/admin";
import type { Job } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function fetchPublishedJobSuggestions(query: string): Promise<Job[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const seen = new Set<string>();
  const results: Job[] = [];

  const add = (job: Job) => {
    if (job.status !== "PUBLISHED" || seen.has(job.id)) return;
    seen.add(job.id);
    results.push(job);
  };

  if (UUID_RE.test(q)) {
    try {
      const job = await getAdminJob(q);
      add(job);
    } catch {
      /* not found */
    }
  }

  try {
    const res = await getAdminJobs({ q, status: "PUBLISHED", limit: 8 });
    res.items.forEach(add);
  } catch {
    /* ignore */
  }

  return results.slice(0, 8);
}

type PublishedJobSearchFieldProps = {
  selectedJob: Job | null;
  onSelect: (job: Job) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
};

export function PublishedJobSearchField({
  selectedJob,
  onSelect,
  onClear,
  disabled,
  className,
}: PublishedJobSearchFieldProps) {
  const inputId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedJob && !query) {
      setQuery(selectedJob.title);
    }
  }, [selectedJob, query]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [suggestions]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (disabled) return;
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    if (selectedJob && q === selectedJob.title) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      void fetchPublishedJobSuggestions(q).then((items) => {
        if (!cancelled) {
          setSuggestions(items);
          setLoading(false);
        }
      });
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, disabled, selectedJob]);

  const pick = (job: Job) => {
    onSelect(job);
    setQuery(job.title);
    setOpen(false);
    setSuggestions([]);
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
      const item = suggestions[highlightIndex];
      if (item) pick(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown =
    open && !disabled && (loading || suggestions.length > 0 || query.trim().length >= 2);

  return (
    <div ref={wrapperRef} className={cn("relative w-full min-w-0", className)}>
      <label className="mb-2 block font-label-bold" htmlFor={inputId}>
        Find published job
      </label>
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          id={inputId}
          type="search"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (selectedJob && e.target.value !== selectedJob.title) {
              onClear?.();
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Job ID or title…"
          autoComplete="off"
          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-3 pl-10 pr-10 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:opacity-60"
        />
        {selectedJob && !disabled && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onClear?.();
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            aria-label="Clear selection"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        )}
      </div>
      <p className="mt-1 text-label-sm text-on-surface-variant">
        Search by job ID or title. Only published listings can be sponsored.
      </p>

      {showDropdown && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg"
        >
          {loading && (
            <li className="px-4 py-3 text-label-sm text-on-surface-variant">Searching…</li>
          )}
          {!loading &&
            suggestions.map((job, index) => (
              <li key={job.id} role="option" aria-selected={highlightIndex === index}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(job)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors",
                    highlightIndex === index
                      ? "bg-surface-container-high"
                      : "hover:bg-surface-container-low",
                  )}
                >
                  <p className="font-label-bold text-on-surface">{job.title}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {job.company.name}
                    {job.city ? ` · ${job.city}` : ""}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-on-surface-variant">
                    {job.id}
                  </p>
                </button>
              </li>
            ))}
          {!loading && suggestions.length === 0 && query.trim().length >= 2 && (
            <li className="px-4 py-3 text-label-sm text-on-surface-variant">
              No published jobs found.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
