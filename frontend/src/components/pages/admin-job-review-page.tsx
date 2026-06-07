"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminJobEditForm,
  editValuesToApiBody,
  jobToEditValues,
  mergeJobPreview,
  type AdminJobEditValues,
} from "@/components/admin/admin-job-edit-form";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import { JobDetailView } from "@/components/jobs/job-detail-view";
import { approveJob, getAdminJob, rejectJob, updateAdminJob } from "@/lib/api/admin";
import type { Job } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function AdminJobReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [editValues, setEditValues] = useState<AdminJobEditValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
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
      setEditValues(jobToEditValues(data));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
        return;
      }
      setError(err instanceof ApiError ? err.message : "Could not load this job.");
      setJob(null);
      setEditValues(null);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const previewJob = useMemo(() => {
    if (!job || !editValues) return null;
    return mergeJobPreview(job, editValues);
  }, [job, editValues]);

  const patchEdit = (patch: Partial<AdminJobEditValues>) => {
    setSaveSuccess(false);
    setEditValues((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const saveEdits = async () => {
    if (!job || !editValues) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updated = await updateAdminJob(job.id, editValuesToApiBody(editValues));
      setJob(updated);
      setEditValues(jobToEditValues(updated));
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

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

        {job && editValues && previewJob && !loading && (
          <>
            <div className="mb-10 flex flex-col gap-4 border-b border-outline-variant pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="mb-2 text-headline-lg text-on-surface">Review Advertisement</h1>
                <p className="max-w-2xl text-body-md text-on-surface-variant">
                  Edit and preview {job.title} submitted by {job.company.name} before publishing.
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
              <div className="col-span-12 space-y-gutter lg:col-span-6">
                <AdminJobEditForm
                  values={editValues}
                  onChange={patchEdit}
                  saving={saving}
                  saveError={saveError}
                  saveSuccess={saveSuccess}
                  onSave={() => void saveEdits()}
                />

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

                <div className="space-y-3 rounded-lg border border-outline-variant bg-white p-6 shadow-sm">
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
                  <p className="text-center text-label-sm text-on-surface-variant opacity-60">
                    Publishing will notify {job.company.name} immediately.
                  </p>
                </div>
              </div>

              <div className="col-span-12 space-y-gutter lg:col-span-6">
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
                    "overflow-hidden rounded-xl border border-outline-variant bg-background shadow-sm transition-all duration-300",
                    previewMobile && "mx-auto max-w-[390px]",
                  )}
                >
                  <div
                    className={cn(
                      "px-margin-mobile py-8 md:px-8",
                      previewMobile && "px-4 py-6 [&_section_h2]:!text-xl",
                    )}
                  >
                    <JobDetailView job={previewJob} preview />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
