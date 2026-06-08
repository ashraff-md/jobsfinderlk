import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export const pricingShadow = "shadow-[0_24px_48px_-12px_rgba(13,28,46,0.08)]";

export const pricingCard =
  "rounded-xl border border-outline-variant bg-surface-container-lowest p-8 transition-colors hover:border-secondary";

export const pricingFeaturedCard =
  "relative rounded-xl border-2 border-secondary bg-surface-container-lowest p-8 scale-105";

export const pricingBadge =
  "inline-block rounded-full bg-secondary px-4 py-1 font-label-sm text-label-sm uppercase tracking-wider text-on-secondary";

export const pricingFeaturedBadge =
  "absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-secondary px-4 py-1 font-label-bold text-label-sm text-on-secondary";

export const pricingPricePrefix = "font-label-bold text-label-bold text-on-surface-variant";

export const pricingPriceAmount =
  "font-headline-xl text-headline-xl leading-none text-secondary";

export const pricingTablePrice =
  "font-headline-lg text-headline-lg leading-none text-secondary";

export const pricingBtnPrimary =
  "inline-block rounded-lg bg-secondary px-8 py-4 font-label-bold text-label-bold text-on-secondary shadow-lg transition-all hover:opacity-90 active:scale-95";

export const pricingBtnOutline =
  "inline-block rounded-lg border border-outline-variant px-8 py-4 font-label-bold text-label-bold text-on-surface transition-colors hover:bg-surface-container";

export const pricingBtnCard =
  "block w-full rounded-lg py-3 text-center font-label-bold text-label-bold transition-all";

export const pricingBtnCardDefault =
  "border-2 border-primary hover:bg-primary hover:text-on-primary";

export const pricingBtnCardFeatured = "bg-secondary text-on-secondary hover:opacity-90";

export const pricingToggle =
  "inline-flex rounded-lg bg-surface-container p-1";

export const pricingToggleActive =
  "rounded-md bg-surface-container-lowest px-6 py-2 font-label-bold text-label-sm text-secondary shadow-sm";

export const pricingToggleInactive =
  "rounded-md px-6 py-2 font-label-bold text-label-sm text-on-surface-variant transition-all hover:text-on-surface";

type PricingSectionProps = {
  id?: string;
  variant?: "default" | "muted";
  className?: string;
  children: ReactNode;
};

export function PricingSection({
  id,
  variant = "default",
  className,
  children,
}: PricingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        variant === "muted" &&
          "rounded-xl border border-outline-variant bg-surface-container-low p-stack-lg md:p-12",
        className,
      )}
    >
      {children}
    </section>
  );
}

type PricingSectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
};

export function PricingSectionHeader({
  title,
  description,
  className,
  children,
}: PricingSectionHeaderProps) {
  return (
    <div className={cn("mb-12 text-center", className)}>
      <h3 className="mb-4 font-headline-lg text-headline-lg text-on-surface">{title}</h3>
      {description && (
        <p className="mx-auto max-w-2xl font-body-md text-body-md text-on-surface-variant">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

type PricingHeroProps = {
  badge: string;
  title: ReactNode;
  description: string;
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
  visual: ReactNode;
};

export function PricingHero({
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
  visual,
}: PricingHeroProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low",
        pricingShadow,
      )}
    >
      <div className="grid grid-cols-1 items-center gap-12 p-stack-lg md:grid-cols-2 md:p-12">
        <div>
          <span className={cn(pricingBadge, "mb-6")}>{badge}</span>
          <h2 className="mb-6 font-headline-xl text-headline-xl leading-tight text-on-surface">
            {title}
          </h2>
          <p className="mb-8 max-w-xl font-body-lg text-body-lg text-on-surface-variant">
            {description}
          </p>
          <div className="flex flex-wrap gap-4">
            {primaryAction}
            {secondaryAction}
          </div>
        </div>
        <div className="relative">{visual}</div>
      </div>
    </div>
  );
}

type PricingCtaBandProps = {
  title: string;
  description: string;
  action: ReactNode;
  footnote?: string;
};

export function PricingCtaBand({ title, description, action, footnote }: PricingCtaBandProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant bg-surface-container p-stack-lg text-center md:p-16",
        pricingShadow,
      )}
    >
      <h3 className="mb-4 font-headline-lg text-headline-lg text-on-surface">{title}</h3>
      <p className="mx-auto mb-8 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
        {description}
      </p>
      {action}
      {footnote && (
        <p className="mt-6 font-label-sm text-label-sm text-on-surface-variant">{footnote}</p>
      )}
    </div>
  );
}

type PricingInfoCardProps = {
  icon: string;
  title: string;
  description: string;
  className?: string;
};

export function PricingInfoCard({ icon, title, description, className }: PricingInfoCardProps) {
  return (
    <div className={cn(pricingCard, "flex flex-col p-6", className)}>
      <Icon name={icon} className="mb-4 text-[32px] text-secondary" />
      <h4 className="mb-2 font-headline-md text-headline-md text-on-surface">{title}</h4>
      <p className="font-label-sm text-label-sm text-on-surface-variant">{description}</p>
    </div>
  );
}
