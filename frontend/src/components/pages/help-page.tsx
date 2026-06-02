import Link from "next/link";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { Icon } from "@/components/ui/icon";
import { HELP_SUPPORT_AVATARS } from "@/lib/assets";

const CATEGORIES = [
  {
    icon: "person_search",
    title: "Job Seeking",
    description: "Learn how to create a profile, apply for jobs, and use AI features.",
    links: ["Creating your account", "Managing applications"],
  },
  {
    icon: "business_center",
    title: "Recruiting",
    description: "Post job listings, manage candidates, and team collaboration.",
    links: ["Optimizing job posts", "Company branding"],
  },
  {
    icon: "settings_suggest",
    title: "Technical Support",
    description: "Troubleshoot login issues, API integrations, and platform errors.",
    links: ["Two-factor auth", "System requirements"],
  },
  {
    icon: "payments",
    title: "Billing & Pricing",
    description: "Manage subscriptions, invoices, and payment methods.",
    links: ["Refund policies", "Upgrading plans"],
  },
];

const POPULAR_ARTICLES = [
  "How to improve your profile's AI Interview score?",
  "Troubleshooting payment verification delays",
  "Understanding the recruiter dashboard metrics",
];

const TICKETS = [
  {
    id: "#TK-89422",
    status: "In Review",
    active: true,
    title: "Account verification issues",
    activity: "Last activity: 20 mins ago",
  },
  {
    id: "#TK-89311",
    status: "Waiting",
    active: false,
    title: "Billing query regarding annual...",
    activity: "Last activity: 2 hours ago",
  },
];

export function HelpPage() {
  return (
    <PublicPageLayout>
      <main className="mx-auto min-h-screen w-full max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
        <section className="mb-16">
          <div className="mb-12 max-w-3xl">
            <h1 className="mb-4 font-headline-xl text-headline-xl text-on-surface">
              How can we help you?
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Search for articles, guides, and tutorials to get the most out of JobsFinder.lk
            </p>
          </div>
          <div className="group relative">
            <Icon
              name="search"
              className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-outline group-focus-within:text-secondary"
            />
            <input
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-6 pl-16 pr-6 font-body-md text-body-md shadow-sm transition-all focus:border-secondary focus:ring-2 focus:ring-secondary"
              placeholder="Search keywords like 'billing', 'profile settings', 'job posting'..."
              type="text"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="space-y-stack-lg lg:col-span-8">
            <h2 className="mb-6 font-headline-md text-headline-md">Browse by Topic</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.title}
                  className="group cursor-pointer border border-outline-variant bg-surface-container-lowest p-6 transition-all hover:border-secondary"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center bg-surface-container-low transition-colors group-hover:bg-secondary group-hover:text-on-secondary">
                    <Icon name={cat.icon} className="text-2xl" />
                  </div>
                  <h3 className="mb-2 font-label-bold text-label-bold">{cat.title}</h3>
                  <p className="mb-4 font-label-sm text-label-sm text-on-surface-variant">
                    {cat.description}
                  </p>
                  <ul className="space-y-2">
                    {cat.links.map((link) => (
                      <li
                        key={link}
                        className="flex cursor-pointer items-center font-label-sm text-label-sm text-secondary hover:underline"
                      >
                        {link}
                        <Icon name="chevron_right" className="ml-1 text-xs" />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <h2 className="mb-6 font-headline-md text-headline-md">Popular Articles</h2>
              <div className="space-y-4">
                {POPULAR_ARTICLES.map((title) => (
                  <a
                    key={title}
                    href="#"
                    className="group block border-b border-outline-variant p-4 transition-colors hover:bg-surface-container-low"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-body-md text-body-md font-semibold text-on-surface">
                        {title}
                      </span>
                      <Icon
                        name="arrow_forward"
                        className="text-outline transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-stack-lg lg:col-span-4">
            <div className="bg-primary p-8 text-on-primary shadow-xl">
              <h3 className="mb-4 font-headline-md text-headline-md text-on-primary">
                Need direct help?
              </h3>
              <p className="mb-6 font-label-sm text-label-sm text-on-primary-container">
                Our professional support team typically responds within 2-4 business hours.
              </p>
              <Link
                href="/contact"
                className="flex w-full items-center justify-center gap-2 bg-secondary py-4 font-label-bold text-label-bold text-on-secondary transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <Icon name="add_comment" />
                Submit a Ticket
              </Link>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-3 overflow-hidden">
                  {HELP_SUPPORT_AVATARS.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      alt={`Support specialist ${i + 1}`}
                      className="inline-block h-8 w-8 rounded-full border-2 border-primary"
                      src={src}
                    />
                  ))}
                </div>
                <span className="font-label-sm text-label-sm text-on-primary-container">
                  Support agents online
                </span>
              </div>
            </div>

            <div className="border border-outline-variant bg-surface-container-lowest p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-label-bold text-label-bold">Your Active Tickets</h3>
                <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm text-secondary">
                  2 Active
                </span>
              </div>
              <div className="space-y-4">
                {TICKETS.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={
                      ticket.active
                        ? "border border-outline-variant bg-surface-container-low p-4"
                        : "border border-outline-variant p-4"
                    }
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <span className="font-label-sm text-label-sm font-bold">{ticket.id}</span>
                      <span
                        className={
                          ticket.active
                            ? "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-secondary"
                            : "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-outline"
                        }
                      >
                        <span
                          className={
                            ticket.active
                              ? "h-2 w-2 animate-pulse rounded-full bg-secondary"
                              : "h-2 w-2 rounded-full bg-outline"
                          }
                        />
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="mb-1 line-clamp-1 font-label-sm text-label-sm">{ticket.title}</h4>
                    <p className="font-label-sm text-[11px] text-on-surface-variant">
                      {ticket.activity}
                    </p>
                  </div>
                ))}
                <button
                  type="button"
                  className="w-full py-2 text-center font-label-sm text-label-sm text-secondary transition-all hover:underline"
                >
                  View all tickets
                </button>
              </div>
            </div>

            <div className="border border-outline-variant bg-surface-container-lowest p-6">
              <h3 className="mb-4 font-label-bold text-label-bold">Quick Resources</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="menu_book" className="text-secondary" />
                  <div>
                    <p className="font-label-sm text-label-sm font-bold">User Guide PDF</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Complete platform documentation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="play_circle" className="text-secondary" />
                  <div>
                    <p className="font-label-sm text-label-sm font-bold">Video Tutorials</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Quick visual walkthroughs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-16 mt-24 border-t border-outline-variant pt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 font-headline-md text-headline-md">
              Still can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="mb-12 font-body-md text-body-md text-on-surface-variant">
              Connect with our specialized departments for executive concierge or enterprise billing
              assistance.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="border border-outline-variant bg-surface-container-lowest p-6 text-center transition-all hover:shadow-lg">
                <Icon name="mail" className="mb-4 text-3xl text-on-surface-variant" />
                <p className="mb-1 font-label-bold text-label-bold">Email Support</p>
                <p className="font-label-sm text-label-sm text-secondary">support@jobsfinder.lk</p>
              </div>
              <div className="border border-outline-variant bg-surface-container-lowest p-6 text-center transition-all hover:shadow-lg">
                <Icon name="call" className="mb-4 text-3xl text-on-surface-variant" />
                <p className="mb-1 font-label-bold text-label-bold">24/7 Hotline</p>
                <p className="font-label-sm text-label-sm text-secondary">+94 11 234 5678</p>
              </div>
              <div className="border border-outline-variant bg-surface-container-lowest p-6 text-center transition-all hover:shadow-lg">
                <Icon name="forum" className="mb-4 text-3xl text-on-surface-variant" />
                <p className="mb-1 font-label-bold text-label-bold">Live Chat</p>
                <p className="font-label-sm text-label-sm text-secondary">Start Conversation</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPageLayout>
  );
}
