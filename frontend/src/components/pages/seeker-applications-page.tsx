import Link from "next/link";
import { SeekerShell } from "@/components/layout/seeker-shell";
import { Icon } from "@/components/ui/icon";

const STATS = [
  { label: "Active", value: "12" },
  { label: "Interviews", value: "3", accent: true },
];

type ApplicationStatus = "interviewing" | "offer" | "applied";

const APPLICATIONS: {
  logo: string;
  title: string;
  company: string;
  location: string;
  status: ApplicationStatus;
  statusLabel: string;
  appliedOn: string;
  primaryAction: string;
  primaryFilled?: boolean;
}[] = [
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-l5fc3J-GH9VYOHLFh1Patr8J1LdkV7KbicjhqVTWjQ7JApDm9CINMblOGHaWejujf0qg9L55_JQqR8FdfhHUoFeHmaTwwsk4dismQrryOAb0s_yn88ncK7zoxQWSBRzEkS0iZtBqk4gnehYTQAmIaDFyLE9aYp59VFql8y_CBc2XizyYZH4Dy597dLrDwRh_U3EOCc5DbSSiKWSZjtGXuTqKuHo9J6_513A8rzEFjUqKCrQzZCTox9ATdq2nBW7ofCvJ5U1_z-1M",
    title: "Senior Product Designer",
    company: "Stripe",
    location: "Dublin, IE (Remote)",
    status: "interviewing",
    statusLabel: "Interviewing",
    appliedOn: "Oct 12, 2023",
    primaryAction: "View Details",
  },
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyX_UQq-JI_H4ZGH40hd_UqlBT2TNemGaJ-De8TkMkUBVUUIOFzC05uCwd7Af4UkcW6Tufh7FWjgsgvK58kSYacCEf4UpYMtj4Vgp_IagHbBNpMJ4cJRT8JhUjQ5E27QDZZKwyVMUuf9E7MeGMbJj7l6UWtMaYGVpZ2XUbWIVADTt1YWZALx9UgARCamAQ6UDrsp26k3n9K6gM7AW9rKtpx-NYBvsYPUi4Dw3NwSGuvjboNNcIzLa00ZgrdiF3guqnMWheH-FnWGes",
    title: "Design Lead, Experiences",
    company: "Airbnb",
    location: "San Francisco, CA",
    status: "offer",
    statusLabel: "Offer Received",
    appliedOn: "Sep 28, 2023",
    primaryAction: "Review Offer",
    primaryFilled: true,
  },
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRJyfUwjh6X6F_lXjoB2QKGwFbnXAqmlu1Dpu3EdQuOT3QkVhn3_w3rpwQzdmO6njz2h0qrzaRTrDrqyWDllegbyLcCdrQ1AdYdGV7beQ3i4XczN3KrBDKzmR85Y29MVzHDDLatNR_oOUPfsYM6H9ZRY1LaeRse7-opYWMqkEt6M7l3FQhvtecbzx5dvQ41oWZcZA1Q_8Gpb7JOERFzj9j9QC1vI8q4_JnD_LQYApOQzCvfRNvF7sTERxNxidpMdOQACN4jJbI6n6Q",
    title: "Staff Systems Engineer",
    company: "GitHub",
    location: "Worldwide (Remote)",
    status: "applied",
    statusLabel: "Applied",
    appliedOn: "Nov 04, 2023",
    primaryAction: "View Details",
  },
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1kv-ZlQko6E5GsMst89K7A43-4_WcOLf92ZObjj5dPX_SKTOe7sw3sUS441g4Ph37evOr-X3W2dlNjj2M5WhQuNUG_cbpdoP9EozHj2RFwYeZVEIaAlOmorHbhUEw_tmEZA0yVax3gs5YWxn0oBMV9yBbClrkgZ6kzUOfAhXaRNbZMSzGPCBB7DJCumd32cirQJm4ZQMKW5gktBDV8D1Ecp8Cd1d2-UIAQgVJRZYmXPI0q53TKwE9TFrvUjbLEKclIhaygQuXIoZ9",
    title: "Product Manager",
    company: "Notion",
    location: "New York, NY",
    status: "applied",
    statusLabel: "Applied",
    appliedOn: "Nov 02, 2023",
    primaryAction: "View Details",
  },
];

function statusBadgeClass(status: ApplicationStatus) {
  if (status === "interviewing") {
    return "border border-secondary/20 bg-secondary/10 text-secondary";
  }
  if (status === "offer") {
    return "border border-secondary/30 bg-secondary/15 text-secondary";
  }
  return "border border-outline-variant bg-surface-container-high text-on-surface-variant";
}

export function SeekerApplicationsPage() {
  return (
    <SeekerShell activeNav="applications" userName="Alex Silva">
      <div className="mx-auto max-w-container-max">
        <div className="mb-stack-lg flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary-container">My Applications</h1>
            <p className="mt-2 max-w-2xl font-body-md text-outline">
              Track and manage your professional journey. Review active conversations, upcoming
              interviews, and historical records of your job search progress.
            </p>
          </div>
          <div className="flex gap-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="min-w-[100px] rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-center"
              >
                <p className="text-[10px] font-bold uppercase text-outline">{stat.label}</p>
                <p
                  className={`text-headline-md font-bold ${stat.accent ? "text-secondary" : "text-primary-container"}`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="professional-card mb-stack-lg flex flex-col items-center gap-4 rounded-xl p-4 md:flex-row">
          <div className="relative w-full flex-grow">
            <Icon
              name="search"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              type="text"
              placeholder="Search by job title, company or keyword..."
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-3 pl-12 pr-4 font-body-md text-on-surface outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
            />
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <select className="min-w-[140px] cursor-pointer rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 font-label-bold text-on-surface outline-none focus:border-primary-container">
              <option>All Status</option>
              <option>Applied</option>
              <option>Interviewing</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
            <button
              type="button"
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-surface-container-high px-6 py-3 font-label-bold text-on-surface transition-all hover:bg-surface-container-highest"
            >
              <Icon name="tune" className="text-[20px]" />
              More Filters
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {APPLICATIONS.map((app) => (
            <div
              key={app.title}
              className="professional-card group flex flex-col items-center gap-6 rounded-xl p-6 transition-all duration-300 hover:border-secondary hover:shadow-lg md:flex-row"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="max-h-full max-w-full object-contain" src={app.logo} />
              </div>
              <div className="flex-grow text-center md:text-left">
                <div className="mb-1 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                  <h3 className="font-headline-md text-headline-md text-primary-container">{app.title}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass(app.status)}`}
                  >
                    {app.statusLabel}
                  </span>
                </div>
                <p className="flex items-center justify-center gap-2 font-label-bold text-outline md:justify-start">
                  {app.company}
                  <span className="h-1 w-1 rounded-full bg-outline-variant" />
                  {app.location}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1 border-outline-variant/30 px-6 md:border-x">
                <p className="text-label-sm font-bold uppercase text-outline">Applied On</p>
                <p className="font-body-md text-on-surface">{app.appliedOn}</p>
              </div>
              <div className="shrink-0">
                <button
                  type="button"
                  className={
                    app.primaryFilled
                      ? "rounded-lg bg-primary-container px-6 py-3 font-label-bold text-white transition-all hover:opacity-90"
                      : "rounded-lg border border-primary-container px-6 py-3 font-label-bold text-primary-container transition-all hover:bg-surface-container-low"
                  }
                >
                  {app.primaryAction}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-stack-lg rounded-2xl border-2 border-dashed border-outline-variant p-12 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-container">
            <Icon name="search_check" className="scale-125 text-secondary" />
          </div>
          <h4 className="mb-2 font-headline-md text-headline-md text-primary-container">Looking for more?</h4>
          <p className="mx-auto mb-6 max-w-sm font-body-md text-outline">
            Discover more opportunities tailored to your executive profile and skill set.
          </p>
          <Link
            href="/jobs"
            className="mx-auto flex items-center justify-center gap-2 font-label-bold text-secondary hover:underline"
          >
            Explore New Job Openings
            <Icon name="arrow_forward" />
          </Link>
        </div>
      </div>
    </SeekerShell>
  );
}
