"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { clearSession } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

type LogoutLinkProps = {
  className?: string;
};

export function LogoutLink({ className }: LogoutLinkProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        clearSession();
        router.replace("/");
      }}
      className={cn(
        "flex w-full items-center gap-3 p-2 text-on-primary-container transition-colors hover:text-error",
        className,
      )}
    >
      <Icon name="logout" />
      <span className="font-label-bold">Logout</span>
    </button>
  );
}
