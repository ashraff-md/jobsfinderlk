"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import { Icon } from "@/components/ui/icon";
import { getCompanies } from "@/lib/api/jobs";
import type { Company } from "@/lib/api/types";

/** Demo seed companies hidden from the public directory. */
const EXCLUDED_COMPANY_SLUGS = new Set(["wso2", "dialog-axiata"]);

type CompanyCardItem = {
  name: string;
  industry: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  badge?: { label: string; className: string };
  stats: Array<{ icon: string; text: string }>;
  footer: { label: string; className: string };
  slug: string;
};

type CompaniesDirectoryPageProps = {
  initialCompanies?: Company[];
};

function filterDisplayCompanies(companies: Company[]) {
  return companies.filter((company) => !EXCLUDED_COMPANY_SLUGS.has(company.slug));
}

function mapCompanyToCard(company: Company): CompanyCardItem {
  const openRoles = company._count?.jobs ?? 0;
  const location = company.location ?? company.city;
  const stats: CompanyCardItem["stats"] = [];

  if (location) {
    stats.push({ icon: "location_on", text: location });
  }
  stats.push({
    icon: "work",
    text: `${openRoles} Open Role${openRoles === 1 ? "" : "s"}`,
  });

  return {
    name: company.name,
    industry: company.industry ?? company.companyType ?? "Enterprise",
    logoUrl: company.logoUrl,
    coverImageUrl: company.lifeAtCompanyImages?.[0] ?? null,
    badge:
      openRoles > 0
        ? { label: "Hiring Now", className: "text-green-600 bg-green-50" }
        : undefined,
    stats,
    footer: {
      label:
        openRoles > 0
          ? `${openRoles} Open Role${openRoles === 1 ? "" : "s"}`
          : "No Openings",
      className: openRoles > 0 ? "text-secondary" : "text-on-surface-variant",
    },
    slug: company.slug,
  };
}

function buildSectors(companies: Company[]) {
  const industries = [
    ...new Set(
      companies.map((company) => company.industry?.trim()).filter(Boolean) as string[],
    ),
  ].sort((a, b) => a.localeCompare(b));

  return ["All Sectors", ...industries];
}

function sortCompanies(companies: Company[], sortBy: string) {
  const copy = [...companies];
  if (sortBy === "Recent Openings") {
    return copy.sort((a, b) => (b._count?.jobs ?? 0) - (a._count?.jobs ?? 0));
  }
  if (sortBy === "Company Size") {
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  return copy.sort(
    (a, b) =>
      (a.industry ?? "").localeCompare(b.industry ?? "") || a.name.localeCompare(b.name),
  );
}

function CompanyCard({ company }: { company: CompanyCardItem }) {
  return (
    <Link
      href={`/companies/${company.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-36 w-full overflow-hidden">
        {company.coverImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            alt={`${company.name} workplace`}
            src={company.coverImageUrl}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-none border border-outline-variant/30 bg-surface-container-lowest p-1 shadow-sm">
          {company.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              alt={`${company.name} logo`}
              src={company.logoUrl}
              className="h-full w-full object-contain"
            />
          ) : (
            <Icon name="business" className="text-3xl text-secondary" />
          )}
        </div>
        {company.badge ? (
          <span
            className={`absolute right-3 top-3 rounded px-2 py-0.5 font-label-sm text-label-sm shadow-sm ${company.badge.className}`}
          >
            {company.badge.label}
          </span>
        ) : null}
      </div>
      <div className="flex grow flex-col p-6">
        <h4 className="mb-1 font-headline-md text-primary">{company.name}</h4>
        <p className="mb-4 font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant">
          {company.industry}
        </p>
        <div className="mb-6 grow space-y-3">
          {company.stats.map((stat) => (
            <div key={stat.text} className="flex items-center gap-2">
              <Icon name={stat.icon} className="text-sm text-outline" />
              <span className="font-body-md text-body-md text-on-surface-variant">{stat.text}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-outline-variant pt-4">
          <span className={`font-label-bold text-label-bold ${company.footer.className}`}>
            {company.footer.label}
          </span>
          <span className="rounded-full p-2 transition-transform group-hover:translate-x-1 hover:bg-surface-container">
            <Icon name="chevron_right" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CompaniesDirectoryPage({ initialCompanies = [] }: CompaniesDirectoryPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  const [companies, setCompanies] = useState<Company[]>(
    filterDisplayCompanies(initialCompanies),
  );
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [activeSector, setActiveSector] = useState("All Sectors");
  const [sortBy, setSortBy] = useState("Industry Authority");

  const loadCompanies = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const data = await getCompanies(search?.trim() || undefined);
      setCompanies(filterDisplayCompanies(data));
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSearchInput(searchQuery);
    if (!searchQuery) {
      setCompanies(filterDisplayCompanies(initialCompanies));
      return;
    }
    void loadCompanies(searchQuery);
  }, [searchQuery, loadCompanies, initialCompanies]);

  const sectors = useMemo(() => buildSectors(companies), [companies]);

  const filteredCompanies = useMemo(() => {
    let list = companies;
    if (activeSector !== "All Sectors") {
      list = list.filter((company) => company.industry?.trim() === activeSector);
    }
    return sortCompanies(list, sortBy);
  }, [activeSector, companies, sortBy]);

  const list = filteredCompanies.map(mapCompanyToCard);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (trimmed) params.set("search", trimmed);
    else params.delete("search");
    router.push(`/companies${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <PublicHeader />

      <main className="mx-auto min-h-screen w-full max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
        <section className="mb-stack-lg">
          <div className="mb-stack-lg flex flex-col items-center gap-stack-md text-center">
            <h1 className="max-w-4xl text-[40px] font-headline-xl font-extrabold leading-[1.1] tracking-tight text-primary md:text-[56px]">
              Elite Institutions. Sri Lanka&apos;s Finest.
            </h1>
            <p className="max-w-2xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              Curated access to high-growth organizations and established corporate giants. Powered
              by Executive Intelligence.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto flex max-w-3xl flex-wrap items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm lg:flex-nowrap"
          >
            <div className="flex grow items-center rounded border border-outline-variant bg-background px-4 py-2 transition-all focus-within:border-primary">
              <Icon name="search" className="mr-3 text-outline" />
              <input
                className="w-full border-none bg-transparent font-body-md text-body-md text-on-surface focus:ring-0"
                placeholder="Search by company name..."
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded bg-secondary px-8 py-2 font-label-bold text-label-bold text-on-secondary transition-all active:scale-95"
              >
                {loading ? "Searching…" : "Find Leaders"}
              </button>
            </div>
          </form>
        </section>

        {sectors.length > 1 ? (
          <div className="no-scrollbar mb-stack-lg flex items-center gap-3 overflow-x-auto pb-4">
            <span className="mr-4 font-label-bold text-label-bold text-on-surface-variant">
              Common Sectors:
            </span>
            {sectors.map((sector) => (
              <button
                key={sector}
                type="button"
                onClick={() => setActiveSector(sector)}
                className={
                  activeSector === sector
                    ? "whitespace-nowrap rounded-full bg-primary px-4 py-1.5 font-label-bold text-label-bold text-on-primary"
                    : "whitespace-nowrap rounded-full border border-outline-variant bg-surface-container-high px-4 py-1.5 font-label-bold text-label-bold text-on-surface-variant transition-colors hover:bg-surface-container-highest"
                }
              >
                {sector}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mb-stack-md flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-primary">All Verified Institutions</h2>
          <div className="flex items-center gap-4">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Sort by:</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="cursor-pointer border-none bg-transparent font-label-bold text-label-bold text-primary focus:ring-0"
            >
              <option>Industry Authority</option>
              <option>Recent Openings</option>
              <option>Company Size</option>
            </select>
          </div>
        </div>

        {loading && list.length === 0 ? (
          <p className="mb-stack-lg text-on-surface-variant">Loading companies…</p>
        ) : list.length === 0 ? (
          <div className="mb-stack-lg rounded-xl border border-outline-variant bg-surface-container-low p-12 text-center">
            <Icon name="business" className="mx-auto mb-4 text-4xl text-outline" />
            <p className="font-body-md text-on-surface-variant">
              No verified companies match your search. Try another name or clear filters.
            </p>
            <Link
              href="/employer/companies/new"
              className="mt-6 inline-flex rounded bg-secondary px-6 py-2 font-label-bold text-on-secondary"
            >
              Register Company
            </Link>
          </div>
        ) : (
          <div className="mb-stack-lg grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
            {list.map((company) => (
              <CompanyCard key={company.slug} company={company} />
            ))}

            <div className="flex flex-col items-center justify-center rounded-xl bg-secondary p-6 text-center text-on-secondary">
              <Icon name="add_business" className="mb-4 text-4xl" />
              <h4 className="mb-2 font-headline-md text-headline-md">List Your Organization</h4>
              <p className="mb-6 font-body-md text-body-md opacity-80">
                Gain access to the island&apos;s most qualified executive talent pool.
              </p>
              <Link
                href="/employer/companies/new"
                className="rounded bg-white px-6 py-2 font-label-bold text-label-bold text-secondary transition-all hover:bg-on-secondary-container"
              >
                Submit Application
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
