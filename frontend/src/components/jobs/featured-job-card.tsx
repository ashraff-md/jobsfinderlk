import Link from "next/link";
import type { FeaturedJobCardItem } from "@/lib/jobs/featured-jobs";
import { cn } from "@/lib/utils";

type FeaturedJobCardProps = {
  job: FeaturedJobCardItem;
  ctaHref?: string;
  ctaLabel?: string;
  /** Max lines for title before ellipsis (e.g. 3 for sponsored row on /jobs) */
  titleLineClamp?: number;
};

export function FeaturedJobCard({
  job,
  ctaHref = "/jobs",
  ctaLabel = "View Brief",
  titleLineClamp,
}: FeaturedJobCardProps) {
  return (
    <div className="group relative flex flex-col rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-5 transition-all hover:border-primary">
      <div className="absolute right-4 top-4">
        <span
          className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${job.badgeClass}`}
        >
          {job.badge}
        </span>
      </div>
      <div className="mb-4 pr-16">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded border border-outline-variant/30 bg-surface-container-low">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Corporate logo" className="h-7 w-7 object-contain" src={job.logo} />
        </div>
        <h3
          className={cn(
            "mb-0.5 text-base font-bold leading-snug text-primary",
            titleLineClamp === 2 && "line-clamp-2",
            titleLineClamp === 3 && "line-clamp-3",
            titleLineClamp === 4 && "line-clamp-4",
          )}
        >
          {job.title}
        </h3>
        <p className="text-xs font-label-bold text-on-surface-variant">{job.company}</p>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-surface-container-low px-2 py-1 text-[10px] font-label-bold text-primary/70"
          >
            {tag}
          </span>
        ))}
      </div>
      <Link
        href={job.href ?? ctaHref}
        className="mt-auto w-full rounded-lg border border-primary py-2 text-center text-xs font-label-bold text-primary transition-all hover:bg-primary hover:text-on-primary"
      >
        {job.href ? "View role" : ctaLabel}
      </Link>
    </div>
  );
}
