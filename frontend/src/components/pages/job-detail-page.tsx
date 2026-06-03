import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { JobDetailView } from "@/components/jobs/job-detail-view";
import { Icon } from "@/components/ui/icon";
import type { Job } from "@/lib/api/types";

type JobDetailPageProps = {
  job: Job;
};

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

function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`mb-6 border-l-4 border-secondary pl-4 text-2xl font-extrabold tracking-tight text-navy-deep md:text-[32px] ${className ?? ""}`}
    >
      {children}
    </h2>
  );
}

export function JobDetailPage({ job }: JobDetailPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface selection:bg-navy-deep/10">
      <PublicHeader />

      <main className="mx-auto w-full max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <JobDetailView job={job} />

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
            {SIMILAR_JOBS.map((similar) => (
              <Link
                key={similar.slug}
                href={`/jobs/${similar.slug}`}
                className="group rounded-xl border border-outline-variant bg-white p-6 transition-all hover:border-navy-deep"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-surface-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={similar.company} className="h-full w-full object-cover" src={similar.logo} />
                  </div>
                  <span className="text-label-sm text-on-surface-variant">{similar.posted}</span>
                </div>
                <h4 className="mb-2 text-lg font-label-bold transition-colors group-hover:text-navy-deep">
                  {similar.title}
                </h4>
                <p className="mb-4 font-label-sm text-on-surface-variant">
                  {similar.company} • {similar.location}
                </p>
                <div className="flex gap-2">
                  {similar.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-surface-container px-2 py-1 text-label-sm text-on-surface-variant"
                    >
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
