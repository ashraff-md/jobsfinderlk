"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MatchBadge } from "@/components/companies/company-autocomplete";
import { CompanyLogoUploader } from "@/components/companies/company-logo-uploader";
import { CompanyRegistrationPreview } from "@/components/companies/company-registration-preview";
import { LifeAtCompanyUploader } from "@/components/companies/life-at-company-uploader";
import { Icon } from "@/components/ui/icon";
import { CitySearchField } from "@/components/ui/city-search-field";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import {
  checkCompanyDuplicates,
  createCompanyRequest,
} from "@/lib/api/companies";
import type { CompanySuggestion } from "@/lib/api/types";
import { COMPANY_TYPES } from "@/lib/companies/constants";
import type { CompanyLogoDraft } from "@/lib/companies/company-logo";
import {
  buildLifeAtImageDrafts,
  type LifeAtImageDraft,
} from "@/lib/companies/life-at-images";
import {
  LIFE_AT_MAX,
  REGISTER_COMPANY_SECTIONS,
} from "@/lib/companies/register-company.constants";
import {
  INDUSTRY_SUGGESTIONS,
} from "@/lib/jobs/post-job.constants";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-outline-variant px-4 py-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "font-label-bold text-on-surface-variant";

function Section({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="professional-card w-full min-w-0 scroll-mt-28 space-y-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-4">
        <Icon name={icon} className="text-primary" />
        <h2 className="text-headline-md text-on-surface">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function RegisterCompanyForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [companyName, setCompanyName] = useState(searchParams.get("name") ?? "");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [companyType, setCompanyType] = useState<string>(COMPANY_TYPES[0]);
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<CompanyLogoDraft | null>(null);
  const logoRef = useRef(logo);
  logoRef.current = logo;
  const [lifeAtImages, setLifeAtImages] = useState<LifeAtImageDraft[]>([]);
  const lifeAtImagesRef = useRef(lifeAtImages);
  lifeAtImagesRef.current = lifeAtImages;
  const [duplicates, setDuplicates] = useState<CompanySuggestion[]>([]);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState<string>(REGISTER_COMPANY_SECTIONS[0].id);

  const scrollToSection = useCallback((id: string) => {
    setActiveStep(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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
        });
        setDuplicates(matches);
      } catch {
        setDuplicates([]);
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [companyName, website]);

  useEffect(() => {
    return () => {
      if (logoRef.current?.previewUrl) URL.revokeObjectURL(logoRef.current.previewUrl);
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
      const remaining = LIFE_AT_MAX - lifeAtImages.length;
      if (remaining <= 0) {
        setError(`You can upload up to ${LIFE_AT_MAX} life at company images.`);
        return;
      }

      const drafts = await buildLifeAtImageDrafts(Array.from(files).slice(0, remaining));
      setLifeAtImages((prev) => [...prev, ...drafts]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add images.");
    }
  };

  const completionScore = useMemo(() => {
    let score = 0;
    if (logo) score += 15;
    if (companyName.trim()) score += 15;
    if (industry.trim()) score += 15;
    if (companyType.trim()) score += 5;
    if (website.trim()) score += 5;
    if (description.trim().length >= 20) score += 20;
    if (address.trim()) score += 5;
    if (city.trim()) score += 5;
    if (lifeAtImages.length > 0) score += 10;
    return Math.min(score, 100);
  }, [
    logo,
    companyName,
    industry,
    companyType,
    website,
    description,
    address,
    city,
    lifeAtImages.length,
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!getAccessToken()) {
      router.push(signInPath("employer", pathname));
      return;
    }
    if (!companyName.trim() || !industry.trim() || !city.trim()) {
      setError("Legal company name, industry, and city are required.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await createCompanyRequest({
        companyName: companyName.trim(),
        industry: industry.trim(),
        website: website.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim(),
        companyType,
        description: description.trim() || undefined,
        logoUrl: logo?.dataUrl,
        lifeAtCompanyImages: lifeAtImages.map((image) => image.dataUrl),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit company request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="professional-card max-w-2xl space-y-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
        <div className="flex items-center gap-3 text-primary">
          <Icon name="check_circle" />
          <h2 className="text-headline-md text-on-surface">Registration submitted</h2>
        </div>
        <p className="text-body-md text-on-surface-variant">
          Your company request is pending review. You&apos;ll be able to post jobs once an admin
          approves or merges it with an existing company.
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
            className="rounded-lg border border-primary px-6 py-3 font-label-bold text-primary hover:bg-surface-container-low"
          >
            Back to post job
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-gutter lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 lg:w-1/4">
        <div className="sticky top-28 space-y-6">
          <div>
            <Link
              href="/employer/jobs/new"
              className="mb-3 inline-flex items-center gap-1 font-label-bold text-label-sm text-primary hover:underline"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              Back to job listing
            </Link>
            <h1 className="text-headline-lg text-primary">Company Registration</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Establish your employer brand for job listings and candidate search.
            </p>
          </div>

          <nav className="relative max-h-[50vh] space-y-2 overflow-y-auto pr-1">
            <div className="absolute bottom-2 left-[11px] top-2 w-[2px] bg-outline-variant" />
            {REGISTER_COMPANY_SECTIONS.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => scrollToSection(step.id)}
                className="group relative z-10 flex w-full items-center gap-3 text-left"
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    activeStep === step.id
                      ? "step-active"
                      : "bg-surface-container-highest text-on-surface-variant",
                  )}
                >
                  {step.number}
                </div>
                <span
                  className={cn(
                    "text-label-sm",
                    activeStep === step.id
                      ? "font-bold text-primary"
                      : "text-on-surface-variant group-hover:text-primary",
                  )}
                >
                  {step.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="space-y-3 rounded-xl border border-primary/10 bg-surface-container-low p-6">
            <div className="flex items-center gap-2 text-primary">
              <Icon name="psychology" filled />
              <span className="font-label-bold">Profile Strength</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${completionScore}%` }}
              />
            </div>
            <p className="text-[12px] text-on-surface-variant">
              Profile is {completionScore}% complete for employer discovery.
            </p>
          </div>
        </div>
      </aside>

      <form
        id="registrationForm"
        onSubmit={handleSubmit}
        className="w-full min-w-0 shrink-0 space-y-8 pb-32 lg:w-2/4"
      >
        {error && (
          <div className="rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-md text-on-error-container">
            {error}
          </div>
        )}

        <Section id="brand" icon="domain" title="1. Brand Identity">
          <CompanyLogoUploader
            logo={logo}
            onChange={setLogo}
            disabled={submitting}
            variant="brand"
          />
        </Section>

        <Section id="core" icon="info" title="2. Core Information">
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <label className={labelClass} htmlFor="company-name">
                Legal company name
              </label>
              <input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Global Tech Solutions LTD"
                required
                className={inputClass}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <label className={labelClass} htmlFor="website">
                Website URL
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.company.com"
                className={inputClass}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <label className={labelClass} htmlFor="industry">
                Industry
              </label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
                className={inputClass}
              >
                <option value="">Select industry</option>
                {INDUSTRY_SUGGESTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0 space-y-2">
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
                          className="font-label-bold text-label-sm text-primary hover:underline"
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
        </Section>

        <Section id="presence" icon="branding_watermark" title="3. Professional Presence">
          <div className="w-full min-w-0 space-y-2">
            <label className={labelClass} htmlFor="description">
              Company description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe your company's mission, culture, and what makes you a great employer…"
              rows={8}
              maxLength={5000}
              className={`${inputClass} min-h-[160px] resize-y`}
            />
            <p className="text-right text-label-sm text-on-surface-variant">
              {description.length} / 5000 characters
            </p>
          </div>
        </Section>

        <Section id="visual" icon="collections" title="4. Visual Storytelling">
          <p className="text-body-md text-on-surface-variant">
            Upload up to {LIFE_AT_MAX} photos showcasing your workspace, team events, or company
            culture.
          </p>
          <LifeAtCompanyUploader
            images={lifeAtImages}
            onAdd={handleLifeAtImagesChange}
            onRemove={removeLifeAtImage}
            maxImages={LIFE_AT_MAX}
            disabled={submitting}
          />
        </Section>

        <Section id="location" icon="location_on" title="5. Location & HQ">
          <div className="flex w-full min-w-0 flex-col gap-6">
            <div className="w-full min-w-0 space-y-2">
              <label className={labelClass} htmlFor="address">
                Address
              </label>
              <input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 42 Galle Road, Level 5"
                className={inputClass}
              />
            </div>
            <CitySearchField value={city} onChange={setCity} required className="w-full" />
          </div>
        </Section>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant pt-8">
          <button
            type="button"
            disabled={submitting}
            onClick={() => router.push("/employer/jobs/new")}
            className="rounded-lg px-6 py-3 font-label-bold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-10 py-3 font-label-bold text-on-primary shadow-lg transition-all hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Complete registration"}
          </button>
        </div>
      </form>

      <CompanyRegistrationPreview
        companyName={companyName}
        industry={industry}
        companyType={companyType}
        address={address}
        city={city}
        description={description}
        website={website}
        logo={logo}
        lifeAtImages={lifeAtImages}
      />
    </div>
  );
}
