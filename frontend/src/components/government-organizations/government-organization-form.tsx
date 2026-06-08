"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  GovOrgMatchBadge,
  GovernmentOrganizationAutocomplete,
} from "@/components/government-organizations/government-organization-autocomplete";
import { CompanyLogoUploader } from "@/components/companies/company-logo-uploader";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import {
  checkGovernmentOrganizationDuplicates,
  createGovernmentOrganization,
  getGovernmentOrganization,
  updateGovernmentOrganization,
} from "@/lib/api/government-organizations";
import type { CompanyLogoDraft } from "@/lib/companies/company-logo";
import type { GovernmentOrganizationSuggestion } from "@/lib/api/types";
import {
  DEFAULT_GOVERNMENT_ORGANIZATION_VALUES,
  GOVERNMENT_ORGANIZATION_TYPES,
  SRI_LANKA_PROVINCES,
  type GovernmentOrganizationFormValues,
} from "@/lib/government-organizations/constants";
import {
  buildGovernmentOrganizationPayload,
  buildGovernmentOrganizationUpdatePayload,
  governmentOrganizationToFormValues,
} from "@/lib/government-organizations/government-organization-mapper";
import { resolveGovernmentOrganizationId } from "@/lib/government-organizations/resolve-government-organization";
import { SRI_LANKA_DISTRICTS } from "@/lib/jobs/post-job.constants";

const inputClass =
  "w-full rounded-lg border border-outline-variant px-4 py-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "font-label-bold text-on-surface-variant";

function existingLogoDraft(url: string): CompanyLogoDraft {
  return {
    name: "organization-logo",
    previewUrl: url,
    dataUrl: url,
  };
}

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="professional-card space-y-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-4">
        <Icon name={icon} className="text-primary" />
        <h2 className="text-headline-md text-on-surface">{title}</h2>
      </div>
      {children}
    </section>
  );
}

type GovernmentOrganizationFormProps = {
  organizationId?: string;
};

export function GovernmentOrganizationForm({ organizationId }: GovernmentOrganizationFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEdit = Boolean(organizationId);
  const returnTo = searchParams.get("returnTo") ?? "/admin/government-organizations";

  const [form, setForm] = useState<GovernmentOrganizationFormValues>({
    ...DEFAULT_GOVERNMENT_ORGANIZATION_VALUES,
    name: searchParams.get("name") ?? "",
  });
  const [logo, setLogo] = useState<CompanyLogoDraft | null>(null);
  const [initialLogoUrl, setInitialLogoUrl] = useState<string | null>(null);
  const logoRef = useRef(logo);
  logoRef.current = logo;
  const [duplicates, setDuplicates] = useState<GovernmentOrganizationSuggestion[]>([]);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parentOrganizationIdRef = useRef("");

  const patch = useCallback((partial: Partial<GovernmentOrganizationFormValues>) => {
    setForm((prev) => {
      const next = { ...prev, ...partial };
      if (partial.parentOrganizationId !== undefined) {
        parentOrganizationIdRef.current = partial.parentOrganizationId;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!organizationId) return;

    let cancelled = false;
    (async () => {
      if (!getAccessToken()) {
        router.push(signInPath("admin", pathname));
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const org = await getGovernmentOrganization(organizationId);
        if (cancelled) return;
        setForm(governmentOrganizationToFormValues(org));
        parentOrganizationIdRef.current =
          org.parentOrganizationId ?? org.parent?.id ?? "";
        if (org.logoUrl) {
          setInitialLogoUrl(org.logoUrl);
          setLogo(existingLogoDraft(org.logoUrl));
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.push(signInPath("admin", pathname));
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load organization.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [organizationId, pathname, router]);

  useEffect(() => {
    const parentId = searchParams.get("parentOrganizationId");
    if (!parentId || organizationId) return;

    let cancelled = false;
    void getGovernmentOrganization(parentId)
      .then((org) => {
        if (cancelled) return;
        parentOrganizationIdRef.current = org.id;
        setForm((prev) => ({
          ...prev,
          parentOrganizationId: org.id,
          parentOrganizationSearch: org.name,
        }));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [organizationId, searchParams]);

  useEffect(() => {
    if (form.name.trim().length < 2) {
      setDuplicates([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setChecking(true);
      try {
        const results = await checkGovernmentOrganizationDuplicates(
          form.name,
          controller.signal,
        );
        if (controller.signal.aborted) return;
        const filtered = organizationId
          ? results.filter((item) => item.id !== organizationId)
          : results;
        setDuplicates(filtered);
      } catch {
        if (!controller.signal.aborted) setDuplicates([]);
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [form.name, organizationId]);

  const resolveLogoPayload = () => {
    const current = logoRef.current;
    if (current?.dataUrl && current.dataUrl !== initialLogoUrl) {
      return current.dataUrl;
    }
    if (!current && initialLogoUrl) {
      return "";
    }
    return undefined;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!getAccessToken()) {
      router.push(`${signInPath()}?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!form.name.trim()) {
      setError("Organization name is required.");
      return;
    }

    const parentOrganizationId = await resolveGovernmentOrganizationId({
      organizationId:
        form.parentOrganizationId.trim() || parentOrganizationIdRef.current.trim(),
      search: form.parentOrganizationSearch,
      excludeOrganizationId: organizationId,
      defaultOrganizationType: "Ministry",
    });

    const formForSubmit: GovernmentOrganizationFormValues = {
      ...form,
      parentOrganizationId: parentOrganizationId ?? "",
    };

    setSubmitting(true);
    try {
      const logoPayload = resolveLogoPayload();

      if (isEdit && organizationId) {
        await updateGovernmentOrganization(
          organizationId,
          buildGovernmentOrganizationUpdatePayload(formForSubmit, logoPayload),
        );
        router.push(returnTo);
        return;
      }

      const created = await createGovernmentOrganization({
        ...buildGovernmentOrganizationPayload(formForSubmit, logoPayload),
        logoUrl: logoRef.current?.dataUrl,
      });

      const separator = returnTo.includes("?") ? "&" : "?";
      const returnParam = returnTo.includes("/admin/government-organizations")
        ? "parentOrganizationId"
        : "organizationId";
      router.push(`${returnTo}${separator}${returnParam}=${created.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : isEdit
            ? "Could not update organization."
            : "Could not create organization.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest px-6 py-16 text-center text-on-surface-variant">
        Loading organization…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-stack-lg">
      <Section icon="account_balance" title="Basic Information">
        <div className="space-y-stack-lg">
          <div className="space-y-2">
            <label className={labelClass} htmlFor="gov-org-name">
              Organization Name (Official Name)
            </label>
            <input
              id="gov-org-name"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="e.g. Ministry of Education"
              className={inputClass}
              required
            />
            {checking && (
              <p className="text-label-sm text-on-surface-variant">Checking registry…</p>
            )}
            {!checking && duplicates.length > 0 && (
              <div className="rounded-lg border border-tertiary-container bg-tertiary-container/20 p-4">
                <p className="font-label-bold text-on-surface">
                  Similar organizations already registered
                </p>
                <ul className="mt-2 space-y-2">
                  {duplicates.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center gap-2 text-label-sm text-on-surface-variant"
                    >
                      <span className="font-label-bold text-on-surface">{item.name}</span>
                      <GovOrgMatchBadge type={item.matchType} />
                      <span className="text-on-surface-variant">({item.organizationType})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-stack-lg sm:grid-cols-2">
            <div className="space-y-2">
              <label className={labelClass} htmlFor="gov-org-type">
                Organization Type
              </label>
              <select
                id="gov-org-type"
                value={form.organizationType}
                onChange={(e) =>
                  patch({
                    organizationType: e.target
                      .value as GovernmentOrganizationFormValues["organizationType"],
                  })
                }
                className={inputClass}
                required
              >
                {GOVERNMENT_ORGANIZATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <GovernmentOrganizationAutocomplete
                label="Parent Organization"
                value={form.parentOrganizationSearch}
                selectedOrganizationId={form.parentOrganizationId || undefined}
                excludeOrganizationId={organizationId}
                onQueryChange={(query) => {
                  parentOrganizationIdRef.current = "";
                  patch({
                    parentOrganizationSearch: query,
                    parentOrganizationId: "",
                  });
                }}
                onSelect={(org) => {
                  parentOrganizationIdRef.current = org.id;
                  patch({
                    parentOrganizationSearch: org.name,
                    parentOrganizationId: org.id,
                  });
                }}
                onClear={() => {
                  parentOrganizationIdRef.current = "";
                  patch({
                    parentOrganizationId: "",
                    parentOrganizationSearch: "",
                  });
                }}
                placeholder="Search parent ministry or authority…"
                required={false}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section icon="badge" title="Identification">
        <div className="grid grid-cols-1 gap-stack-lg sm:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass} htmlFor="gov-org-short-name">
              Short Name / Acronym
            </label>
            <input
              id="gov-org-short-name"
              value={form.shortName}
              onChange={(e) => patch({ shortName: e.target.value })}
              placeholder="e.g. MOE, NWSDB"
              className={inputClass}
            />
          </div>
          <div className="col-span-full space-y-2">
            <label className={labelClass} htmlFor="gov-org-description">
              Description
            </label>
            <textarea
              id="gov-org-description"
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              rows={4}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="gov-org-website">
              Official Website
            </label>
            <input
              id="gov-org-website"
              type="url"
              value={form.website}
              onChange={(e) => patch({ website: e.target.value })}
              placeholder="https://www.customs.gov.lk"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="gov-org-email">
              Official Email
            </label>
            <input
              id="gov-org-email"
              type="email"
              value={form.email}
              onChange={(e) => patch({ email: e.target.value })}
              placeholder="info@customs.gov.lk"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="gov-org-phone">
              Official Contact Number
            </label>
            <input
              id="gov-org-phone"
              value={form.contactNumber}
              onChange={(e) => patch({ contactNumber: e.target.value })}
              placeholder="+94 11 000 0000"
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section icon="location_on" title="Location">
        <div className="grid grid-cols-1 gap-stack-lg sm:grid-cols-2">
          <div className="col-span-full space-y-2">
            <label className={labelClass} htmlFor="gov-org-address">
              Head Office Address
            </label>
            <textarea
              id="gov-org-address"
              value={form.headOfficeAddress}
              onChange={(e) => patch({ headOfficeAddress: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="gov-org-district">
              District
            </label>
            <select
              id="gov-org-district"
              value={form.district}
              onChange={(e) => patch({ district: e.target.value })}
              className={inputClass}
            >
              <option value="">Select district</option>
              {SRI_LANKA_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="gov-org-province">
              Province
            </label>
            <select
              id="gov-org-province"
              value={form.province}
              onChange={(e) => patch({ province: e.target.value })}
              className={inputClass}
            >
              <option value="">Select province</option>
              {SRI_LANKA_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section icon="image" title="Branding">
        <CompanyLogoUploader logo={logo} onChange={setLogo} />
        <p className="text-label-sm text-on-surface-variant">
          Upload PNG, JPG, or SVG (max 2MB).
        </p>
      </Section>

      {error && (
        <p className="rounded-lg border border-error-container bg-error-container/20 px-4 py-3 text-label-sm text-error">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary px-6 py-3 font-label-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save Changes"
              : "Create Organization"}
        </button>
        <button
          type="button"
          onClick={() => router.push(returnTo)}
          className="rounded-lg border border-outline-variant px-6 py-3 font-label-bold text-on-surface-variant"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
