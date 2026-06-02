import Link from "next/link";
import { SeekerShell } from "@/components/layout/seeker-shell";
import { Icon } from "@/components/ui/icon";

const QUICK_ACTIONS = [
  { icon: "history_edu", title: "AI Resume Builder", subtitle: "Update with latest skills" },
  { icon: "videocam", title: "Video Intro", subtitle: "Record 30s pitch" },
  { icon: "verified", title: "Skill Assessment", subtitle: "Get verified badge" },
];

const LEARN_NEXT = [
  { initials: "FM", title: "Framer Motion", progress: 30, active: true },
  { initials: "AI", title: "AI Tooling", progress: 0, active: false },
];

const JOURNEY_STATS = [
  { label: "Applied", value: "12", note: "+2 this week", border: "border-l-outline" },
  { label: "In Review", value: "04", border: "border-l-secondary" },
  { label: "Interviewing", value: "02", note: "Tomorrow, 10 AM", border: "border-l-primary-container", pulse: true },
  { label: "Offers", value: "01", badge: "Action Required", border: "border-l-secondary" },
];

const RECOMMENDED_JOBS = [
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiU4VGJeF7mAm9f6l-SaXswo8KTMoe0Uy6JzLA8h6KNI7fL0SeaH7QgN4ZkYy2EsnjkWNLAHaN8sNGDk9JvVh4dTfACxy5WhAkeHcjfq8tVzmqQElvjSFxNrwWIiq7qLBDT4JWu_czFVrth3B_AGQU4zPZigKhzodpAjdh1T-y1F62a8O6kIuPUD3Ke9P9-A_HPFf-GVfo4NIDwYuQa1HoMoFabmur5tkmyNsU8E9I5RpqHVla8Xy2HAijAEVcjg7fbYltNoZDjIQd",
    match: "98% Match",
    title: "Senior Product Designer",
    company: "TechFlow Global • Colombo (Remote)",
    tags: ["Full-time", "$120k - $160k"],
    posted: "Posted 2 days ago",
  },
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpvdk-fObuXVxD0D1I_0TW9q1b14MDjxcb4p5CQILW_BdSBo4sR5AdHd8gVb2Vvf_VFHkxUnPqizvguqXeQOT1apJLyh_FZl3ImGe10t6wxX2yQF-46L3y1EY6ZyVkTU58xXcejc3FivX1OEooiKexxNOPvtauMwr309fWThudyWbxtOdtjXPwwbraAOUcBXHj2ksWSCshZ7DUQym0XdMmaC5n46S03Yt4NgMcgXgWhwL3BXW1L_jQWAFUhcMK6lzAfpuzihlfzTjG",
    match: "92% Match",
    title: "Lead UI/UX Architect",
    company: "Nexus Studio • Nugegoda",
    tags: ["Contract", "$80/hr"],
    posted: "Posted 5 hours ago",
  },
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDG57fqtDuk9wOfagoMPq_bftpuPofBhecT-hTywjVyt99e-Hp-nLIMpteryVfhg3spfFi-Io83F9VpkmnSm4NHRcWX70BBJKBuEm6rsBpl8xV3hCdjzGT7g0cRfec3wPO3dU6O4ejlIlUeHnm464zFacEmZGnYS9NdBA8n3T2-WPMWHY3iiEOAG7Wi_H-Z7lpI6neu-3hXq1ibnKdwXlXubAcPawl3TiRG7GEiZL9f9nDsOWKbkBZLeb9cSeKMRFZ-Q9Zm1cjQGI5s",
    match: "89% Match",
    title: "Design Systems Lead",
    company: "Symmetry AI • Remote",
    tags: ["Full-time", "$140k+"],
    posted: "Posted 1 day ago",
  },
];

export function SeekerDashboardPage() {
  return (
    <SeekerShell activeNav="dashboard" userName="Alex Silva">
      <div className="mx-auto max-w-container-max">
        <section className="mb-10">
          <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-primary-container md:text-4xl lg:text-5xl">
            Good morning, Alex.
          </h1>
          <p className="mt-2 font-body-lg text-body-lg text-outline">
            You have <span className="font-bold text-secondary">3 new AI-matched roles</span> today.
          </p>
        </section>

        <section className="mb-12 grid grid-cols-1 gap-gutter md:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.title}
              type="button"
              className="professional-card group flex items-center gap-4 rounded p-6 text-left transition-all hover:border-primary-container"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded bg-secondary/5 text-secondary transition-all group-hover:bg-secondary group-hover:text-on-secondary">
                <Icon name={action.icon} />
              </div>
              <div>
                <h3 className="font-bold text-primary-container">{action.title}</h3>
                <p className="text-label-sm text-outline">{action.subtitle}</p>
              </div>
            </button>
          ))}
        </section>

        <section className="mb-12 grid grid-cols-1 gap-gutter lg:grid-cols-3">
          <div className="professional-card relative flex flex-col items-center gap-8 overflow-hidden rounded p-8 md:flex-row lg:col-span-2">
            <div className="relative">
              <svg className="h-32 w-32 -rotate-90 transform">
                <circle
                  className="text-surface-container-high"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="10"
                />
                <circle
                  className="text-primary-container transition-all duration-1000"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="58"
                  stroke="currentColor"
                  strokeDasharray="364.4"
                  strokeDashoffset="43.7"
                  strokeLinecap="round"
                  strokeWidth="10"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-primary-container">88</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  Score
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="mb-2 text-headline-md text-primary-container">Resume Strength</h2>
              <p className="mb-6 text-body-md text-outline">
                Your resume is highly optimized for Product Design roles. Adding &apos;Advanced
                Prototyping&apos; could boost matches by 15%.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 rounded bg-primary-container px-3 py-1 text-label-sm font-bold text-white">
                  <Icon name="check_circle" className="text-[14px]" filled />
                  Optimized
                </span>
                <span className="rounded border border-secondary/20 bg-secondary/5 px-3 py-1 text-label-sm font-bold text-secondary">
                  3 New Suggestions
                </span>
              </div>
            </div>
          </div>

          <div className="professional-card rounded p-8">
            <h2 className="mb-6 border-b border-outline-variant pb-2 text-headline-md text-primary-container">
              Learn Next
            </h2>
            <div className="space-y-5">
              {LEARN_NEXT.map((course) => (
                <div key={course.title} className="group flex cursor-pointer items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded text-sm font-bold ${
                      course.active
                        ? "bg-primary-container text-white"
                        : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    {course.initials}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-primary-container">{course.title}</h4>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low">
                      <div
                        className="h-full rounded-full bg-primary-container"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <Icon
                    name="play_circle"
                    className="text-outline transition-colors group-hover:text-secondary"
                  />
                </div>
              ))}
              <Link
                href="/career-advice"
                className="mt-6 block text-center font-bold text-label-bold text-secondary hover:underline"
              >
                Browse All Courses
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-headline-lg text-primary-container">Application Journey</h2>
            <button
              type="button"
              className="font-bold text-label-bold text-secondary transition-all hover:underline"
            >
              View Pipeline
            </button>
          </div>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-4">
            {JOURNEY_STATS.map((stat) => (
              <div
                key={stat.label}
                className={`professional-card rounded border-l-4 p-6 ${stat.border}`}
              >
                <p className="mb-1 text-[11px] font-label-bold uppercase tracking-widest text-outline">
                  {stat.label}
                </p>
                <h4 className="text-headline-lg font-bold text-primary-container">{stat.value}</h4>
                {stat.note && (
                  <p
                    className={`mt-2 text-label-sm font-medium ${
                      stat.pulse
                        ? "flex items-center gap-1 font-bold text-secondary"
                        : "text-outline"
                    }`}
                  >
                    {stat.pulse && (
                      <span className="h-1.5 w-1.5 animate-ping rounded-full bg-secondary" />
                    )}
                    {stat.note}
                  </p>
                )}
                {stat.badge && (
                  <span className="mt-2 inline-block rounded bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary">
                    {stat.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-headline-lg text-primary-container">Recommended for You</h2>
              <p className="font-label-sm text-outline">
                Based on your recent search for &apos;Product Designer&apos;
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded p-2 text-outline transition-colors hover:bg-surface-container-high hover:text-primary-container"
              >
                <Icon name="chevron_left" />
              </button>
              <button
                type="button"
                className="rounded p-2 text-outline transition-colors hover:bg-surface-container-high hover:text-primary-container"
              >
                <Icon name="chevron_right" />
              </button>
            </div>
          </div>
          <div className="no-scrollbar flex gap-gutter overflow-x-auto pb-6">
            {RECOMMENDED_JOBS.map((job) => (
              <div
                key={job.title}
                className="professional-card group min-w-[340px] cursor-pointer rounded p-6 transition-all hover:border-primary-container"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="Company logo" className="max-h-full max-w-full object-contain" src={job.logo} />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/5 px-3 py-1 text-[10px] font-bold text-secondary">
                    <Icon name="auto_awesome" className="text-[14px]" filled />
                    {job.match}
                  </span>
                </div>
                <h3 className="mb-1 text-body-lg font-bold text-primary-container transition-colors group-hover:text-secondary">
                  {job.title}
                </h3>
                <p className="mb-4 text-sm text-outline">{job.company}</p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-surface-container-low px-2 py-1 text-[11px] font-bold text-primary-container"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant pt-4">
                  <span className="text-label-sm font-medium text-outline">{job.posted}</span>
                  <span className="flex items-center gap-1 font-bold text-label-bold text-secondary transition-transform group-hover:translate-x-1">
                    Apply Now <Icon name="arrow_forward" className="text-sm" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SeekerShell>
  );
}
