"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { shareContent } from "@/lib/jobs/share-content";
import { cn } from "@/lib/utils";

type ShareLinkButtonProps = {
  url: string;
  title: string;
  text?: string;
  label?: string;
  className?: string;
  showIcon?: boolean;
};

export function ShareLinkButton({
  url,
  title,
  text,
  label = "Share",
  className,
  showIcon = true,
}: ShareLinkButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    setFeedback(null);
    try {
      const result = await shareContent({ title, url, text });
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
          "flex items-center justify-center gap-2 rounded-xl border border-outline-variant py-3 font-label-bold text-primary-container transition-all hover:bg-surface-container",
          className,
        )}
      >
        {showIcon && <Icon name="share" />}
        {feedback ?? label}
      </button>
    </div>
  );
}
