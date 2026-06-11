"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { jobShareUrl, shareContent } from "@/lib/jobs/share-content";
import { cn } from "@/lib/utils";

type ShareJobButtonProps = {
  title: string;
  slug: string;
  className?: string;
  iconClassName?: string;
};

export function ShareJobButton({
  title,
  slug,
  className,
  iconClassName,
}: ShareJobButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    setFeedback(null);
    try {
      const result = await shareContent({
        title,
        url: jobShareUrl(slug),
        text: `Check out this role: ${title}`,
      });
      setFeedback(result === "copied" ? "Link copied" : "Shared");
      window.setTimeout(() => setFeedback(null), 2000);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void handleShare()}
        className={cn(
          "rounded-lg border border-outline-variant p-2 transition-colors hover:bg-surface-container-low",
          className,
        )}
        aria-label="Share job"
      >
        <Icon name="share" className={cn("text-[18px] text-on-surface-variant", iconClassName)} />
      </button>
      {feedback && (
        <span className="absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-navy-deep px-2 py-1 text-[10px] font-bold text-white">
          {feedback}
        </span>
      )}
    </div>
  );
}
