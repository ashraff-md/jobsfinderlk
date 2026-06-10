"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { getJobApplications } from "@/lib/api/applications";
import { getEmployerJobs } from "@/lib/api/jobs";
import type { EmployerJob, JobApplication } from "@/lib/api/types";
import { signInPath } from "@/lib/auth/portal";

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function formatStatus(status: string) {
  return status
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function applicantName(application: JobApplication) {
  return application.user.seekerProfile?.fullName?.trim() || application.user.email;
}

function applicantInitials(application: JobApplication) {
  const name = applicantName(application);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function EmployerDashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const activeJobs = useMemo(
    () => jobs.filter((job) => job.status === "PUBLISHED"),
    [jobs],
  );

  const metrics = useMemo(() => {
    const totalViews = jobs.reduce((sum, job) => sum + (job.viewCount ?? 0), 0);
    const totalApplicants = jobs.reduce(
      (sum, job) => sum + (job._count?.applications ?? 0),
      0,
    );
    return {
      totalViews,
      totalApplicants,
      activeJobs: activeJobs.length,
      totalJobs: jobs.length,
    };
  }, [jobs, activeJobs.length]);

  const loadJobs = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("employer"));
      return;
    }
    try {
      const data = await getEmployerJobs();
      setJobs(data);
      const published = data.filter((job) => job.status === "PUBLISHED");
      if (published.length > 0) {
        setSelectedJobId((current) =>
          current && published.some((job) => job.id === current) ? current : published[0]!.id,
        );
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("employer"));
      }
    } finally {
      setLoadingJobs(false);
    }
  }, [router]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (!selectedJobId || !getAccessToken()) {
      setApplications([]);
      return;
    }

    let cancelled = false;
    setLoadingApplicants(true);

    getJobApplications(selectedJobId)
      .then((data) => {
        if (!cancelled) setApplications(data);
      })
      .catch((err) => {
        if (!cancelled && err instanceof ApiError && err.status === 401) {
          router.push(signInPath("employer"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingApplicants(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedJobId, router]);

  const selectedJob = useMemo(
    () => activeJobs.find((job) => job.id === selectedJobId),
    [activeJobs, selectedJobId],
  );

  const filteredApplicants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return applications;

    return applications.filter((application) => {
      const name = applicantName(application).toLowerCase();
      const headline = application.user.seekerProfile?.headline?.toLowerCase() ?? "";
      const status = application.status.toLowerCase();
      return name.includes(query) || headline.includes(query) || status.includes(query);
    });
  }, [applications, searchQuery]);

  return (
    <>
      <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-headline-xl font-extrabold leading-tight text-primary-container md:text-[40px]">
            Recruiter Command Center
          </h2>
          <p className="mt-2 font-body-lg text-body-lg text-outline">
            Real-time performance metrics and applicant tracking.
          </p>
        </div>
      </header>

      <section className="mb-12 grid grid-cols-1 gap-gutter md:grid-cols-4">
        <div className="professional-card flex flex-col justify-between rounded p-6">
          <div>
            <p className="mb-2 text-xs font-label-bold uppercase tracking-widest text-outline">
              Total Job Views
            </p>
            <h3 className="text-headline-xl font-bold text-primary-container">
              {loadingJobs ? "—" : metrics.totalViews.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="professional-card flex flex-col justify-between rounded p-6">
          <div>
            <p className="mb-2 text-xs font-label-bold uppercase tracking-widest text-outline">
              Total Applicants
            </p>
            <h3 className="text-headline-xl font-bold text-primary-container">
              {loadingJobs ? "—" : metrics.totalApplicants.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="professional-card flex flex-col justify-between rounded p-6">
          <div>
            <p className="mb-2 text-xs font-label-bold uppercase tracking-widest text-outline">
              Active Listings
            </p>
            <h3 className="text-headline-xl font-bold text-primary-container">
              {loadingJobs ? "—" : metrics.activeJobs.toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 text-sm font-label-bold text-on-surface-variant">
            {loadingJobs ? "" : `${metrics.totalJobs} total listings`}
          </div>
        </div>

        <Link
          href="/employer/jobs"
          className="relative flex flex-col justify-between overflow-hidden rounded border border-white/10 bg-primary-container p-6 text-white shadow-lg transition-opacity hover:opacity-95"
        >
          <div className="relative z-10">
            <p className="mb-1 text-xs font-label-bold uppercase tracking-widest text-on-primary-container">
              Manage Listings
            </p>
            <h3 className="text-headline-lg font-bold">Job Postings</h3>
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-2 text-sm font-bold text-on-primary-container">
            <span>View all jobs</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-[0.03]">
            <Icon name="work" className="text-[120px]" />
          </div>
        </Link>
      </section>

      <section className="mb-12">
        <div className="professional-card flex flex-col overflow-hidden rounded">
          <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface-container-low p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="text-2xl font-headline-xl text-headline-xl text-primary-container md:text-3xl">
                Applied Applicants
              </h2>
              <Link
                href="/employer/applications"
                className="text-sm font-bold text-secondary hover:underline"
              >
                View all applications
              </Link>
            </div>
            <div className="flex flex-nowrap items-center gap-2 sm:gap-3">
              <div className="relative min-w-0 flex-1">
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline sm:left-4"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search applicants..."
                  className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-3 text-sm font-body-md text-on-surface outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 sm:pl-12 sm:pr-4 sm:text-base"
                />
              </div>
              <select
                id="applied-applicants-job"
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
                disabled={activeJobs.length === 0}
                className="w-auto max-w-[38%] shrink-0 cursor-pointer truncate rounded-lg border border-outline-variant bg-white px-3 py-3 text-sm font-label-bold text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-[220px] sm:px-4 sm:text-base md:max-w-[280px]"
              >
                {activeJobs.length === 0 ? (
                  <option value="">No active jobs</option>
                ) : (
                  activeJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))
                )}
              </select>
              {selectedJob && (
                <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-outline-variant bg-white px-3 py-3 text-sm text-outline sm:px-4 sm:text-base">
                  <Icon name="visibility" className="text-[18px] text-secondary" />
                  <span>
                    <span className="font-label-bold text-primary-container">
                      {(selectedJob.viewCount ?? 0).toLocaleString()}
                    </span>{" "}
                    views
                  </span>
                </span>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-xs font-bold uppercase tracking-widest text-outline sm:text-sm">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4 whitespace-nowrap">Applied</th>
                  <th className="px-6 py-4">Headline</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loadingApplicants ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-base text-outline">
                      Loading applicants…
                    </td>
                  </tr>
                ) : filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-base text-outline">
                      {searchQuery.trim()
                        ? "No applicants match your search."
                        : activeJobs.length === 0
                          ? "Publish a job to start receiving applicants."
                          : "No applicants for this job yet."}
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((application) => (
                    <tr key={application.id} className="group transition-colors hover:bg-surface-container-low">
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-highest font-bold text-primary-container">
                            {applicantInitials(application)}
                          </div>
                          <div>
                            <p className="text-base font-label-bold text-primary-container">
                              {applicantName(application)}
                            </p>
                            <p className="text-sm text-outline">{application.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle text-base text-outline whitespace-nowrap">
                        {timeAgo(application.createdAt)}
                      </td>
                      <td className="px-6 py-4 align-middle text-base text-outline">
                        {application.user.seekerProfile?.headline?.trim() || "—"}
                      </td>
                      <td className="px-6 py-4 align-middle whitespace-nowrap">
                        <span className="rounded border border-outline-variant bg-surface-container-high px-2.5 py-1 text-sm font-bold text-primary-container">
                          {formatStatus(application.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
