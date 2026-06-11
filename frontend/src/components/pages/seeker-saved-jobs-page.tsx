"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SeekerShell } from "@/components/layout/seeker-shell";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { SavedJobsProvider, useSavedJobs } from "@/components/jobs/saved-jobs-provider";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { formatSalary } from "@/lib/api/jobs";
import { getProfile } from "@/lib/api/auth";
import { getSavedJobs, type SavedJobEntry } from "@/lib/api/saved-jobs";
import { formatJobClosingDate } from "@/lib/jobs/application-deadline";
import {
  getJobEmployerLogo,
  getJobEmployerName,
  getJobLocationLabel,
} from "@/lib/jobs/job-employer-name";

function formatSavedAt(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Saved today";
  if (days === 1) return "Saved 1 day ago";
  if (days < 7) return `Saved ${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "Saved 1 week ago";
  return `Saved ${weeks} weeks ago`;
}

function SavedJobsContent() {
  const savedJobs = useSavedJobs();
  const [entries, setEntries] = useState<SavedJobEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Seeker");

  const loadSaved = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [saved, profile] = await Promise.all([getSavedJobs(), getProfile()]);
      setEntries(saved);
      setUserName(profile.seekerProfile?.fullName?.trim() || profile.email.split("@")[0] || "Seeker");
    } catch (err) {
      setEntries([]);
      setError(err instanceof ApiError ? err.message : "Failed to load saved jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const visibleEntries = entries.filter((entry) => savedJobs.isSaved(entry.job.id));

  return (
    <SeekerShell activeNav="saved" userName={userName}>
      <div className="mx-auto max-w-container-max">
        <div className="mb-stack-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary-container">Saved Jobs</h1>
          <p className="mt-2 font-body-md text-outline">
            Manage and track your bookmarked career opportunities.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-4 py-3 text-on-error-container">
            {error}
          </div>
        )}

        <div className="mb-16 grid grid-cols-1 gap-gutter xl:grid-cols-2">
          {loading ? (
            <p className="text-on-surface-variant">Loading saved jobs…</p>
          ) : visibleEntries.length === 0 ? (
            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center">
              <p className="text-on-surface-variant">You have not saved any jobs yet.</p>
              <Link
                href="/jobs"
                className="mt-4 inline-flex items-center gap-1 font-label-bold text-secondary hover:underline"
              >
                Browse jobs
                <Icon name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>
          ) : (
            visibleEntries.map(({ id, savedAt, job }) => {
              const employerName = getJobEmployerName(job);
              const employerLogo = getJobEmployerLogo(job);
              const location = getJobLocationLabel(job);

              return (
                <div
                  key={id}
                  className="professional-card group flex flex-col gap-6 rounded-lg p-6 transition-all hover:border-secondary md:flex-row"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-outline-variant bg-surface-container">
                    {employerLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" className="h-full w-full object-cover" src={employerLogo} />
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        {employerName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/jobs/${job.slug}`}
                          className="font-headline-md text-headline-md text-primary-container transition-colors group-hover:text-secondary"
                        >
                          {job.title}
                        </Link>
                        <p className="font-label-bold text-outline">{employerName}</p>
                      </div>
                      <SaveJobButton
                        jobId={job.id}
                        jobSlug={job.slug}
                        showBorder={false}
                        className="shrink-0 text-outline hover:text-error"
                        iconClassName="text-[22px]"
                      />
                    </div>
                    <div className="mb-6 flex flex-wrap gap-4">
                      <span className="flex items-center gap-1 text-label-sm text-outline">
                        <Icon name="location_on" className="text-[18px]" />
                        {location}
                      </span>
                      <span className="flex items-center gap-1 text-label-sm text-outline">
                        <Icon name="payments" className="text-[18px]" />
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                      <span className="flex items-center gap-1 text-label-sm text-outline">
                        <Icon name="schedule" className="text-[18px]" />
                        {formatSavedAt(savedAt)}
                      </span>
                      {job.applicationDeadline && (
                        <span className="flex items-center gap-1 text-label-sm text-outline">
                          <Icon name="event" className="text-[18px]" />
                          Closes {formatJobClosingDate(job.applicationDeadline)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {job.applyViaOneClick && (
                        <Link
                          href={`/jobs/${job.slug}#apply`}
                          className="rounded bg-primary-container px-6 py-2 font-label-bold text-white transition-all hover:opacity-90"
                        >
                          Quick Apply
                        </Link>
                      )}
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="rounded border border-primary-container px-6 py-2 font-label-bold text-primary-container transition-all hover:bg-surface-container"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && visibleEntries.length > 0 && (
          <section className="border-t border-outline-variant pt-12">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="mb-2 font-headline-lg text-headline-lg text-primary-container">
                  Keep exploring
                </h2>
                <p className="font-body-md text-outline">
                  Discover more roles that match your interests.
                </p>
              </div>
              <Link
                href="/jobs"
                className="flex items-center gap-1 font-label-bold text-secondary hover:underline"
              >
                Browse all jobs
                <Icon name="arrow_forward" className="text-[20px]" />
              </Link>
            </div>
          </section>
        )}
      </div>
    </SeekerShell>
  );
}

export function SeekerSavedJobsPage() {
  return (
    <SavedJobsProvider>
      <SavedJobsContent />
    </SavedJobsProvider>
  );
}
