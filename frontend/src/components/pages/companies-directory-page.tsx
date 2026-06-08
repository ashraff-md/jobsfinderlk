import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { Icon } from "@/components/ui/icon";
import type { Company } from "@/lib/api/types";

type CompaniesDirectoryPageProps = {
  companies?: Company[];
};

const SECTORS = [
  "All Sectors",
  "Technology & SaaS",
  "Banking & Finance",
  "Manufacturing",
  "Logistics",
  "Hospitality",
];

const COMPANIES = [
  {
    name: "Commercial Bank",
    industry: "Banking & Financial Services",
    icon: "account_balance",
    badge: { label: "Hiring Now", className: "text-green-600 bg-green-50" },
    stats: [
      { icon: "groups", text: "5,000+ Team Members" },
      { icon: "workspace_premium", text: "Top Tier Stability Rating" },
    ],
    footer: { label: "4 Open Roles", className: "text-secondary" },
    slug: "commercial-bank",
  },
  {
    name: "MAS Holdings",
    industry: "Manufacturing & Textiles",
    icon: "precision_manufacturing",
    stats: [
      { icon: "groups", text: "90,000+ Global Team" },
      { icon: "eco", text: "Innovation Leader" },
    ],
    footer: { label: "Talent Pool Only", className: "text-on-surface-variant" },
    slug: "mas-holdings",
  },
  {
    name: "Sysco LABS",
    industry: "Tech Hub & Global Services",
    icon: "cloud",
    badge: { label: "Fast Growing", className: "text-secondary bg-secondary/10" },
    stats: [
      { icon: "groups", text: "1,200+ Team Members" },
      { icon: "verified", text: "Fortune 50 Subsidiary" },
    ],
    footer: { label: "18 Open Roles", className: "text-secondary" },
    slug: "sysco-labs",
  },
  {
    name: "Hayleys PLC",
    industry: "Conglomerate",
    icon: "factory",
    stats: [
      { icon: "groups", text: "30,000+ Team Members" },
      { icon: "history_edu", text: "140 Year Heritage" },
    ],
    footer: { label: "7 Open Roles", className: "text-secondary" },
    slug: "hayleys-plc",
  },
  {
    name: "Expolanka",
    industry: "Logistics & Freight",
    icon: "local_shipping",
    stats: [
      { icon: "groups", text: "3,500+ Global Team" },
      { icon: "public", text: "Global Market Reach" },
    ],
    footer: { label: "No Openings", className: "text-on-surface-variant" },
    slug: "expolanka",
  },
];

export function CompaniesDirectoryPage({ companies: apiCompanies }: CompaniesDirectoryPageProps) {
  const list =
    apiCompanies && apiCompanies.length > 0
      ? apiCompanies.map((c) => ({
          name: c.name,
          industry: c.description?.slice(0, 48) ?? "Enterprise",
          icon: "business" as const,
          badge:
            (c._count?.jobs ?? 0) > 0
              ? { label: "Hiring Now", className: "text-green-600 bg-green-50" }
              : undefined,
          stats: [{ icon: "work" as const, text: `${c._count?.jobs ?? 0} Open Roles` }],
          footer: {
            label: `${c._count?.jobs ?? 0} Open Role${(c._count?.jobs ?? 0) === 1 ? "" : "s"}`,
            className: (c._count?.jobs ?? 0) > 0 ? "text-secondary" : "text-on-surface-variant",
          },
          slug: c.slug,
        }))
      : COMPANIES;

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

        <div className="no-scrollbar mb-stack-lg flex items-center gap-3 overflow-x-auto pb-4">
          <span className="mr-4 font-label-bold text-label-bold text-on-surface-variant">Common Sectors:</span>
          {SECTORS.map((sector, i) => (
            <button
              key={sector}
              type="button"
              className={
                i === 0
                  ? "whitespace-nowrap rounded-full bg-primary px-4 py-1.5 font-label-bold text-label-bold text-on-primary"
                  : "whitespace-nowrap rounded-full border border-outline-variant bg-surface-container-high px-4 py-1.5 font-label-bold text-label-bold text-on-surface-variant transition-colors hover:bg-surface-container-highest"
              }
            >
              {sector}
            </button>
          ))}
        </div>

        <div className="mb-stack-lg grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="executive-shadow group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all hover:border-secondary lg:col-span-8">
            <div className="absolute right-6 top-6 z-10">
              <span className="flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 font-label-sm text-label-sm text-on-secondary-container shadow-sm">
                <Icon name="star" className="text-[14px]" filled />
                PREMIUM PLACEMENT
              </span>
            </div>
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-surface-dim">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="WSO2 headquarters"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQFiylGjN_j32Wic3n9q9FuPnUSrwfO3MbA6fOQe1JigKJvRMSUgH8iRKAPJQBm7iBU32OErlRep6Ko67rME6JkVA7xhLo20pWgGEYhL4qLhYzRVPPtowFyViqHhzdAlzjPc3pmtJxeTcmql97Onzz4iJXtVOIdoP3nhFQJnvhz2ZmsIjQqTqx4hQmvVSKAuynwdp695M0VDReeeI-EUkGfFe_6ecGKMR48li91KGiGwtRdBCbrjOgrGJ5RmNf5ioIISj7Htue--5u"
              />
            </div>
            <div className="flex flex-col items-end justify-between gap-6 p-8 md:flex-row">
              <div className="flex flex-col gap-2">
                <div className="mb-2 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center border border-outline-variant bg-white p-2 shadow-sm">
                    <Icon name="corporate_fare" className="text-3xl text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary">WSO2 Global</h3>
                    <p className="font-label-bold text-label-bold text-secondary">Technology & Open Source</p>
                  </div>
                </div>
                <p className="max-w-lg font-body-md text-body-md text-on-surface-variant">
                  The world&apos;s leading open-source integration vendor, powering digital transformation for global
                  enterprises from their Colombo hub.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded bg-surface-container px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
                    800+ Employees
                  </span>
                  <span className="rounded bg-surface-container px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
                    12 Open Roles
                  </span>
                  <span className="flex items-center gap-1 rounded bg-on-secondary-fixed-variant/10 px-3 py-1 font-label-sm text-label-sm text-on-secondary-fixed-variant">
                    <Icon name="bolt" className="text-[14px]" />
                    AI Efficiency Rank: Top 1%
                  </span>
                </div>
              </div>
              <Link
                href="/companies/wso2"
                className="w-full rounded bg-primary px-8 py-3 text-center font-label-bold text-label-bold text-on-primary transition-all hover:bg-on-surface-variant md:w-auto"
              >
                View Ecosystem
              </Link>
            </div>
          </div>

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
                  <span className="font-label-bold text-label-bold">482</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-body-md text-body-md opacity-80">Hiring Intensity</span>
                  <span className="font-label-bold text-label-bold text-green-400">High</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body-md text-body-md opacity-80">Top Sector</span>
                  <span className="font-label-bold text-label-bold">FinTech</span>
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
                {["J", "H", "M"].map((letter, i) => (
                  <div
                    key={letter}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-container-high font-bold ${["bg-blue-100", "bg-red-100", "bg-green-100"][i]}`}
                  >
                    {letter}
                  </div>
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-container-high bg-surface-container text-xs">
                  +5
                </div>
              </div>
              <Link href="/dashboard/profile" className="flex items-center gap-2 font-label-bold text-label-bold text-secondary hover:underline">
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

        <div className="mb-stack-lg grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {list.map((company) => (
            <Link
              key={company.slug}
              href={`/companies/${company.slug}`}
              className="group flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded bg-surface-container-low p-2">
                  <Icon name={company.icon} className="text-secondary" />
                </div>
                {company.badge && (
                  <span className={`rounded px-2 py-0.5 font-label-sm text-label-sm ${company.badge.className}`}>
                    {company.badge.label}
                  </span>
                )}
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
              href="/employer/jobs/new"
              className="rounded bg-white px-6 py-2 font-label-bold text-label-bold text-secondary transition-all hover:bg-on-secondary-container"
            >
              Submit Application
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant transition-colors hover:bg-surface-container">
            <Icon name="arrow_back" />
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded bg-primary font-label-bold text-label-bold text-on-primary">
            1
          </button>
          {[2, 3].map((page) => (
            <button
              key={page}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant font-label-bold text-label-bold transition-colors hover:bg-surface-container"
            >
              {page}
            </button>
          ))}
          <span className="mx-2">...</span>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant font-label-bold text-label-bold transition-colors hover:bg-surface-container">
            12
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant transition-colors hover:bg-surface-container">
            <Icon name="arrow_forward" />
          </button>
        </div>
      </main>
    </div>
  );
}
