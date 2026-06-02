import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { Icon } from "@/components/ui/icon";
import {
  CAREER_ARTICLE_IMGS,
  CAREER_AUTHOR_IMG,
  CAREER_EDITOR_IMG,
  CAREER_FEED_IMGS,
} from "@/lib/assets";

const TOPICS = [
  "All Resources",
  "CV Tips",
  "Interview Prep",
  "Salary Negotiation",
  "Leadership",
  "Work Culture",
];

const ARTICLES = [
  {
    tag: "CV Tips",
    read: "5 min read",
    title: "The 2024 Guide to AI-Optimized Resumes",
    excerpt:
      "Learn how to structure your professional experience so it clears both automated tracking systems and human recruiters.",
    author: "Alex Silva",
    img: CAREER_ARTICLE_IMGS[0],
  },
  {
    tag: "Interview Prep",
    read: "8 min read",
    title: "Body Language: Non-Verbal Cues for Video Interviews",
    excerpt:
      "Communication isn't just about what you say. Master your digital presence through eye contact, framing, and posture.",
    author: "Michael Chen",
    img: CAREER_ARTICLE_IMGS[1],
  },
  {
    tag: "Salary Negotiation",
    read: "6 min read",
    title: "When to Walk Away from a Job Offer",
    excerpt:
      "Recognizing red flags and understanding your market value during the final stages of the hiring process.",
    author: "Jordan Taylor",
    img: CAREER_ARTICLE_IMGS[2],
  },
];

const FEED = [
  {
    tag: "Work Culture",
    date: "3 days ago",
    title: "The Hybrid Paradox: Balancing Remote Flexibility with In-Person Mentorship",
    excerpt:
      "How top-tier firms are navigating the transition back to high-collaboration environments.",
    read: "4 min read",
    img: CAREER_FEED_IMGS[0],
  },
  {
    tag: "Leadership",
    date: "1 week ago",
    title: "Soft Skills for Hard Times: Why Empathy is the New KPI",
    excerpt:
      "Redefining leadership metrics for the era of talent retention and mental wellness.",
    read: "7 min read",
    img: CAREER_FEED_IMGS[1],
  },
];

export function CareerAdvicePage() {
  return (
    <PublicPageLayout>
      <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
        <section className="mb-16">
          <div className="mb-stack-md flex items-center gap-2">
            <Icon name="star" className="text-secondary" filled />
            <span className="font-label-bold text-label-bold uppercase tracking-wider text-secondary">
              Editor&apos;s Choice
            </span>
          </div>
          <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-all duration-500 hover:shadow-lg">
            <div className="flex flex-col lg:flex-row">
              <div className="h-96 overflow-hidden lg:h-auto lg:w-7/12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Executive strategy meeting"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={CAREER_EDITOR_IMG}
                />
              </div>
              <div className="flex flex-col justify-center bg-white p-10 lg:w-5/12">
                <div className="mb-4 flex items-center gap-stack-sm">
                  <span className="rounded-full bg-surface-container px-3 py-1 font-label-sm text-label-sm text-secondary">
                    Salary Negotiation
                  </span>
                  <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                    <Icon name="schedule" className="text-[14px]" /> 12 min read
                  </span>
                </div>
                <h1 className="mb-6 font-headline-xl text-headline-xl leading-tight">
                  Mastering the Executive Salary Package for 2024
                </h1>
                <p className="mb-8 font-body-lg text-body-lg text-on-surface-variant">
                  An in-depth guide on negotiating benefits, equity, and performance bonuses for
                  senior leadership roles in the changing economic landscape.
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-variant">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="Sarah Jenkins" className="h-full w-full object-cover" src={CAREER_AUTHOR_IMG} />
                    </div>
                    <div>
                      <p className="font-label-bold text-label-bold">Sarah Jenkins</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Lead Career Advisor
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 font-label-bold text-label-bold text-secondary transition-all hover:gap-4"
                  >
                    Read Article <Icon name="arrow_forward" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex flex-wrap items-center gap-3">
            {TOPICS.map((topic, i) => (
              <button
                key={topic}
                type="button"
                className={
                  i === 0
                    ? "rounded-full bg-primary px-6 py-2.5 font-label-bold text-label-bold text-on-primary"
                    : "rounded-full border border-outline-variant bg-surface-container-lowest px-6 py-2.5 font-label-bold text-label-bold text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary"
                }
              >
                {topic}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <article
              key={article.title}
              className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-shadow hover:shadow-md"
            >
              <div className="relative h-56 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={article.img}
                />
                <div className="absolute left-4 top-4">
                  <span className="rounded bg-white/90 px-3 py-1 font-label-sm text-label-sm text-primary shadow-sm backdrop-blur">
                    {article.tag}
                  </span>
                </div>
              </div>
              <div className="flex flex-grow flex-col p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Icon name="schedule" className="text-[16px] text-on-surface-variant" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{article.read}</span>
                </div>
                <h3 className="mb-3 font-headline-md text-headline-md transition-colors group-hover:text-secondary">
                  {article.title}
                </h3>
                <p className="mb-6 line-clamp-3 font-body-md text-body-md text-on-surface-variant">
                  {article.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-4">
                  <span className="font-label-bold text-label-bold">{article.author}</span>
                  <Icon
                    name="arrow_forward"
                    className="text-secondary opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
              </div>
            </article>
          ))}

          <div className="flex flex-col rounded-xl bg-primary-container p-10 text-on-primary md:flex-row md:items-center lg:col-span-2">
            <div className="md:w-1/2">
              <h2 className="mb-4 font-headline-lg text-headline-lg text-white">
                Stay ahead with the JobsFinder Newsletter
              </h2>
              <p className="font-body-md text-body-md text-on-primary-container">
                Weekly insights on executive hiring trends, industry salary benchmarks, and career
                strategies delivered to your inbox.
              </p>
            </div>
            <div className="mt-6 w-full md:mt-0 md:w-1/2">
              <form className="flex flex-col gap-3">
                <input
                  className="w-full rounded border border-white/20 bg-white/10 px-5 py-3 text-white placeholder-white/50 transition-colors focus:border-secondary focus:outline-none"
                  placeholder="Enter your email"
                  type="email"
                />
                <button
                  type="button"
                  className="w-full rounded bg-secondary py-3 font-label-bold text-label-bold text-white transition-colors hover:bg-secondary-container"
                >
                  Subscribe Now
                </button>
                <p className="text-center text-[11px] text-on-primary-container/70">
                  Join 12,000+ professionals. No spam, just value.
                </p>
              </form>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container p-8 text-center">
            <Icon name="psychology" className="mb-4 text-5xl text-secondary" filled />
            <h3 className="mb-2 font-headline-md text-headline-md">AI Interview Coach</h3>
            <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
              Practice your pitch with our industry-leading AI and get instant feedback on your
              performance.
            </p>
            <button
              type="button"
              className="rounded-full bg-secondary px-8 py-3 font-label-bold text-label-bold text-on-secondary transition-all hover:shadow-lg"
            >
              Try for Free
            </button>
          </div>
        </section>

        <section className="mt-16 border-t border-outline-variant pt-16">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="mb-2 font-headline-lg text-headline-lg">Latest Insights</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Fresh perspectives on the modern workplace.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 font-label-bold text-label-bold text-secondary"
            >
              View All <Icon name="chevron_right" />
            </button>
          </div>
          <div className="space-y-6">
            {FEED.map((item) => (
              <div
                key={item.title}
                className="group flex cursor-pointer gap-6 rounded-lg border-b border-outline-variant/30 p-4 pb-6 transition-colors hover:bg-surface-container-low"
              >
                <div className="hidden h-24 w-32 overflow-hidden rounded sm:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" className="h-full w-full object-cover" src={item.img} />
                </div>
                <div className="flex-grow">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                      {item.tag}
                    </span>
                    <span className="text-[12px] text-on-surface-variant">• {item.date}</span>
                  </div>
                  <h4 className="mb-2 font-headline-md text-headline-md transition-colors group-hover:text-secondary">
                    {item.title}
                  </h4>
                  <p className="line-clamp-1 font-body-md text-body-md text-on-surface-variant">
                    {item.excerpt}
                  </p>
                </div>
                <div className="hidden items-center md:flex">
                  <span className="font-label-sm text-label-sm italic text-on-surface-variant">
                    {item.read}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </PublicPageLayout>
  );
}
