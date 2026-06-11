"use client";

import { type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type AdminFilterSelectOption = {
  value: string;
  label: string;
};

export type AdminFilterSelectConfig = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly AdminFilterSelectOption[];
  ariaLabel?: string;
};

type AdminFilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchId?: string;
  filters?: readonly AdminFilterSelectConfig[];
  onClear?: () => void;
  showClear?: boolean;
  children?: ReactNode;
  className?: string;
};

export const adminFilterSearchInputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";

export const adminFilterSelectClass =
  "shrink-0 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-label-sm outline-none focus:ring-secondary";

export const adminFilterClearButtonClass =
  "shrink-0 font-label-bold text-secondary hover:underline";

export function AdminFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  searchId,
  filters,
  onClear,
  showClear = false,
  children,
  className,
}: AdminFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-nowrap items-center gap-3 overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm",
        className,
      )}
    >
      <div className="relative min-w-[min(100%,280px)] flex-1">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline"
        />
        <input
          id={searchId}
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className={adminFilterSearchInputClass}
        />
      </div>
      {filters?.map((filter, index) => (
        <select
          key={filter.id ?? `filter-${index}`}
          id={filter.id}
          value={filter.value}
          onChange={(event) => filter.onChange(event.target.value)}
          aria-label={filter.ariaLabel}
          className={adminFilterSelectClass}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
      {children}
      {showClear && onClear ? (
        <button type="button" onClick={onClear} className={adminFilterClearButtonClass}>
          Clear
        </button>
      ) : null}
    </div>
  );
}
