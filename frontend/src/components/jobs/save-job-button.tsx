"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  useCanSaveJobs,
  useOptionalSavedJobs,
} from "@/components/jobs/saved-jobs-provider";
import { getStoredUser } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import { cn } from "@/lib/utils";

type SaveJobButtonProps = {
  jobId: string;
  jobSlug?: string;
  className?: string;
  iconClassName?: string;
  filledWhenSaved?: boolean;
  showBorder?: boolean;
};

export function SaveJobButton({
  jobId,
  jobSlug,
  className,
  iconClassName,
  filledWhenSaved = true,
  showBorder = true,
}: SaveJobButtonProps) {
  const router = useRouter();
  const canSave = useCanSaveJobs();
  const savedJobs = useOptionalSavedJobs();
  const [busy, setBusy] = useState(false);
  const [hiddenForRole, setHiddenForRole] = useState(false);

  useEffect(() => {
    const role = getStoredUser()?.role;
    setHiddenForRole(Boolean(role && role !== "SEEKER"));
  }, []);

  if (hiddenForRole) {
    return null;
  }

  const saved = savedJobs?.isSaved(jobId) ?? false;
  const label = saved ? "Remove saved job" : "Save job";

  const handleClick = async () => {
    if (!canSave) {
      const returnUrl = jobSlug ? `/jobs/${jobSlug}` : undefined;
      router.push(signInPath("seeker", returnUrl));
      return;
    }

    if (!savedJobs || busy) return;

    setBusy(true);
    try {
      await savedJobs.toggleSave(jobId);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={busy}
      className={cn(
        "rounded-lg p-2 transition-colors hover:bg-surface-container-low disabled:opacity-60",
        showBorder && "border border-outline-variant",
        className,
      )}
      aria-label={label}
      aria-pressed={saved}
    >
      <Icon
        name="bookmark"
        filled={filledWhenSaved && saved}
        className={cn(
          saved ? "text-secondary" : "text-on-surface-variant",
          iconClassName,
        )}
      />
    </button>
  );
}
