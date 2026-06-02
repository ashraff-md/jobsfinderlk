import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { ApplyButton } from "@/components/jobs/apply-button";
import { JobArtworkBanner } from "@/components/jobs/job-artwork-banner";
import { Icon } from "@/components/ui/icon";
import { formatSalary } from "@/lib/api/jobs";
import type { Job } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type JobDetailPageProps = {
  job: Job;
};

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

const SIMILAR_JOBS = [
  {
    title: "Lead UI Designer",
    company: "DesignHub",
    location: "Remote",
    posted: "3d ago",
    tags: ["Full-time", "Remote"],
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRhfrANQByF1wleEZjIPrfQ1wEVX2l581LSmtAzox6ZH2BI_VflwkPC3c3jOSzNo1XkFRpY993vJgADgKElEswnolNZutu08PczDSQWmH5lnlhAehrbi9Wtj4eOVhdCq13WgdnYNbHDpt4W48XGeEaeMu1CmeGVGHZUY6IwwMG1csVQ08zSg0Uqg2ib5FDxyUtIv1gtV3W9X62qoo-2zAEi5ohcnTND2v4Lenjy728klpSSFTJv1b2zatMKouY48F6En5YNW7TCDOc",
    slug: "lead-ui-designer",
  },
  {
    title: "Interaction Specialist",
    company: "FutureScale",
    location: "Colombo",
    posted: "5h ago",
    tags: ["Contract", "On-site"],
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRK_2y7BwUdyAQGSLY8aQre341TIr-f-yjjQ-NchVG9zYeb67c3PIoW891JodwqD9sAP9Jevb6RNuotcvaBS3TVn1myHUUQgs-k4pUrlAURYHp75OZ8L5fpoZzjAtayoqWG6-rJqXVoRn7d7ooHvUjii2KcyT2FLcnl3-LVEF1StxPJOCcNC2Bf33Qb0w0G24ylNZsWS7NGU1wgvS_JamCR2nukUFWhx-4VTOngT4QJWqFzNDOPSEwKkg2gI86IVllde5KyCY4vOsa",
    slug: "interaction-specialist",
  },
  {
    title: "Staff Product Designer",
    company: "CloudFlow",
    location: "Hybrid",
    posted: "1w ago",
    tags: ["Full-time", "Equity"],
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfpg4l5fj-ZlE3jJVPiNCJGSyV1SpCbT3t6qUs0vff6E-6YY-uVh8WJBbnjKuA_pw-dwzg8FcswtOGcvjxKmYMSxlAX8ArrKE3FtPaZkASFpkT8MkYWSwhRfzksZoBXwYMP5HUElys9kQYXe65cAILrj1IiKiw6ziFPpPM_43Wu-g-tZ89W_demvqKxNzl5Z6dX6FGoxPI1cF_73XIbTF5tk30tRnYYcO_qozQmNvniMXQtSlxGG956po3t4meps8_89fmbFOMfSYi",
    slug: "staff-product-designer",
  },
];

const DEFAULT_JOB_ARTWORK =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCRYq9D7y8isAmQf4a_-bA1wy61pxxx-Qk1C4sUyF0HqT8zB-aIfwEpFJI2Mo53hN2tjYltcqh-LCry9krgWU5DxEXpgMEVQOUNpX3LzpBT-jVSgPRGzqaS5cNnZuzxrGnesQTQ0Y8ldIHOTMZyqbNVpPyUivdV5dLN8ZBQEJhfKKGb1l8oiffgDN_yraSX_TKdhJL8ix4v144m1b5-xEYiajHG4zHMplU_rFkOXJCeFsFl0FkpBLMry-G7nBTsnwm8HPDOx7feH8o1";

function SectionHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "mb-6 border-l-4 border-secondary pl-4 text-2xl font-extrabold tracking-tight text-navy-deep md:text-[32px]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

function SubsectionHeading({ children }: { children: ReactNode }) {
  return <h4 className="mb-2 text-lg font-extrabold text-navy-deep">{children}</h4>;
}

export function JobDetailPage({ job }: JobDetailPageProps) {
  const { company } = job;
  const artworkUrl = job.vacancyArtworkUrl ?? DEFAULT_JOB_ARTWORK;

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface selection:bg-navy-deep/10">
      <PublicHeader />

      <main className="mx-auto w-full max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <div className="mb-12">
          <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="flex-1">
              <h1 className="mb-3 text-4xl font-extrabold leading-[1.1] tracking-tight text-navy-deep md:text-5xl lg:text-[56px]">
                {job.title}
              </h1>
              <div className="mb-4 flex items-center gap-3">
                {company.verified && (
                  <div className="flex items-center gap-1.5 rounded-xl bg-secondary/10 px-3 py-1 font-label-sm text-secondary">
                    <Icon name="verified" className="text-[16px]" filled />
                    Verified Employer
                  </div>
                )}
                <span className="text-label-sm text-on-surface-variant">Posted {timeAgo(job.publishedAt)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <Icon name="corporate_fare" className="text-navy-deep" />
                  <span className="font-body-md font-semibold text-on-surface">{company.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="location_on" className="text-navy-deep" />
                  <span className="font-body-md">{job.location ?? "Sri Lanka"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="payments" className="text-navy-deep" />
                  <span className="font-body-md">{formatSalary(job.salaryMin, job.salaryMax)} / mo</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" className="rounded-xl border border-outline-variant p-3 transition-colors hover:bg-surface-container-low">
                <Icon name="bookmark" className="text-on-surface-variant" />
              </button>
              <button type="button" className="rounded-xl border border-outline-variant p-3 transition-colors hover:bg-surface-container-low">
                <Icon name="share" className="text-on-surface-variant" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            <section>
              <SectionHeading>About this role</SectionHeading>
              <p className="mb-6 whitespace-pre-wrap font-body-lg leading-relaxed text-on-surface-variant">
                {job.description}
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-6">
                  <Icon name="lightbulb" className="mb-3 text-navy-deep" />
                  <SubsectionHeading>Strategy-Led Design</SubsectionHeading>
                  <p className="font-body-md text-on-surface-variant">
                    Bridge the gap between business goals and user needs with data-driven design decisions.
                  </p>
                </div>
                <div className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-6">
                  <Icon name="auto_awesome" className="mb-3 text-navy-deep" />
                  <SubsectionHeading>Next-Gen UX</SubsectionHeading>
                  <p className="font-body-md text-on-surface-variant">
                    Utilize AI and predictive analytics to create proactive rather than reactive user interfaces.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <SectionHeading>Core Responsibilities</SectionHeading>
              <ul className="space-y-4">
                {[
                  "Lead the end-to-end design process for our core SaaS platform, from discovery and research to high-fidelity prototyping and engineering handoff.",
                  "Mentor junior designers and contribute to the evolution of our global design system \"NexusCore\".",
                  "Collaborate closely with product managers and engineers to ensure technical feasibility without compromising on the user experience.",
                  "Conduct user testing sessions and translate complex qualitative feedback into actionable design improvements.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-4">
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-navy-deep" />
                    <p className="font-body-md text-on-surface-variant">{item}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionHeading>Minimum Requirements</SectionHeading>
              <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                {[
                  { icon: "school", text: "5+ Years of Professional Experience" },
                  { icon: "terminal", text: "Proficiency in Figma, Framer, and Adobe Suite" },
                  { icon: "language", text: "Strong portfolio demonstrating complex SaaS workflows" },
                ].map((req, i, arr) => (
                  <div
                    key={req.text}
                    className={`flex items-center gap-4 p-6 ${i < arr.length - 1 ? "border-b border-outline-variant" : ""}`}
                  >
                    <Icon name={req.icon} className="text-navy-deep" />
                    <span className="font-label-bold">{req.text}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-gutter">
              <div className="relative overflow-hidden rounded-xl bg-navy-deep p-8 text-white shadow-xl">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                <div className="relative z-10">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <div className="mb-1 font-label-sm uppercase tracking-wider opacity-70">AI Match Score</div>
                      <div className="font-headline-md text-white">94% Perfect Fit</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5">
                      <Icon name="psychology" className="text-white" />
                    </div>
                  </div>
                  <div className="mb-8 space-y-4">
                    <p className="font-body-md leading-relaxed opacity-90">
                      Your profile perfectly aligns with the required experience in Figma and SaaS design.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Design Systems", "Figma Expert", "Prototyping"].map((tag) => (
                        <span key={tag} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-label-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ApplyButton slug={job.slug} />
                </div>
              </div>

              <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm">
                <h4 className="mb-6 border-l-4 border-secondary pl-3 text-lg font-extrabold text-navy-deep">
                  Salary Insights
                </h4>
                <div className="mb-4 flex h-32 items-end gap-3">
                  <div className="h-[40%] flex-1 rounded-t-xl bg-surface-container-high" />
                  <div className="h-[85%] flex-1 rounded-t-xl bg-navy-deep" />
                  <div className="h-[95%] flex-1 rounded-t-xl bg-secondary-container" />
                </div>
                <p className="font-label-sm text-on-surface-variant">
                  This position offers <span className="font-bold text-secondary">12% more</span> than the market average
                  for your location.
                </p>
              </div>

              <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface-container text-2xl font-bold text-primary">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-on-surface">{company.name}</h4>
                    <p className="font-label-sm text-on-surface-variant">
                      {job.industry ?? "Enterprise"} • {job.employmentType ?? "Full-time"}
                    </p>
                  </div>
                </div>
                {company.description && (
                  <p className="mb-6 line-clamp-3 font-body-md text-on-surface-variant">
                    {company.description}
                  </p>
                )}
                <Link
                  href={`/companies/${company.slug}`}
                  className="block w-full rounded-xl border border-navy-deep py-3 text-center font-bold text-navy-deep transition-all hover:bg-navy-deep/5"
                >
                  View Company
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="lg:col-span-8">
            <JobArtworkBanner
              artworkUrl={artworkUrl}
              title={job.title}
              companyName={company.name}
              showOverlay={!job.vacancyArtworkUrl}
            />
          </div>
        </div>

        <section className="mt-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <SectionHeading className="mb-2">Company Reviews</SectionHeading>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex text-amber-500">
                  <Icon name="star" filled />
                  <Icon name="star" filled />
                  <Icon name="star" filled />
                  <Icon name="star" filled />
                  <Icon name="star_half" />
                </div>
                <span className="font-label-bold text-on-surface">4.2</span>
                <span className="font-label-sm text-on-surface-variant">(128 reviews)</span>
              </div>
            </div>
            <button type="button" className="font-label-bold font-bold text-navy-deep hover:underline">
              Read All Reviews
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                name: "Senior UX Engineer",
                meta: "Current Employee • 2 years at TechNexus",
                quote:
                  "Amazing culture and freedom to experiment with new technologies. The design team is highly respected within the organization.",
                avatar:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCnvQxnpd8rhMq_amkn7OVe4lxd4LBCIIjn9h-8_DVpKUVd5FYABeftshxYdPAiHYzDGa_kxE_dFqehN56PWO3rRf79BAx46fhppJB1jvqoxTa523nVrYEkHsr4mAjRVVPGJ2CcXnOnFq2U3hbBy3U_3XP_vMqp6V0tkIgurlHL1F8hgZqMysGg3t_vUx-L-hg-ItpoxgxyLkia8HMTEmapHnEbSSSzklzl4mtOunWtZUrRP52IJmew2xbZLYzJNRuaouyJA1EbvDOb",
              },
              {
                name: "Product Manager",
                meta: "Former Employee • 4 years at TechNexus",
                quote:
                  "Fast-paced environment but very rewarding. Great benefits and strong emphasis on professional development.",
                avatar:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuClpqDxn4uhulr2S6zobM_ZdBmb2cL0rsbXS9fgOmiAwWl2qB_ASH6rQRF7VUyjDRUgGpBbAC4XiWMJE9FrQ_ZTZsp2dDA66MjikkdJFqFmvMKJvjuz1YtiOxXb3S5oy48aWGWhEyfK82Q_FvtgJIurhjYNhUKIgIcVCAaZCCN3GM0BavFiSMKtDpuFhpMQkiGO0kmMjuf8qbscO7W1HaO9zM_1ledrlaMg_aWLrpb2llGFNi50SIjF0aJfFAdnnZNSkQSZG9G5xGqV",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="rounded-xl border border-outline-variant bg-white p-8 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={review.name}
                    className="h-12 w-12 rounded-full border border-outline-variant"
                    src={review.avatar}
                  />
                  <div>
                    <h5 className="font-label-bold text-on-surface">{review.name}</h5>
                    <p className="font-label-sm text-on-surface-variant">{review.meta}</p>
                  </div>
                </div>
                <p className="font-body-md italic text-on-surface-variant">&ldquo;{review.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-24 mt-24">
          <SectionHeading>Similar Opportunities</SectionHeading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SIMILAR_JOBS.map((job) => (
              <Link
                key={job.slug}
                href={`/jobs/${job.slug}`}
                className="group rounded-xl border border-outline-variant bg-white p-6 transition-all hover:border-navy-deep"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-surface-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={job.company} className="h-full w-full object-cover" src={job.logo} />
                  </div>
                  <span className="text-label-sm text-on-surface-variant">{job.posted}</span>
                </div>
                <h4 className="mb-2 text-lg font-label-bold transition-colors group-hover:text-navy-deep">
                  {job.title}
                </h4>
                <p className="mb-4 font-label-sm text-on-surface-variant">
                  {job.company} • {job.location}
                </p>
                <div className="flex gap-2">
                  {job.tags.map((tag) => (
                    <span key={tag} className="rounded bg-surface-container px-2 py-1 text-label-sm text-on-surface-variant">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter variant="dark" />
    </div>
  );
}
