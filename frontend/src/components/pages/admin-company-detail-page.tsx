"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CompanyLogoUploader } from "@/components/companies/company-logo-uploader";
import { LifeAtCompanyUploader } from "@/components/companies/life-at-company-uploader";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { CitySearchField } from "@/components/ui/city-search-field";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import {
  approveCompanyRequest,
  getCompanyRequest,
  mergeCompanyRequest,
  rejectCompanyRequest,
  updateCompanyRequest,
} from "@/lib/api/admin";
import { COMPANY_TYPES } from "@/lib/companies/constants";
import {
  buildLifeAtImageDrafts,
  MAX_LIFE_AT_IMAGES,
  type LifeAtImageDraft,
} from "@/lib/companies/life-at-images";
import type { CompanyLogoDraft } from "@/lib/companies/company-logo";
import { INDUSTRY_SUGGESTIONS } from "@/lib/jobs/post-job.constants";
import type { CompanyRequest } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<CompanyRequest["status"], string> = {
  PENDING: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  MERGED: "Merged",
};

const inputClass =
  "w-full rounded-lg border border-outline-variant px-4 py-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "font-label-bold text-on-surface-variant";

function formatValue(value: string | null | undefined, fallback = "—") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-label-sm text-on-surface-variant">{label}</dt>
      <dd className="mt-1 font-label-bold text-on-surface">{value}</dd>
    </div>
  );
}

function lifeAtDraftsFromUrls(urls: string[]): LifeAtImageDraft[] {
  return urls.map((url, index) => ({
    id: `existing-${index}-${url}`,
    name: `photo-${index + 1}`,
    previewUrl: url,
    dataUrl: url,
  }));
}

export function AdminCompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<CompanyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [companyType, setCompanyType] = useState<string>(COMPANY_TYPES[0]);
  const [description, setDescription] = useState("");
  const [lifeAtImages, setLifeAtImages] = useState<LifeAtImageDraft[]>([]);
  const [logo, setLogo] = useState<CompanyLogoDraft | null>(null);
  const [savedLogoUrl, setSavedLogoUrl] = useState<string | null>(null);

  const applyRequestToForm = useCallback((data: CompanyRequest) => {
    setCompanyName(data.companyName);
    setIndustry(data.industry ?? "");
    setWebsite(data.website ?? "");
    setEmailDomain(data.emailDomain ?? "");
    setAddress(data.address ?? "");
    setCity(data.city ?? "");
    setCompanyType(data.companyType ?? COMPANY_TYPES[0]);
    setDescription(data.description ?? "");
    setLifeAtImages(lifeAtDraftsFromUrls(data.lifeAtCompanyImages ?? []));
    const nextLogoUrl = data.logoUrl ?? null;
    setSavedLogoUrl(nextLogoUrl);
    setLogo(
      nextLogoUrl
        ? { name: "company-logo", previewUrl: nextLogoUrl, dataUrl: nextLogoUrl }
        : null,
    );
  }, []);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoading(true);
    setError(null);
    setSaveMessage(null);
    try {
      const data = await getCompanyRequest(params.id);
      setRequest(data);
      applyRequestToForm(data);
      const firstSimilar = data.similarCompanies?.[0]?.id;
      setMergeTargetId(firstSimilar ?? null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
        return;
      }
      setError(err instanceof ApiError ? err.message : "Could not load this company request.");
      setRequest(null);
    } finally {
      setLoading(false);
    }
  }, [applyRequestToForm, params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const isPending = request?.status === "PENDING";
  const isApproved = request?.status === "APPROVED";
  const isEditable = isPending || isApproved;

  const validateForm = () => {
    if (!companyName.trim()) return "Company name is required.";
    if (!industry.trim()) return "Industry is required.";
    if (!city.trim()) return "City is required.";
    return null;
  };

  const buildPayload = () => {
    const currentLogoUrl = logo?.dataUrl ?? null;
    const logoChanged = currentLogoUrl !== savedLogoUrl;

    return {
      companyName: companyName.trim(),
      industry: industry.trim(),
      website: website.trim() || undefined,
      emailDomain: emailDomain.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim(),
      companyType,
      description: description.trim() || undefined,
      lifeAtCompanyImages: lifeAtImages.map((image) => image.dataUrl),
      ...(logoChanged ? { logoUrl: currentLogoUrl ?? "" } : {}),
    };
  };

  const saveChanges = async (): Promise<CompanyRequest | null> => {
    if (!request || !isEditable) return request;
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return null;
    }

    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const updated = await updateCompanyRequest(request.id, buildPayload());
      setRequest(updated);
      applyRequestToForm(updated);
      setSaveMessage("Changes saved.");
      return updated;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save changes.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action: "approve" | "reject" | "merge") => {
    if (!request || !isPending) return;
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setActing(true);
    setError(null);
    setSaveMessage(null);
    try {
      await updateCompanyRequest(request.id, buildPayload());
      if (action === "approve") await approveCompanyRequest(request.id);
      else if (action === "reject") {
        await rejectCompanyRequest(request.id, reviewNotes.trim() || undefined);
      } else {
        if (!mergeTargetId) return;
        await mergeCompanyRequest(request.id, mergeTargetId, reviewNotes.trim() || undefined);
      }
      router.push("/admin/companies");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setActing(false);
    }
  };

  const removeLifeAtImage = (id: string) => {
    setLifeAtImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((image) => image.id !== id);
    });
  };

  const handleLifeAtImagesChange = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MAX_LIFE_AT_IMAGES - lifeAtImages.length;
    if (remaining <= 0) return;
    const drafts = await buildLifeAtImageDrafts(Array.from(files).slice(0, remaining));
    setLifeAtImages((prev) => [...prev, ...drafts]);
  };

  const gallery = request?.lifeAtCompanyImages ?? [];
  const busy = acting || saving;

  return (
    <RecruiterAdminShell activeNav="companies">
      <AdminPageCanvas className="md:px-margin-desktop">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-label-sm text-on-surface-variant">
          <Link href="/admin/companies" className="hover:text-secondary">
            Companies
          </Link>
          <Icon name="chevron_right" className="text-[16px]" />
          <span className="font-label-bold text-on-surface">
            {request?.companyName ?? "Company request"}
          </span>
        </nav>

        {loading && <p className="text-on-surface-variant">Loading company request…</p>}

        {error && !loading && (
          <div className="mb-6 rounded-xl border border-error/30 bg-error-container/20 p-4">
            <p className="font-label-bold text-error">{error}</p>
          </div>
        )}

        {saveMessage && !loading && (
          <div className="mb-6 rounded-xl border border-secondary/30 bg-secondary-container/20 p-4">
            <p className="font-label-bold text-secondary">{saveMessage}</p>
          </div>
        )}

        {error && !loading && !request && (
          <Link
            href="/admin/companies"
            className="inline-block font-label-bold text-secondary hover:underline"
          >
            Back to onboarding queue
          </Link>
        )}

        {request && !loading && (
          <>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high">
                  {(logo?.previewUrl ?? request.logoUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      src={logo?.previewUrl ?? request.logoUrl ?? ""}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Icon name="domain" className="text-[32px] text-on-surface-variant" />
                  )}
                </div>
                <div>
                  <h1 className="text-headline-lg">
                    {isPending
                      ? "Review & edit application"
                      : isApproved
                        ? "Edit approved company"
                        : request.companyName}
                  </h1>
                  <p className="text-on-surface-variant">
                    Request ID: {request.id} · Submitted{" "}
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "self-start rounded-full px-4 py-1.5 font-label-bold",
                  request.status === "PENDING"
                    ? "bg-secondary-container text-on-secondary"
                    : "bg-surface-container-high text-on-surface-variant",
                )}
              >
                {STATUS_LABEL[request.status]}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-gutter">
              <div className="col-span-12 space-y-6 lg:col-span-8">
                {isEditable ? (
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void saveChanges();
                    }}
                  >
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
                      <h3 className="mb-4 text-headline-md">Entity Information</h3>
                      <div className="mb-6">
                        <CompanyLogoUploader
                          logo={logo}
                          onChange={setLogo}
                          disabled={busy}
                          variant="brand"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <label className={labelClass} htmlFor="admin-company-name">
                            Company name
                          </label>
                          <input
                            id="admin-company-name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className={inputClass}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className={labelClass} htmlFor="admin-industry">
                            Industry
                          </label>
                          <select
                            id="admin-industry"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className={inputClass}
                            required
                          >
                            <option value="">Select industry</option>
                            {INDUSTRY_SUGGESTIONS.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                            {industry && !INDUSTRY_SUGGESTIONS.includes(industry as (typeof INDUSTRY_SUGGESTIONS)[number]) && (
                              <option value={industry}>{industry}</option>
                            )}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className={labelClass} htmlFor="admin-company-type">
                            Company type
                          </label>
                          <select
                            id="admin-company-type"
                            value={companyType}
                            onChange={(e) => setCompanyType(e.target.value)}
                            className={inputClass}
                          >
                            {COMPANY_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className={labelClass} htmlFor="admin-website">
                            Website
                          </label>
                          <input
                            id="admin-website"
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className={inputClass}
                            placeholder="https://example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className={labelClass} htmlFor="admin-email-domain">
                            Email domain
                          </label>
                          <input
                            id="admin-email-domain"
                            value={emailDomain}
                            onChange={(e) => setEmailDomain(e.target.value)}
                            className={inputClass}
                            placeholder="company.com"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label className={labelClass} htmlFor="admin-address">
                            Address
                          </label>
                          <input
                            id="admin-address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <CitySearchField
                            id="admin-city"
                            label="City"
                            value={city}
                            onChange={setCity}
                            required
                            disabled={busy}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
                      <h3 className="mb-4 font-label-bold">Company Description</h3>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        disabled={busy}
                        className={cn(inputClass, "resize-y")}
                        placeholder="Company overview for the public profile…"
                      />
                    </div>

                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
                      <h3 className="mb-4 font-label-bold">Life at Company</h3>
                      <LifeAtCompanyUploader
                        images={lifeAtImages}
                        onAdd={handleLifeAtImagesChange}
                        onRemove={removeLifeAtImage}
                        disabled={busy}
                        variant="storytelling"
                      />
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
                      <h3 className="mb-4 text-headline-md">Entity Information</h3>
                      <dl className="grid grid-cols-1 gap-4 text-body-md sm:grid-cols-2">
                        <DetailField label="Company Name" value={request.companyName} />
                        <DetailField label="Industry" value={formatValue(request.industry)} />
                        <DetailField label="Company Type" value={formatValue(request.companyType)} />
                        <DetailField label="Email Domain" value={formatValue(request.emailDomain)} />
                        <DetailField
                          label="Website"
                          value={
                            request.website ? (
                              <a
                                href={
                                  request.website.startsWith("http")
                                    ? request.website
                                    : `https://${request.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:underline"
                              >
                                {request.website}
                              </a>
                            ) : (
                              "—"
                            )
                          }
                        />
                        <DetailField label="City" value={formatValue(request.city)} />
                        <DetailField label="Address" value={formatValue(request.address)} />
                        <DetailField label="Location" value={formatValue(request.location)} />
                      </dl>
                    </div>

                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
                      <h3 className="mb-4 font-label-bold">Company Description</h3>
                      <p className="whitespace-pre-wrap text-body-md leading-relaxed text-on-surface-variant">
                        {formatValue(request.description, "No description provided.")}
                      </p>
                    </div>

                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
                      <h3 className="mb-4 font-label-bold">Life at Company</h3>
                      {gallery.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                          {gallery.map((src, index) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <a
                              key={`${src}-${index}`}
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-low"
                            >
                              <img
                                alt={`Life at company ${index + 1}`}
                                src={src}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-body-md text-on-surface-variant">No gallery images submitted.</p>
                      )}
                    </div>
                  </>
                )}

                {request.requestedBy && (
                  <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
                    <h3 className="mb-4 font-label-bold">Submitted By</h3>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <DetailField label="Email" value={request.requestedBy.email} />
                      <DetailField label="Role" value={request.requestedBy.role} />
                      <DetailField
                        label="Account Created"
                        value={new Date(request.requestedBy.createdAt).toLocaleDateString()}
                      />
                    </dl>
                    {request.requestedBy.employerUsers &&
                      request.requestedBy.employerUsers.length > 0 && (
                        <div className="mt-4 border-t border-outline-variant/40 pt-4">
                          <p className="mb-2 text-label-sm text-on-surface-variant">
                            Existing employer links
                          </p>
                          <ul className="space-y-2">
                            {request.requestedBy.employerUsers.map((link) => (
                              <li
                                key={link.company.id}
                                className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2 text-body-md"
                              >
                                <span className="font-label-bold">{link.company.name}</span>
                                <span className="text-label-sm text-on-surface-variant">
                                  {link.company.verified ? "Verified" : "Unverified"}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                )}

                {request.similarCompanies && request.similarCompanies.length > 0 && (
                  <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
                    <h3 className="mb-2 font-label-bold">Similar Companies on Platform</h3>
                    <p className="mb-4 text-label-sm text-on-surface-variant">
                      Select a match to merge this request with an existing company profile.
                    </p>
                    <div className="space-y-2">
                      {request.similarCompanies.map((company) => (
                        <label
                          key={company.id}
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors",
                            mergeTargetId === company.id
                              ? "border-secondary bg-secondary-container/20"
                              : "border-outline-variant/40 bg-surface-container-low hover:bg-tertiary-fixed/20",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="merge-target"
                              checked={mergeTargetId === company.id}
                              onChange={() => setMergeTargetId(company.id)}
                              disabled={!isPending}
                            />
                            <div>
                              <p className="font-label-bold">{company.name}</p>
                              <p className="text-label-sm text-on-surface-variant">
                                {Math.round(company.score * 100)}% match · {company.matchType}
                              </p>
                            </div>
                          </div>
                          {company.verified && (
                            <span className="rounded-full bg-primary-container px-2 py-0.5 text-label-sm font-label-bold text-on-primary-container">
                              Verified
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-12 lg:col-span-4">
                <div className="sticky top-24 space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
                  <h3 className="font-label-bold">
                    {isPending ? "Review Actions" : "Company Actions"}
                  </h3>

                  {isEditable && (
                    <>
                      <p className="text-label-sm text-on-surface-variant">
                        {isPending
                          ? "Edit fields on the left, then save or approve. Approve and merge save your edits automatically."
                          : "Changes are saved to the live company profile recruiters and job seekers see on the platform."}
                      </p>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void saveChanges()}
                        className="w-full rounded-lg border border-secondary py-3 font-label-bold text-secondary disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Save changes"}
                      </button>
                    </>
                  )}

                  {isPending && (
                    <div>
                      <label htmlFor="review-notes" className="text-label-sm text-on-surface-variant">
                        Review notes (optional, for reject / merge)
                      </label>
                      <textarea
                        id="review-notes"
                        rows={3}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        disabled={busy}
                        className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Reason or internal notes…"
                      />
                    </div>
                  )}

                  {request.reviewNotes && !isPending && (
                    <div className="rounded-lg bg-surface-container-low p-3 text-body-md">
                      <p className="text-label-sm text-on-surface-variant">Review notes</p>
                      <p className="mt-1">{request.reviewNotes}</p>
                    </div>
                  )}

                  {request.mergedInto && (
                    <div className="rounded-lg bg-surface-container-low p-3 text-body-md">
                      <p className="text-label-sm text-on-surface-variant">
                        {isApproved ? "Live company profile" : "Merged into"}
                      </p>
                      <p className="mt-1 font-label-bold">{request.mergedInto.name}</p>
                    </div>
                  )}

                  {isPending ? (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction("approve")}
                        className="w-full rounded-lg bg-primary py-3 font-label-bold text-on-primary disabled:opacity-50"
                      >
                        {acting ? "Processing…" : "Approve as New Company"}
                      </button>
                      <button
                        type="button"
                        disabled={busy || !mergeTargetId}
                        onClick={() => runAction("merge")}
                        className="w-full rounded-lg border border-outline-variant py-3 font-label-bold disabled:opacity-50"
                      >
                        Merge with Selected
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction("reject")}
                        className="w-full rounded-lg border border-error py-3 font-label-bold text-error disabled:opacity-50"
                      >
                        Reject Request
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/admin/companies"
                      className="block w-full rounded-lg border border-outline-variant py-3 text-center font-label-bold hover:bg-surface-container-low"
                    >
                      Back to queue
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
