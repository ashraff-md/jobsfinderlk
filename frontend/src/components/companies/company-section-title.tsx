import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CompanySectionTitleProps = {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
};

export function CompanySectionTitle({
  title,
  eyebrow,
  action,
  className,
  compact = false,
}: CompanySectionTitleProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", compact ? "mb-4" : "mb-stack-lg", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 font-label-bold text-[11px] uppercase tracking-[0.22em] text-secondary">
            {eyebrow}
          </p>
        ) : null}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "shrink-0 rounded-full bg-secondary",
              compact ? "h-8 w-1" : "h-10 w-1.5",
            )}
            aria-hidden
          />
          <h2
            className={cn(
              "font-extrabold tracking-tight text-navy-deep",
              compact ? "text-xl md:text-2xl" : "text-2xl md:text-[32px] md:leading-tight",
            )}
          >
            {title}
          </h2>
        </div>
      </div>
      {action ? <div className="shrink-0 pb-1">{action}</div> : null}
    </div>
  );
}

type CompanySidebarTitleProps = {
  title: string;
};

export function CompanySidebarTitle({ title }: CompanySidebarTitleProps) {
  return (
    <div className="mb-4 border-b border-outline-variant/60 pb-3">
      <h3 className="font-label-bold text-label-bold uppercase tracking-[0.14em] text-primary">
        {title}
      </h3>
    </div>
  );
}
