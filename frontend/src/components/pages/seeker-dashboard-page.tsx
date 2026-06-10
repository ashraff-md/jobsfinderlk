"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SeekerShell } from "@/components/layout/seeker-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken, getProfile } from "@/lib/api/auth";
import { myApplications, formatSalary, searchPublishedJobs } from "@/lib/api/jobs";
import type { Application, Job } from "@/lib/api/types";
import { signInPath } from "@/lib/auth/portal";

const QUICK_ACTIONS = [
  { icon: "description", title: "My Applications", subtitle: "Track your pipeline", href: "/dashboard/applications" },
  { icon: "bookmark", title: "Saved Jobs", subtitle: "Review bookmarked roles", href: "/dashboard/saved" },
  { icon: "person", title: "Update Profile", subtitle: "Keep your profile current", href: "/dashboard/profile" },
] as const;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function displayName(fullName?: string | null, email?: string) {
  if (fullName?.trim()) return fullName.trim();
  if (email) return email.split("@")[0] ?? "there";
  return "there";
}

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function journeyBucket(status: string): "applied" | "review" | "interviewing" | "offers" {
  const normalized = status.toLowerCase();
  if (normalized.includes("offer")) return "offers";
  if (normalized.includes("interview")) return "interviewing";
  if (normalized.includes("review") || normalized.includes("screen")) return "review";
  return "applied";
}

function countByBucket(applications: Application[]) {
  const counts = { applied: 0, review: 0, interviewing: 0, offers: 0 };
  for (const application of applications) {
    counts[journeyBucket(application.status)] += 1;
  }
  return counts;
}

function formatJobLocation(job: Job) {
  if (job.location?.trim()) return job.location.trim();
  const parts = [job.company.name, job.city, job.workArrangement].filter(Boolean);
  return parts.join(" • ");
}

function formatJobTags(job: Job) {
  const tags: string[] = [];
  if (job.employmentType) tags.push(job.employmentType);
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  if (salary !== "Salary negotiable") tags.push(salary);
  return tags;
}

export function SeekerDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("there");
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("seeker"));
      return;
    }
    try {
      const [profile, apps, jobs] = await Promise.all([
        getProfile(),
        myApplications(),
        searchPublishedJobs({ limit: 6 }),
      ]);
      setUserName(displayName(profile.seekerProfile?.fullName, profile.email));
      setApplications(apps);
      setRecommendedJobs(jobs.items);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("seeker"));
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const journeyCounts = useMemo(() => countByBucket(applications), [applications]);

  const journeyStats = [
    { label: "Applied", value: journeyCounts.applied, border: "border-l-outline" },
    { label: "In Review", value: journeyCounts.review, border: "border-l-secondary" },
    { label: "Interviewing", value: journeyCounts.interviewing, border: "border-l-primary-container" },
    { label: "Offers", value: journeyCounts.offers, border: "border-l-secondary" },
  ];

  return (
    <SeekerShell activeNav="dashboard" userName={userName}>
      <div className="mx-auto max-w-container-max">
        <section className="mb-10">
          <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-primary-container md:text-4xl lg:text-5xl">
            {greeting()}, {userName}.
          </h1>
          <p className="mt-2 font-body-lg text-body-lg text-outline">
            {loading ? (
              "Loading your dashboard…"
            ) : recommendedJobs.length > 0 ? (
              <>
                You have{" "}
                <span className="font-bold text-secondary">
                  {recommendedJobs.length} new opening{recommendedJobs.length === 1 ? "" : "s"}
                </span>{" "}
                to explore.
              </>
            ) : (
              "Browse published roles to find your next opportunity."
            )}
          </p>
        </section>

        <section className="mb-12 grid grid-cols-1 gap-gutter md:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="professional-card group flex items-center gap-4 rounded p-6 text-left transition-all hover:border-primary-container"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded bg-secondary/5 text-secondary transition-all group-hover:bg-secondary group-hover:text-on-secondary">
                <Icon name={action.icon} />
              </div>
              <div>
                <h3 className="font-bold text-primary-container">{action.title}</h3>
                <p className="text-label-sm text-outline">{action.subtitle}</p>
              </div>
            </Link>
          ))}
        </section>

        <section className="mb-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-headline-lg text-primary-container">Application Journey</h2>
            <Link
              href="/dashboard/applications"
              className="font-bold text-label-bold text-secondary transition-all hover:underline"
            >
              View Pipeline
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-4">
            {journeyStats.map((stat) => (
              <div
                key={stat.label}
                className={`professional-card rounded border-l-4 p-6 ${stat.border}`}
              >
                <p className="mb-1 text-[11px] font-label-bold uppercase tracking-widest text-outline">
                  {stat.label}
                </p>
                <h4 className="text-headline-lg font-bold text-primary-container">
                  {loading ? "—" : String(stat.value).padStart(2, "0")}
                </h4>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-headline-lg text-primary-container">Recommended for You</h2>
              <p className="font-label-sm text-outline">Recently published openings on JobsFinder</p>
            </div>
          </div>
          {loading ? (
            <p className="text-outline">Loading recommendations…</p>
          ) : recommendedJobs.length === 0 ? (
            <p className="text-outline">No published jobs available right now. Check back soon.</p>
          ) : (
            <div className="no-scrollbar flex gap-gutter overflow-x-auto pb-6">
              {recommendedJobs.map((job) => {
                const tags = formatJobTags(job);
                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.slug}`}
                    className="professional-card group min-w-[340px] rounded p-6 transition-all hover:border-primary-container"
                  >
                    <div className="mb-6 flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest p-2">
                        {job.company.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt=""
                            className="max-h-full max-w-full object-contain"
                            src={job.company.logoUrl}
                          />
                        ) : (
                          <Icon name="business" className="text-outline" />
                        )}
                      </div>
                    </div>
                    <h3 className="mb-1 text-body-lg font-bold text-primary-container transition-colors group-hover:text-secondary">
                      {job.title}
                    </h3>
                    <p className="mb-4 text-sm text-outline">{formatJobLocation(job)}</p>
                    {tags.length > 0 && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-surface-container-low px-2 py-1 text-[11px] font-bold text-primary-container"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-outline-variant pt-4">
                      <span className="text-label-sm font-medium text-outline">
                        Posted {timeAgo(job.publishedAt ?? job.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-label-bold text-secondary transition-transform group-hover:translate-x-1">
                        View Job <Icon name="arrow_forward" className="text-sm" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </SeekerShell>
  );
}
