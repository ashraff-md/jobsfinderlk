import Link from "next/link";
import { SeekerShell } from "@/components/layout/seeker-shell";
import { Icon } from "@/components/ui/icon";

const SAVED_JOBS = [
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBebrpTWokyaMSsQuNWsEhtwq0dtgcBstAiAQShL6ZswH4zBbi8RLOaFAgIvHMWLSf6BQFOILwBuu0wzaxrQ8tB4WFPwmKsh_9TqdR_Fa3TSoxuf5H8QMF_YGKhLvgbPtueXHlf29VgVB4cQfwZJ6LjN9BcBFwEnZeX4d9Cx3QWAD3dCNIxSwbTTIRzcHEJBcwhJrtbBwLtMEqmgexoKtQenF9XpZWzeu0GyQoZm7KcACqKRjQxMcpcJtbBJbqGIfQtfn7siC_gHYLp",
    title: "Senior UX Architect",
    company: "Global FinTech Solutions",
    location: "Colombo, Sri Lanka (Remote)",
    salary: "$4,500 - $6,200 /mo",
    saved: "Saved 2 days ago",
  },
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_hjeH9Dp27ZcnozxkGBRDs7rTcT-CooRwZT7Zp605_0EmVIWhfpu0qlrBX0GUTrgHWbN9lWn75ePDpYn_SCPOYkHVFffhHJckdaCXvJhTwu2SpOS-n8VrNn80JHM55WUPnMQoEK-J0gMFwN3L66Mm36Htg9r72212AA0t025qb5vAvWt6FeGjxJ7z_MOeYdw587IPHAhOF76LHzN1wDwhEvSI5dv3wuEBuQhKIgOKt_4elGK-Kc1jJuRqyhF1hBrulQPeP2769QeE",
    title: "VP of Engineering",
    company: "Stellar Scale Systems",
    location: "Kandy, Sri Lanka",
    salary: "$8,000 - $11,500 /mo",
    saved: "Saved 4 days ago",
  },
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjJoheFSKNUO_0dBflOYAjV0EoFam2gF1-dvTaQ6_B-DmiBvkoAnpheZ_DKA7Zo6-qf_PWwrEh5roW1tEgoF-lqlicQlPiOnnyi-YDyfXYiTEMx4V32OUewj_WKz3BDPTKI4wBjvfRaAYsZZqKu_ePeeXWi7hRyTDBdWIInDQVyYqttPqLyR4IyYNjTdo9namWmz6KcqWHDgPbcytl5iMhZ6UC0gcW-LXH42wFm1-9uex-ERGZcfJfgXdNuBKmp9xxfKnBSZ7mKjYh",
    title: "Product Lead",
    company: "Innovate UX",
    location: "Colombo 07, Sri Lanka",
    salary: "$3,200 - $5,000 /mo",
    saved: "Saved 1 week ago",
  },
];

const SUGGESTIONS = [
  { initial: "S", match: "98% Match", title: "Design Director", company: "Studio X Global", salary: "$7k - $9k" },
  { initial: "N", match: "92% Match", title: "Head of Design", company: "Nexus Labs", salary: "$5k - $7k" },
  { initial: "A", match: "89% Match", title: "Lead Visual Designer", company: "Apex Creative", salary: "$4k - $6k" },
];

export function SeekerSavedJobsPage() {
  return (
    <SeekerShell activeNav="saved" userName="Alex Silva">
      <div className="mx-auto max-w-container-max">
        <div className="mb-stack-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary-container">Saved Jobs</h1>
          <p className="mt-2 font-body-md text-outline">
            Manage and track your bookmarked career opportunities.
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-gutter xl:grid-cols-2">
          {SAVED_JOBS.map((job) => (
            <div
              key={job.title}
              className="professional-card group flex flex-col gap-6 rounded-lg p-6 transition-all hover:border-secondary md:flex-row"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-outline-variant">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="h-full w-full object-cover" src={job.logo} />
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary-container transition-colors group-hover:text-secondary">
                      {job.title}
                    </h3>
                    <p className="font-label-bold text-outline">{job.company}</p>
                  </div>
                  <button
                    type="button"
                    className="text-outline transition-colors hover:text-error"
                    aria-label="Remove saved job"
                  >
                    <Icon name="delete" />
                  </button>
                </div>
                <div className="mb-6 flex flex-wrap gap-4">
                  <span className="flex items-center gap-1 text-label-sm text-outline">
                    <Icon name="location_on" className="text-[18px]" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-label-sm text-outline">
                    <Icon name="payments" className="text-[18px]" />
                    {job.salary}
                  </span>
                  <span className="flex items-center gap-1 text-label-sm text-outline">
                    <Icon name="schedule" className="text-[18px]" />
                    {job.saved}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded bg-primary-container px-6 py-2 font-label-bold text-white transition-all hover:opacity-90"
                  >
                    Quick Apply
                  </button>
                  <button
                    type="button"
                    className="rounded border border-primary-container px-6 py-2 font-label-bold text-primary-container transition-all hover:bg-surface-container"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="border-t border-outline-variant pt-12">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="mb-2 font-headline-lg text-headline-lg text-primary-container">
                Suggested based on your saves
              </h2>
              <p className="font-body-md text-outline">
                We think these roles might be a great fit for your expertise.
              </p>
            </div>
            <Link
              href="/jobs"
              className="flex items-center gap-1 font-label-bold text-secondary hover:underline"
            >
              View All Recommendations
              <Icon name="arrow_forward" className="text-[20px]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {SUGGESTIONS.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-transparent bg-surface-container-low p-6 transition-all hover:border-secondary"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest font-bold text-primary-container">
                    {item.initial}
                  </div>
                  <span className="rounded bg-secondary/10 px-2 py-1 text-label-sm text-secondary">
                    {item.match}
                  </span>
                </div>
                <h4 className="mb-1 font-label-bold text-primary-container">{item.title}</h4>
                <p className="mb-4 text-label-sm text-outline">{item.company}</p>
                <div className="flex items-center justify-between border-t border-outline-variant pt-4">
                  <span className="text-label-sm font-semibold text-on-surface">{item.salary}</span>
                  <button type="button" className="text-secondary" aria-label="Save job">
                    <Icon name="bookmark_add" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SeekerShell>
  );
}
