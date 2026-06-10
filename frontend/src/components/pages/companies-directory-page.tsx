import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { Icon } from "@/components/ui/icon";
import type { Company } from "@/lib/api/types";

type CompaniesDirectoryPageProps = {
  companies?: Company[];
};

type CompanyCardItem = {
  name: string;
  industry: string;
  logoUrl?: string | null;
  badge?: { label: string; className: string };
  stats: Array<{ icon: string; text: string }>;
  footer: { label: string; className: string };
  slug: string;
};

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

function hiringIntensityLabel(companies: Company[]) {
  if (companies.length === 0) return "—";
  const hiringCount = companies.filter((company) => (company._count?.jobs ?? 0) > 0).length;
  const ratio = hiringCount / companies.length;
  if (ratio >= 0.5) return "High";
  if (ratio >= 0.2) return "Medium";
  return "Low";
}

function topSectorByOpenings(companies: Company[]) {
  const totals = new Map<string, number>();

  for (const company of companies) {
    const industry = company.industry?.trim() || "Other";
    totals.set(industry, (totals.get(industry) ?? 0) + (company._count?.jobs ?? 0));
  }

  let topSector = "—";
  let topCount = 0;
  for (const [industry, count] of totals) {
    if (count > topCount) {
      topCount = count;
      topSector = industry;
    }
  }

  return topSector;
}

function pickFeaturedCompany(companies: Company[]) {
  if (companies.length === 0) return null;

  return [...companies].sort((a, b) => (b._count?.jobs ?? 0) - (a._count?.jobs ?? 0))[0];
}

export function CompaniesDirectoryPage({ companies = [] }: CompaniesDirectoryPageProps) {
  const list = companies.map(mapCompanyToCard);
  const sectors = buildSectors(companies);
  const featuredCompany = pickFeaturedCompany(companies);
  const featuredOpenRoles = featuredCompany?._count?.jobs ?? 0;
  const featuredImage =
    featuredCompany?.lifeAtCompanyImages?.[0] ??
    featuredCompany?.logoUrl ??
    null;

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <PublicHeader />

      <main className="mx-auto min-h-screen w-full max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
        <section className="mb-stack-lg">
          <div className="mb-stack-lg flex flex-col gap-stack-sm">
            <h1 className="max-w-2xl font-headline-xl text-headline-xl leading-tight text-primary">
              Elite Institutions. Sri Lanka&apos;s Finest.
            </h1>
            <p className="max-w-xl font-body-lg text-body-lg text-on-surface-variant">
              Curated access to high-growth organizations and established corporate giants. Powered by Executive
              Intelligence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm lg:flex-nowrap">
            <div className="flex grow items-center rounded border border-outline-variant bg-background px-4 py-2 transition-all focus-within:border-primary">
              <Icon name="search" className="mr-3 text-outline" />
              <input
                className="w-full border-none bg-transparent font-body-md text-body-md text-on-surface focus:ring-0"
                placeholder="Search by company name or ticker..."
                type="text"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded border border-outline-variant px-4 py-2 font-label-bold text-label-bold text-on-surface hover:bg-surface-container-low"
              >
                Industry <Icon name="expand_more" className="text-sm" />
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded border border-outline-variant px-4 py-2 font-label-bold text-label-bold text-on-surface hover:bg-surface-container-low"
              >
                Size <Icon name="expand_more" className="text-sm" />
              </button>
              <button
                type="button"
                className="rounded bg-secondary px-8 py-2 font-label-bold text-label-bold text-on-secondary transition-all active:scale-95"
              >
                Find Leaders
              </button>
            </div>
          </div>
        </section>

        {sectors.length > 1 ? (
          <div className="no-scrollbar mb-stack-lg flex items-center gap-3 overflow-x-auto pb-4">
            <span className="mr-4 font-label-bold text-label-bold text-on-surface-variant">
              Common Sectors:
            </span>
            {sectors.map((sector, index) => (
              <button
                key={sector}
                type="button"
                className={
                  index === 0
                    ? "whitespace-nowrap rounded-full bg-primary px-4 py-1.5 font-label-bold text-label-bold text-on-primary"
                    : "whitespace-nowrap rounded-full border border-outline-variant bg-surface-container-high px-4 py-1.5 font-label-bold text-label-bold text-on-surface-variant transition-colors hover:bg-surface-container-highest"
                }
              >
                {sector}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mb-stack-lg grid grid-cols-1 gap-gutter lg:grid-cols-12">
          {featuredCompany ? (
            <div className="executive-shadow group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all hover:border-secondary lg:col-span-8">
              <div className="absolute right-6 top-6 z-10">
                <span className="flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 font-label-sm text-label-sm text-on-secondary-container shadow-sm">
                  <Icon name="star" className="text-[14px]" filled />
                  {featuredOpenRoles > 0 ? "HIRING NOW" : "FEATURED"}
                </span>
              </div>
              <div className="relative aspect-[21/9] w-full overflow-hidden bg-surface-dim">
                {featuredImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    alt={`${featuredCompany.name} workplace`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={featuredImage}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-container-low">
                    <Icon name="corporate_fare" className="text-6xl text-outline" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end justify-between gap-6 p-8 md:flex-row">
                <div className="flex flex-col gap-2">
                  <div className="mb-2 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center border border-outline-variant bg-white p-2 shadow-sm">
                      {featuredCompany.logoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          alt=""
                          src={featuredCompany.logoUrl}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Icon name="corporate_fare" className="text-3xl text-secondary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-primary">
                        {featuredCompany.name}
                      </h3>
                      <p className="font-label-bold text-label-bold text-secondary">
                        {featuredCompany.industry ?? featuredCompany.companyType ?? "Enterprise"}
                      </p>
                    </div>
                  </div>
                  <p className="max-w-lg font-body-md text-body-md text-on-surface-variant">
                    {featuredCompany.description ??
                      `Explore careers and opportunities at ${featuredCompany.name}.`}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(featuredCompany.location ?? featuredCompany.city) ? (
                      <span className="rounded bg-surface-container px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
                        {featuredCompany.location ?? featuredCompany.city}
                      </span>
                    ) : null}
                    <span className="rounded bg-surface-container px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
                      {featuredOpenRoles} Open Role{featuredOpenRoles === 1 ? "" : "s"}
                    </span>
                    {featuredCompany.verified ? (
                      <span className="flex items-center gap-1 rounded bg-on-secondary-fixed-variant/10 px-3 py-1 font-label-sm text-label-sm text-on-secondary-fixed-variant">
                        <Icon name="verified" className="text-[14px]" />
                        Verified Employer
                      </span>
                    ) : null}
                  </div>
                </div>
                <Link
                  href={`/companies/${featuredCompany.slug}`}
                  className="w-full rounded bg-primary px-8 py-3 text-center font-label-bold text-label-bold text-on-primary transition-all hover:bg-on-surface-variant md:w-auto"
                >
                  View Ecosystem
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-8 lg:col-span-8">
              <p className="text-center font-body-md text-on-surface-variant">
                Verified companies will appear here once they are listed on JobsFinder.lk.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-gutter lg:col-span-4">
            <div className="flex grow flex-col justify-between rounded-xl bg-primary p-8 text-on-primary">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider opacity-60">
                  Directory Intelligence
                </span>
                <h4 className="mt-2 font-headline-md text-headline-md">Executive Insights</h4>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-body-md text-body-md opacity-80">Listed Companies</span>
                  <span className="font-label-bold text-label-bold">{companies.length}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-body-md text-body-md opacity-80">Hiring Intensity</span>
                  <span className="font-label-bold text-label-bold text-green-400">
                    {hiringIntensityLabel(companies)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body-md text-body-md opacity-80">Top Sector</span>
                  <span className="font-label-bold text-label-bold">
                    {topSectorByOpenings(companies)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="rounded border border-white/20 py-3 font-label-bold text-label-bold transition-all hover:bg-white/10"
              >
                Download 2024 Report
              </button>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-high p-8">
              <h4 className="mb-4 flex items-center gap-2 font-label-bold text-label-bold text-primary">
                <Icon name="psychology" />
                AI Match Recommendations
              </h4>
              <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
                Based on your executive profile, these institutions match your leadership style.
              </p>
              <div className="mb-6 flex -space-x-3">
                {list.slice(0, 3).map((company, index) => (
                  <div
                    key={company.slug}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-container-high font-bold ${["bg-blue-100", "bg-red-100", "bg-green-100"][index]}`}
                  >
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {list.length > 3 ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-container-high bg-surface-container text-xs">
                    +{list.length - 3}
                  </div>
                ) : null}
              </div>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 font-label-bold text-label-bold text-secondary hover:underline"
              >
                Start Career Scan
                <Icon name="arrow_forward" className="text-sm" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-stack-md flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-primary">All Verified Institutions</h2>
          <div className="flex items-center gap-4">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Sort by:</span>
            <select className="cursor-pointer border-none bg-transparent font-label-bold text-label-bold text-primary focus:ring-0">
              <option>Industry Authority</option>
              <option>Recent Openings</option>
              <option>Company Size</option>
            </select>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mb-stack-lg rounded-xl border border-outline-variant bg-surface-container-low p-12 text-center">
            <Icon name="business" className="mx-auto mb-4 text-4xl text-outline" />
            <p className="font-body-md text-on-surface-variant">
              No verified companies are listed yet. Check back soon or register your organization.
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
              <Link
                key={company.slug}
                href={`/companies/${company.slug}`}
                className="group flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-surface-container-low p-2">
                    {company.logoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        alt=""
                        src={company.logoUrl}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Icon name="business" className="text-secondary" />
                    )}
                  </div>
                  {company.badge ? (
                    <span className={`rounded px-2 py-0.5 font-label-sm text-label-sm ${company.badge.className}`}>
                      {company.badge.label}
                    </span>
                  ) : null}
                </div>
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
              </Link>
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
