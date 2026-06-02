"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  MAX_APPLICATION_DEADLINE_DAYS,
  applicationDeadlineError,
  daysFromToday,
  maxApplicationDeadlineDate,
  parseApplicationDeadline,
  startOfDay,
} from "@/lib/jobs/application-deadline";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const QUICK_OPTIONS = [
  { label: "+2 weeks", days: 14 },
  { label: "+1 month", days: 30 },
  { label: "Max (60 days)", days: MAX_APPLICATION_DEADLINE_DAYS },
] as const;

function toIso(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string) {
  const date = parseApplicationDeadline(value);
  if (!date) return "Select a closing date";
  return new Intl.DateTimeFormat("en-LK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildCalendarDays(viewMonth: Date) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ date: Date; inMonth: boolean }> = [];

  for (let i = startOffset - 1; i >= 0; i -= 1) {
    cells.push({
      date: new Date(year, month, -i),
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      inMonth: false,
    });
  }

  return cells;
}

type ApplicationDeadlinePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function ApplicationDeadlinePicker({
  value,
  onChange,
  disabled = false,
}: ApplicationDeadlinePickerProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => maxApplicationDeadlineDate(today), [today]);
  const selected = parseApplicationDeadline(value);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => selected ?? today);
  const [localError, setLocalError] = useState<string | null>(null);

  const remaining = value ? daysFromToday(value, today) : null;
  const maxDateLabel = formatDisplay(toIso(maxDate));

  useEffect(() => {
    if (selected) setViewMonth(selected);
  }, [value]);

  useEffect(() => {
    if (!value) {
      setLocalError(null);
      return;
    }
    setLocalError(applicationDeadlineError(value));
  }, [value, today]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const monthLabel = new Intl.DateTimeFormat("en-LK", {
    month: "long",
    year: "numeric",
  }).format(viewMonth);

  const cells = buildCalendarDays(viewMonth);

  const isSelectable = (date: Date) => {
    const day = startOfDay(date);
    return day >= today && day <= maxDate;
  };

  const selectDate = (date: Date) => {
    if (!isSelectable(date) || disabled) return;
    const iso = toIso(date);
    setLocalError(null);
    onChange(iso);
    setOpen(false);
  };

  const shiftMonth = (delta: number) => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const applyQuick = (days: number) => {
    const capped = Math.min(days, MAX_APPLICATION_DEADLINE_DAYS);
    const next = new Date(today);
    next.setDate(next.getDate() + capped);
    setLocalError(null);
    onChange(toIso(next));
    setViewMonth(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative space-y-3">
      <div className="min-w-0">
        <p className="font-label-bold text-on-surface-variant">Application deadline</p>
        <p className="text-[11px] text-on-surface-variant">
          Optional · today through {maxDateLabel} (max {MAX_APPLICATION_DEADLINE_DAYS} days)
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center gap-4 rounded-lg border bg-white px-4 py-4 text-left font-body-md outline-none transition-all",
          localError ? "border-error" : "border-outline-variant",
          !localError && (open ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"),
          disabled && "opacity-50",
        )}
      >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <Icon name="calendar_month" className="text-[26px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate font-label-bold",
                  value ? "text-on-surface" : "text-on-surface-variant",
                )}
              >
                {formatDisplay(value)}
              </p>
              {remaining !== null && remaining >= 0 && (
                <p className="mt-0.5 text-label-sm text-secondary">
                  {remaining === 0
                    ? "Closes today"
                    : `${remaining} day${remaining === 1 ? "" : "s"} remaining`}
                  {remaining === MAX_APPLICATION_DEADLINE_DAYS && " (maximum)"}
                </p>
              )}
            </div>
        <Icon
          name={open ? "expand_less" : "expand_more"}
          className="shrink-0 text-on-surface-variant"
        />
      </button>

      {localError && (
        <p className="text-label-sm text-error">{localError}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            disabled={disabled}
            onClick={() => applyQuick(option.days)}
            className="rounded-full bg-surface-container-low px-3 py-1.5 text-[11px] font-label-bold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary disabled:opacity-50"
          >
            {option.label}
          </button>
        ))}
        {value && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange("");
              setLocalError(null);
              setOpen(false);
            }}
            className="rounded-full bg-surface-container-low px-3 py-1.5 text-[11px] font-label-bold text-error transition-colors hover:bg-error-container/30 disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>

      {open && !disabled && (
        <div
          id={listId}
          className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5"
        >
          <div className="flex items-center justify-between border-b border-outline-variant/30 px-4 py-3">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
              aria-label="Previous month"
            >
              <Icon name="chevron_left" />
            </button>
            <p className="font-label-bold text-on-surface">{monthLabel}</p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
              aria-label="Next month"
            >
              <Icon name="chevron_right" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 px-3 pt-3">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-on-surface-variant"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 p-3 pt-1">
            {cells.map(({ date, inMonth }, index) => {
              const iso = toIso(date);
              const selectable = inMonth && isSelectable(date);
              const isPast = inMonth && startOfDay(date) < today;
              const isTooLate = inMonth && startOfDay(date) > maxDate;
              const isToday = toIso(date) === toIso(today);
              const isMaxDay = toIso(date) === toIso(maxDate);
              const isSelected = value === iso;

              return (
                <button
                  key={`${index}-${iso}`}
                  type="button"
                  disabled={!selectable}
                  onClick={() => selectDate(date)}
                  className={cn(
                    "flex h-9 w-full items-center justify-center rounded-lg text-label-sm font-medium transition-colors",
                    !inMonth && "invisible",
                    inMonth && (isPast || isTooLate) && "cursor-not-allowed text-outline/50",
                    selectable && !isSelected && "text-on-surface hover:bg-surface-container-low",
                    isToday && !isSelected && "ring-1 ring-secondary/40",
                    isMaxDay && !isSelected && "ring-1 ring-primary/30",
                    isSelected && "bg-primary font-label-bold text-on-primary",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="border-t border-outline-variant/30 bg-surface-container-lowest px-4 py-2.5 text-center text-[11px] text-on-surface-variant">
            Select today up to {MAX_APPLICATION_DEADLINE_DAYS} days ahead
          </div>
        </div>
      )}
    </div>
  );
}
