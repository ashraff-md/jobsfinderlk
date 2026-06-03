"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MatchBadge } from "@/components/companies/company-autocomplete";
import { LifeAtCompanyUploader } from "@/components/companies/life-at-company-uploader";
import { PublicHeader } from "@/components/layout/public-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import {
  checkCompanyDuplicates,
  createCompanyRequest,
} from "@/lib/api/companies";
import type { CompanySuggestion } from "@/lib/api/types";
import { COMPANY_TYPES } from "@/lib/companies/constants";
import {
  buildLifeAtImageDrafts,
  MAX_LIFE_AT_IMAGES,
  type LifeAtImageDraft,
} from "@/lib/companies/life-at-images";
import {
  INDUSTRY_SUGGESTIONS,
  SRI_LANKA_DISTRICTS,
} from "@/lib/jobs/post-job.constants";

const inputClass =
  "w-full rounded-lg border border-outline-variant px-4 py-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "font-label-bold text-on-surface-variant";

export function RegisterCompanyPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [companyName, setCompanyName] = useState(searchParams.get("name") ?? "");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [location, setLocation] = useState("Colombo");
  const [companyType, setCompanyType] = useState<string>(COMPANY_TYPES[0]);
  const [description, setDescription] = useState("");
  const [lifeAtImages, setLifeAtImages] = useState<LifeAtImageDraft[]>([]);
  const lifeAtImagesRef = useRef(lifeAtImages);
  lifeAtImagesRef.current = lifeAtImages;
  const [duplicates, setDuplicates] = useState<CompanySuggestion[]>([]);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (companyName.trim().length < 2) {
      setDuplicates([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setChecking(true);
      try {
        const matches = await checkCompanyDuplicates({
          name: companyName,
          website,
          emailDomain,
        });
        setDuplicates(matches);
      } catch {
        setDuplicates([]);
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [companyName, website, emailDomain]);

  useEffect(() => {
    return () => {
      lifeAtImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const removeLifeAtImage = (id: string) => {
    setLifeAtImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((image) => image.id !== id);
    });
  };

  const handleLifeAtImagesChange = async (files: FileList | null) => {
    if (!files?.length) return;

    setError(null);
    try {
      const remaining = MAX_LIFE_AT_IMAGES - lifeAtImages.length;
      if (remaining <= 0) {
        setError(`You can upload up to ${MAX_LIFE_AT_IMAGES} life at company images.`);
        return;
      }

      const drafts = await buildLifeAtImageDrafts(Array.from(files).slice(0, remaining));
      setLifeAtImages((prev) => [...prev, ...drafts]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add images.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!getAccessToken()) {
      router.push(signInPath("employer", pathname));
      return;
    }
    if (!companyName.trim() || !industry.trim() || !location.trim()) {
      setError("Company name, industry, and location are required.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await createCompanyRequest({
        companyName: companyName.trim(),
        industry: industry.trim(),
        website: website.trim() || undefined,
        emailDomain: emailDomain.trim() || undefined,
        location: location.trim(),
        companyType,
        description: description.trim() || undefined,
        lifeAtCompanyImages: lifeAtImages.map((image) => image.dataUrl),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit company request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="custom-scrollbar bg-background text-on-surface">
      <PublicHeader />

      <main className="mx-auto max-w-3xl px-margin-mobile py-12 md:px-margin-desktop">
        <div className="mb-8 space-y-2">
          <Link
            href="/employer/jobs/new"
            className="inline-flex items-center gap-1 text-label-sm font-label-bold text-primary hover:underline"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            Back to job listing
          </Link>
          <h1 className="text-headline-lg text-primary">Create New Company</h1>
          <p className="text-body-md text-on-surface-variant">
            Submit your company for admin review. We check for duplicates before approval.
          </p>
        </div>

        {success ? (
          <div className="professional-card space-y-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-8">
            <div className="flex items-center gap-3 text-secondary">
              <Icon name="check_circle" />
              <h2 className="text-headline-md">Request submitted</h2>
            </div>
            <p className="text-body-md text-on-surface-variant">
              Your company request is pending review. You&apos;ll be able to post jobs once an
              admin approves or merges it with an existing company.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/employer"
                className="rounded-lg bg-primary px-6 py-3 font-label-bold text-on-primary"
              >
                Go to employer dashboard
              </Link>
              <Link
                href="/employer/jobs/new"
                className="rounded-lg border border-outline-variant px-6 py-3 font-label-bold text-on-surface-variant"
              >
                Back to post job
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="professional-card space-y-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-8"
          >
            {error && (
              <div className="rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-md text-on-error-container">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className={labelClass} htmlFor="company-name">
                Company name
              </label>
              <input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. ABC Technologies Pvt Ltd"
                required
                className={inputClass}
              />
            </div>

            {(checking || duplicates.length > 0) && companyName.trim().length >= 2 && (
              <div className="rounded-lg border border-secondary/30 bg-secondary-container/20 p-4">
                <p className="font-label-bold text-on-surface">
                  {checking ? "Checking for similar companies…" : "Did you mean one of these?"}
                </p>
                {!checking && duplicates.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {duplicates.map((company) => (
                      <li
                        key={company.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2"
                      >
                        <div>
                          <p className="font-label-bold">{company.name}</p>
                          <p className="text-label-sm text-on-surface-variant">
                            {Math.round(company.score * 100)}% match
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <MatchBadge type={company.matchType} />
                          <Link
                            href={`/companies/${company.slug}`}
                            className="text-label-sm font-label-bold text-primary hover:underline"
                          >
                            View
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!checking && duplicates.length === 0 && (
                  <p className="mt-2 text-label-sm text-on-surface-variant">
                    No close matches found. You can submit this as a new company request.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className={labelClass} htmlFor="industry">
                Industry
              </label>
              <input
                id="industry"
                list="industry-options"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Information Technology"
                required
                className={inputClass}
              />
              <datalist id="industry-options">
                {INDUSTRY_SUGGESTIONS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelClass} htmlFor="website">
                  Website <span className="font-normal">(recommended)</span>
                </label>
                <input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="email-domain">
                  Email domain <span className="font-normal">(optional)</span>
                </label>
                <input
                  id="email-domain"
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  placeholder="example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelClass} htmlFor="location">
                  Location
                </label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputClass}
                >
                  {SRI_LANKA_DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="company-type">
                  Company type
                </label>
                <select
                  id="company-type"
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
            </div>

            <div className="space-y-4 border-t border-outline-variant pt-6">
              <div>
                <h2 className="text-headline-md text-on-surface">About company</h2>
                <p className="mt-1 text-label-sm text-on-surface-variant">
                  Tell candidates what your company does, your culture, and why people join.
                </p>
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="description">
                  Company overview
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your mission, team culture, benefits, and what makes your workplace unique…"
                  rows={6}
                  maxLength={5000}
                  className={inputClass}
                />
                <p className="text-label-sm text-on-surface-variant">
                  {description.length}/5000 characters
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-outline-variant pt-6">
              <div>
                <h2 className="text-headline-md text-on-surface">Life at the company</h2>
                <p className="mt-1 text-label-sm text-on-surface-variant">
                  Show candidates your workplace culture with real photos from your team and office.
                </p>
              </div>
              <LifeAtCompanyUploader
                images={lifeAtImages}
                onAdd={handleLifeAtImagesChange}
                onRemove={removeLifeAtImage}
              />
            </div>

            <div className="flex justify-end border-t border-outline-variant pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary px-8 py-3 font-label-bold text-on-primary disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit company request"}
              </button>
            </div>
          </form>
        )}
      </main>

      <SiteFooter variant="dark" />
    </div>
  );
}
