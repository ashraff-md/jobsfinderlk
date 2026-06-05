import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type VerificationStatusBadgeProps = {
  verified: boolean;
  className?: string;
  onVerify?: () => void;
  type?: "email" | "phone";
};

const verifiedClassName =
  "inline-flex items-center gap-1.5 text-label-sm font-bold text-secondary";

const verifyClassName =
  "inline-flex items-center gap-1.5 text-label-sm font-bold text-primary transition-opacity hover:opacity-80";

export function VerificationStatusBadge({
  verified,
  className,
  onVerify,
  type = "email",
}: VerificationStatusBadgeProps) {
  if (verified) {
    return (
      <span className={cn(verifiedClassName, className)}>
        <Icon name="verified" className="text-[15px]" filled />
        Verified
      </span>
    );
  }

  const label = (
    <>
      <Icon name={type === "phone" ? "smartphone" : "mark_email_unread"} className="text-[15px]" />
      Verify
    </>
  );

  if (!onVerify) {
    return <span className={cn(verifyClassName, className)}>{label}</span>;
  }

  return (
    <button
      type="button"
      onClick={onVerify}
      className={cn(verifyClassName, "outline-none", className)}
    >
      {label}
    </button>
  );
}
