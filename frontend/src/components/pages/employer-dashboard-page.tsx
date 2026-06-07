"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";

const JOBS = [
  { id: "senior-product-designer", title: "Senior Product Designer", views: 842, status: "active" },
  { id: "frontend-dev-react", title: "Frontend Dev (React)", views: 615, status: "active" },
  { id: "marketing-manager", title: "Marketing Manager", views: 230, status: "closed" },
  { id: "product-owner", title: "Product Owner", views: 455, status: "active" },
] as const;

const ACTIVE_JOBS = JOBS.filter((job) => job.status === "active");

const METRICS = [
  {
    label: "Total Job Views",
    value: "24,502",
    trend: "+12.5% this month",
    icon: "trending_up",
  },
  {
    label: "New Applicants",
    value: "1,284",
    bars: [40, 60, 50, 80, 70, 100],
  },
  {
    label: "Interview Rate",
    value: "18.4%",
    note: "Above average",
    icon: "bolt",
  },
];

const APPLICANTS = [
  {
    jobId: "senior-product-designer",
    name: "Elena Rodriguez",
    location: "Barcelona, Spain",
    applied: "2 days ago",
    experience: "8 Years • Stripe, Uber",
    status: "In Review",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuATvL1KSNoQESdVxuNRsJBl23fNZOYF5JXQdD0N0TpxHMd565SBBtpoIiG6KQF9yzu4JfktyFth4KjUR1BSSjxbw9wJeTD4JtKg-Fx6NJM-wWMYAfecdVF8wVQl_6QiUiosKQA_UUiODCdqYYt_P7nhkzODDZoTFTUDZxSCaUZHlcTu4nAP5UbsMo0cld80MNY1NR5tummThVjtXPTX3RSZNO24M59AyV7yBH-YgpkSyKfiOyivHDxZSIh2Ljo6xKpNVf1l9FJqrTq5",
  },
  {
    jobId: "senior-product-designer",
    name: "Jordan Smith",
    location: "London, UK",
    applied: "4 days ago",
    experience: "5 Years • Revolut",
    status: "Screening",
    initials: "JS",
  },
  {
    jobId: "frontend-dev-react",
    name: "Marcus Chen",
    location: "Singapore",
    applied: "1 week ago",
    experience: "12 Years • Grab, Sea",
    status: "Interviewing",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZQiXvG0Cs8cAvTJSC2zbxtnmbx2YgNIFdFmC8y1yokaNetssRK6PXacc0WmtjpQ10WY6orlxPYvE3INiqxjtGLCZ3aHIU4A_qUXHTeVAQQta0MEuDK1dpzPTV-HfWbAgJBzR6b0ea9wTWIMiP7bVpNECk9xmcWpeChPY-MZiUCRK0CiQZoXGc9Ahhr3LWH88Va-LVTYicqLcESkYOLgCSZJQ93645XO8U9z0NioBgbB7MDa41QB-70_QB6UGpRH18mha73pCSWloF",
  },
];

export function EmployerDashboardPage() {
  const [selectedJobId, setSelectedJobId] = useState<string>(ACTIVE_JOBS[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedJob = useMemo(
    () => ACTIVE_JOBS.find((job) => job.id === selectedJobId),
    [selectedJobId],
  );

  const filteredApplicants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return APPLICANTS.filter((applicant) => {
      if (applicant.jobId !== selectedJobId) return false;
      if (!query) return true;

      return (
        applicant.name.toLowerCase().includes(query) ||
        applicant.location.toLowerCase().includes(query) ||
        applicant.experience.toLowerCase().includes(query) ||
        applicant.status.toLowerCase().includes(query)
      );
    });
  }, [selectedJobId, searchQuery]);

  return (
    <>
      <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-headline-xl font-extrabold leading-tight text-primary-container md:text-[40px]">
            Recruiter Command Center
          </h2>
          <p className="mt-2 font-body-lg text-body-lg text-outline">
            Real-time performance metrics and applicant tracking.
          </p>
        </div>
      </header>

      <section className="mb-12 grid grid-cols-1 gap-gutter md:grid-cols-4">
        {METRICS.map((metric, index) => (
          <div
            key={metric.label}
            className={
              index === 3
                ? "relative flex flex-col justify-between overflow-hidden rounded border border-white/10 bg-primary-container p-6 text-white shadow-lg"
                : "professional-card flex flex-col justify-between rounded p-6"
            }
          >
            {index === 3 ? (
              <>
                <div className="relative z-10">
                  <p className="mb-1 text-xs font-label-bold uppercase tracking-widest text-on-primary-container">
                    Current Plan
                  </p>
                  <h3 className="text-headline-lg font-bold">Enterprise Pro</h3>
                </div>
                <div className="relative z-10 mt-4 flex flex-col gap-2">
                  <div className="h-2 w-full overflow-hidden rounded bg-white/10">
                    <div className="h-full w-[70%] bg-secondary" />
                  </div>
                  <p className="text-xs font-bold text-on-primary-container">
                    14/20 ACTIVE JOB SLOTS USED
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-[0.03]">
                  <Icon name="verified" className="text-[120px]" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="mb-2 text-xs font-label-bold uppercase tracking-widest text-outline">
                    {metric.label}
                  </p>
                  <h3 className="text-headline-xl font-bold text-primary-container">{metric.value}</h3>
                </div>
                {metric.trend && (
                  <div className="mt-4 flex items-center gap-2 text-sm font-label-bold text-secondary">
                    <Icon name={metric.icon!} className="text-[18px]" />
                    <span>{metric.trend}</span>
                  </div>
                )}
                {metric.bars && (
                  <div className="mt-4 flex h-10 w-full items-end gap-1.5">
                    {metric.bars.map((height, i) => (
                      <div
                        key={i}
                        className={`w-full rounded-sm ${
                          i >= 3 ? (i === 5 ? "bg-secondary" : "bg-secondary/30") : "bg-secondary/10"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                )}
                {metric.note && (
                  <div className="mt-4 flex items-center gap-2 text-sm font-label-bold text-on-surface-variant">
                    <Icon name={metric.icon!} className="text-[18px]" />
                    <span>{metric.note}</span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </section>

      <section className="mb-12">
        <div className="professional-card flex flex-col overflow-hidden rounded">
          <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface-container-low p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="text-2xl font-headline-xl text-headline-xl text-primary-container md:text-3xl">
                Applied Applicants
              </h2>
              <div className="flex gap-2 sm:shrink-0">
                <button type="button" className="rounded p-2 text-outline transition-colors hover:bg-surface-container-high hover:text-primary-container">
                  <Icon name="more_vert" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative w-full xl:max-w-md">
                <Icon
                  name="search"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search applicants by name, location, or status..."
                  className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-12 pr-4 text-base font-body-md text-on-surface outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 xl:ml-auto">
                <select
                  id="applied-applicants-job"
                  value={selectedJobId}
                  onChange={(event) => setSelectedJobId(event.target.value)}
                  className="min-w-[240px] max-w-full cursor-pointer rounded-lg border border-outline-variant bg-white px-4 py-3 text-base font-label-bold text-on-surface outline-none transition-colors focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                >
                  {ACTIVE_JOBS.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
                {selectedJob && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-4 py-3 text-base text-outline">
                    <Icon name="visibility" className="text-[18px] text-secondary" />
                    <span>
                      <span className="font-label-bold text-primary-container">
                        {selectedJob.views.toLocaleString()}
                      </span>{" "}
                      views
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-xs font-bold uppercase tracking-widest text-outline sm:text-sm">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4 whitespace-nowrap">Applied</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="w-[148px] px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-base text-outline">
                      {searchQuery.trim()
                        ? "No applicants match your search."
                        : "No applicants for this job yet."}
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((applicant) => (
                  <tr key={applicant.name} className="group transition-colors hover:bg-surface-container-low">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        {applicant.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            className="h-10 w-10 rounded-lg border border-outline-variant object-cover"
                            src={applicant.avatar}
                            alt=""
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-highest font-bold text-primary-container">
                            {applicant.initials}
                          </div>
                        )}
                        <div>
                          <p className="text-base font-label-bold text-primary-container">{applicant.name}</p>
                          <p className="text-sm text-outline">{applicant.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-base text-outline whitespace-nowrap">
                      {applicant.applied}
                    </td>
                    <td className="px-6 py-4 align-middle text-base text-outline">{applicant.experience}</td>
                    <td className="px-6 py-4 align-middle whitespace-nowrap">
                      <span className="rounded border border-outline-variant bg-surface-container-high px-2.5 py-1 text-sm font-bold text-primary-container">
                        {applicant.status}
                      </span>
                    </td>
                    <td className="w-[148px] px-6 py-4 align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="Message"
                          aria-label="Message applicant"
                          className="inline-flex h-9 w-9 items-center justify-center rounded text-secondary transition-colors hover:bg-surface-container-high"
                        >
                          <Icon name="chat_bubble" className="text-[20px]" />
                        </button>
                        <button
                          type="button"
                          title="Schedule interview"
                          aria-label="Schedule interview"
                          className="inline-flex h-9 w-9 items-center justify-center rounded text-primary-container transition-colors hover:bg-surface-container-high"
                        >
                          <Icon name="calendar_today" className="text-[20px]" />
                        </button>
                        <button
                          type="button"
                          title="Reject applicant"
                          aria-label="Reject applicant"
                          className="inline-flex h-9 w-9 items-center justify-center rounded text-error transition-colors hover:bg-surface-container-high"
                        >
                          <Icon name="close" className="text-[20px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-outline-variant bg-surface-container-lowest p-5 text-center">
            <button type="button" className="text-base font-bold text-label-bold text-secondary transition-all hover:underline">
              View All {filteredApplicants.length} Applicant{filteredApplicants.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
