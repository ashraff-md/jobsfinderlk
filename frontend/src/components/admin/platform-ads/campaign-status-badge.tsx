import type { CampaignStatus } from "@/lib/platform-ads/admin-config";
import { cn } from "@/lib/utils";

const STYLES: Record<CampaignStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Scheduled: "bg-amber-100 text-amber-700",
  "Pending Review": "bg-surface-container-high text-on-surface-variant",
  Rejected: "bg-error-container text-on-error-container",
  Inactive: "bg-surface-container text-on-surface-variant",
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide",
        STYLES[status],
      )}
    >
      {status}
    </span>
  );
}
