"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function CheckoutPaymentOption({
  id,
  selected,
  onSelect,
  icon,
  title,
  badge,
  children,
}: {
  id: string;
  selected: boolean;
  onSelect: () => void;
  icon: string;
  title: string;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="relative">
      <input
        checked={selected}
        className="peer sr-only"
        id={id}
        name="payment_type"
        onChange={onSelect}
        type="radio"
      />
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer flex-col rounded-lg border border-outline-variant p-stack-md transition-all hover:bg-surface-container-low",
          selected && "border-secondary bg-surface-container-low",
        )}
      >
        <div className="mb-stack-md flex items-center justify-between">
          <div className="flex items-center gap-stack-md">
            <Icon name={icon} />
            <span className="font-label-bold text-label-bold">{title}</span>
          </div>
          {badge}
        </div>
        {children}
      </label>
    </div>
  );
}
