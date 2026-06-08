"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FeaturedJobCard } from "@/components/jobs/featured-job-card";
import { Icon } from "@/components/ui/icon";
import { searchPublishedJobs } from "@/lib/api/jobs";
import { JOB_SLIDE_INTERVAL_MS } from "@/lib/jobs/featured-jobs";
import type { FeaturedJobCardItem } from "@/lib/jobs/featured-jobs";
import { buildJobCardSlides } from "@/lib/jobs/map-job-to-featured-card";

const CARDS_PER_SLIDE = 3;
const SLIDE_COUNT = 3;

type SimilarJobsCarouselProps = {
  excludeSlug: string;
};

export function SimilarJobsCarousel({ excludeSlug }: SimilarJobsCarouselProps) {
  const [slides, setSlides] = useState<FeaturedJobCardItem[][]>([]);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await searchPublishedJobs({
          limit: CARDS_PER_SLIDE * SLIDE_COUNT + 3,
        });
        const items = data.items.filter((j) => j.slug !== excludeSlug);
        const built = buildJobCardSlides(items, CARDS_PER_SLIDE, SLIDE_COUNT);
        if (!cancelled) {
          setSlides(built);
          setSlide(0);
        }
      } catch {
        if (!cancelled) setSlides([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [excludeSlug]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % slides.length);
    }, JOB_SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  useEffect(() => {
    if (slide >= slides.length && slides.length > 0) setSlide(0);
  }, [slide, slides.length]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-container border-t-primary" />
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-outline-variant py-12 text-center text-on-surface-variant">
        No similar roles to show right now.{" "}
        <Link href="/jobs" className="font-label-bold text-secondary hover:underline">
          Browse all jobs
        </Link>
        .
      </p>
    );
  }

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="w-full overflow-hidden">
        <div
          className="flex w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {slides.map((slideJobs, slideIndex) => (
            <div
              key={slideIndex}
              className="grid w-full min-w-full max-w-full shrink-0 basis-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {slideJobs.map((item) => (
                <FeaturedJobCard
                  key={item.href ?? `${item.title}-${slideIndex}`}
                  job={item}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Previous similar jobs"
            onClick={() => setSlide((current) => (current - 1 + slides.length) % slides.length)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant transition-all hover:border-primary hover:bg-primary hover:text-on-primary"
          >
            <Icon name="chevron_left" />
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={slide === index ? "true" : undefined}
                onClick={() => setSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  slide === index
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-outline-variant/60 hover:bg-primary/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next similar jobs"
            onClick={() => setSlide((current) => (current + 1) % slides.length)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant transition-all hover:border-primary hover:bg-primary hover:text-on-primary"
          >
            <Icon name="chevron_right" />
          </button>
        </div>
      )}
    </div>
  );
}
