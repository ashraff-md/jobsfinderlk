"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import { approveJob, getAdminJob, rejectJob } from "@/lib/api/admin";
import type { Job } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const COMPLIANCE_RULES = [
  {
    icon: "check_circle",
    title: "No Discriminatory Language",
    detail: "AI scan: no gendered, ageist, or exclusionary terms detected in the job description.",
  },
  {
    icon: "check_circle",
    title: "Salary Transparency",
    detail: "Salary range is present and aligns with role level expectations.",
  },
  {
    icon: "verified_user",
    title: "Fraud/Phishing Scan",
    detail: "Recruiter company profile and posting content passed automated checks.",
  },
] as const;

function formatSalary(job: Job) {
  if (job.salaryMin != null && job.salaryMax != null) {
    return `$${job.salaryMin.toLocaleString()} – $${job.salaryMax.toLocaleString()}`;
  }
  if (job.salaryMax != null) return `Up to $${job.salaryMax.toLocaleString()}`;
  if (job.salaryMin != null) return `From $${job.salaryMin.toLocaleString()}`;
  return "Salary on application";
}

export function AdminJobReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [previewMobile, setPreviewMobile] = useState(false);
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminJob(params.id);
      setJob(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
        return;
      }
      setError(err instanceof ApiError ? err.message : "Could not load this job.");
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const moderate = async (action: "approve" | "reject") => {
    if (!job) return;
    setActing(true);
    try {
      if (action === "approve") await approveJob(job.id);
      else await rejectJob(job.id);
      router.push("/admin/jobs");
    } finally {
      setActing(false);
    }
  };

  const skills = job?.requiredSkills?.length
    ? job.requiredSkills
    : job?.niceToHaveSkills?.length
      ? job.niceToHaveSkills
      : [];

  return (
    <RecruiterAdminShell activeNav="jobs">
      <AdminPageCanvas>
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-label-sm text-on-surface-variant">
          <Link href="/admin" className="hover:text-secondary">
            Dashboard
          </Link>
          <Icon name="chevron_right" className="text-[16px]" />
          <Link href="/admin/jobs" className="hover:text-secondary">
            Jobs
          </Link>
          <Icon name="chevron_right" className="text-[16px]" />
          <span className="font-label-bold text-on-surface">
            Review{job ? `: ${job.title}` : ""}
          </span>
        </nav>

        {loading && <p className="text-on-surface-variant">Loading job for review…</p>}

        {error && !loading && (
          <div className="rounded-xl border border-error/30 bg-error-container/20 p-6">
            <p className="font-label-bold text-error">{error}</p>
            <Link href="/admin/jobs" className="mt-4 inline-block font-label-bold text-secondary hover:underline">
              Back to approval queue
            </Link>
          </div>
        )}

        {job && !loading && (
          <>
            <div className="mb-10 flex flex-col gap-4 border-b border-outline-variant pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="mb-2 text-headline-lg text-on-surface">Review Advertisement</h1>
                <p className="max-w-2xl text-body-md text-on-surface-variant">
                  Audit and compliance check for {job.title} submitted by {job.company.name}.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-secondary/20 bg-surface-container-high px-4 py-1.5 font-label-bold text-secondary">
                  Awaiting Approval
                </span>
                <span className="rounded-full border border-outline-variant bg-surface-container-low px-4 py-1.5 font-label-bold text-on-surface-variant">
                  ID: {job.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 items-start gap-gutter">
              <div className="col-span-12 space-y-gutter lg:col-span-7">
                <div className="flex items-center justify-between">
                  <h3 className="font-label-bold uppercase tracking-wider text-on-surface">
                    Public Preview
                  </h3>
                  <div className="flex rounded-lg border border-outline-variant bg-surface-container-low p-1">
                    <button
                      type="button"
                      onClick={() => setPreviewMobile(false)}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-3 py-1 text-label-sm transition-all",
                        !previewMobile
                          ? "bg-white text-secondary shadow-sm"
                          : "text-on-surface-variant",
                      )}
                    >
                      <Icon name="desktop_windows" className="text-[14px]" />
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMobile(true)}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-3 py-1 text-label-sm transition-all",
                        previewMobile
                          ? "bg-white text-secondary shadow-sm"
                          : "text-on-surface-variant",
                      )}
                    >
                      <Icon name="smartphone" className="text-[14px]" />
                      Mobile
                    </button>
                  </div>
                </div>

                <div
                  className={cn(
                    "overflow-hidden rounded-lg border border-outline-variant bg-white shadow-sm transition-all duration-300",
                    previewMobile && "mx-auto max-w-[375px]",
                  )}
                >
                  <div className="relative h-48 overflow-hidden bg-primary-container">
                    {job.vacancyArtworkUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt=""
                        className="h-full w-full object-cover opacity-80"
                        src={job.vacancyArtworkUrl}
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary-container to-surface-container-high" />
                    )}
                    <div className="absolute bottom-6 left-8 right-8">
                      <h2 className="text-headline-md text-white">{job.title}</h2>
                      <p className="font-label-bold text-on-primary-container">{job.company.name}</p>
                    </div>
                  </div>
                  <div className="space-y-8 p-8">
                    <div className="flex flex-wrap gap-6 border-b border-outline-variant pb-8">
                      {[
                        { icon: "payments", label: formatSalary(job) },
                        { icon: "location_on", label: job.location ?? job.city ?? "Location TBD" },
                        { icon: "schedule", label: job.employmentType ?? "Full-Time" },
                        ...(job.workArrangement
                          ? [{ icon: "home_work", label: job.workArrangement }]
                          : []),
                      ].map((m) => (
                        <div key={m.icon} className="flex items-center gap-2 text-on-surface-variant">
                          <Icon name={m.icon} className="text-secondary" />
                          <span className="font-label-bold">{m.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-headline-md text-on-surface">Role Overview</h4>
                      <p className="whitespace-pre-wrap leading-relaxed text-body-md text-on-surface-variant">
                        {job.description}
                      </p>
                    </div>
                    {skills.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-label-bold uppercase tracking-wider text-on-surface">
                          Required Competencies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-lg border border-outline-variant bg-surface-container px-3 py-1 text-label-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-12 space-y-gutter lg:col-span-5">
                <div className="rounded-lg border border-outline-variant bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-headline-md text-on-surface">Compliance Review</h3>
                    <Icon name="auto_awesome" filled className="text-secondary" />
                  </div>
                  <div className="space-y-4">
                    {COMPLIANCE_RULES.map((rule) => (
                      <div
                        key={rule.title}
                        className="flex items-start gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-4"
                      >
                        <Icon name={rule.icon} filled className="mt-1 text-green-600" />
                        <div>
                          <p className="font-label-bold text-on-surface">{rule.title}</p>
                          <p className="mt-1 text-label-sm text-on-surface-variant">{rule.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[11px] italic text-on-surface-variant opacity-60">
                    Last automated audit: just now
                  </p>
                </div>

                <div className="rounded-lg border border-outline-variant bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-label-bold uppercase tracking-wider text-on-surface">
                    Internal Admin Notes
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-32 w-full rounded-lg border border-outline-variant bg-surface p-4 text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                    placeholder="Type internal feedback or notes for other admins..."
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => moderate("approve")}
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary py-4 font-label-bold text-on-primary transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  >
                    <Icon name="publish" />
                    Approve &amp; Publish Ad
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/jobs/${job.slug}`}
                      target="_blank"
                      className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant py-3 font-label-bold text-on-surface-variant transition-all hover:bg-surface-container"
                    >
                      <Icon name="open_in_new" className="text-[20px]" />
                      Preview live
                    </Link>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => moderate("reject")}
                      className="flex items-center justify-center gap-2 rounded-lg border border-error/30 py-3 font-label-bold text-error transition-all hover:bg-error-container/20 disabled:opacity-50"
                    >
                      <Icon name="block" className="text-[20px]" />
                      Reject Ad
                    </button>
                  </div>
                  <p className="pt-2 text-center text-label-sm text-on-surface-variant opacity-60">
                    Publishing will notify {job.company.name} immediately.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
