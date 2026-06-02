import { cn } from "@/lib/utils";

type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
};

export function Icon({ name, className, filled }: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined shrink-0",
        filled && "material-symbols-outlined--filled",
        className,
      )}
      aria-hidden
    >
      {name}
    </span>
  );
}
