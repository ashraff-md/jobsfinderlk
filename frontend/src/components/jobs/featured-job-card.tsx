import Link from "next/link";
import type { FeaturedJobCardItem } from "@/lib/jobs/featured-jobs";

type FeaturedJobCardProps = {
  job: FeaturedJobCardItem;
  ctaHref?: string;
  ctaLabel?: string;
};

export function FeaturedJobCard({
  job,
  ctaHref = "/jobs",
  ctaLabel = "View Brief",
}: FeaturedJobCardProps) {
  return (
    <div className="group relative flex flex-col rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-5 transition-all hover:border-primary">
      <div className="mb-4 flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded border border-outline-variant/30 bg-surface-container-low">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="h-full w-full object-contain" src={job.logo} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-3 text-base font-bold leading-snug text-primary">
            {job.title}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs font-label-bold text-on-surface-variant">
            {job.company}
          </p>
        </div>
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
