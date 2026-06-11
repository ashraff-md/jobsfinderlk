"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { Icon } from "@/components/ui/icon";
import { BlogArticleContent } from "@/lib/blog/render-content";
import type { BlogPost } from "@/lib/api/types";

type CareerAdviceArticlePageProps = {
  post: BlogPost;
  relatedPosts: BlogPost[];
};

function formatReadTime(minutes: number) {
  return `${minutes} min read`;
}

function formatPublishedDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RelatedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/career-advice/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded border border-outline-variant bg-white transition-all duration-300 hover:shadow-xl"
    >
      <div className="h-48 overflow-hidden">
        {post.coverImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={post.coverImageUrl}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary to-secondary" />
        )}
      </div>
      <div className="flex grow flex-col p-6">
        <span className="mb-2 font-label-sm text-label-sm uppercase text-secondary">
          {post.category}
        </span>
        <h3 className="mb-4 text-[18px] font-label-bold leading-tight transition-colors group-hover:text-secondary">
          {post.title}
        </h3>
        <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-4">
          <span className="font-label-sm text-label-sm text-outline">
            {formatReadTime(post.readMinutes)}
          </span>
          <Icon
            name="arrow_forward"
            className="text-outline transition-colors group-hover:text-secondary"
          />
        </div>
      </div>
    </Link>
  );
}

export function CareerAdviceArticlePage({ post, relatedPosts }: CareerAdviceArticlePageProps) {
  const aiInsights = useMemo(
    () => [
      'Prioritize "Human-in-the-loop" AI integration policies.',
      "Audit board skill-sets for technical data literacy.",
      "Leverage predictive analytics for local supply chain resilience.",
    ],
    [],
  );

  return (
    <PublicPageLayout>
      <main>
        <section className="relative flex h-[600px] w-full items-end overflow-hidden">
          {post.coverImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              src={post.coverImageUrl}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(13,28,46,0.7)] to-[rgba(13,28,46,0.95)]" />
          <div className="relative z-10 mx-auto w-full max-w-container-max px-margin-mobile pb-16 md:px-margin-desktop">
            <div className="max-w-4xl">
              <nav className="mb-6 flex items-center gap-2 text-on-secondary-container opacity-80">
                <Link href="/career-advice" className="font-label-sm uppercase tracking-wider hover:text-white">
                  Career Insights
                </Link>
                <Icon name="chevron_right" className="text-[14px]" />
                <span className="font-label-sm uppercase tracking-wider">{post.category}</span>
              </nav>
              <h1 className="mb-8 font-headline-xl text-headline-xl text-white">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-8 border-t border-white/10 pt-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-secondary">
                    {post.authorImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img alt="" className="h-full w-full object-cover" src={post.authorImageUrl} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-surface-container-low text-lg font-bold text-primary">
                        {post.authorName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-label-bold text-label-bold">{post.authorName}</p>
                    <p className="font-label-sm text-secondary-fixed opacity-80">
                      {post.authorTitle ?? "Contributor"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8 border-l border-white/10 pl-8">
                  <div>
                    <p className="font-label-sm uppercase opacity-60">Duration</p>
                    <p className="font-label-bold text-label-bold">{formatReadTime(post.readMinutes)}</p>
                  </div>
                  <div>
                    <p className="font-label-sm uppercase opacity-60">Published</p>
                    <p className="font-label-bold text-label-bold">
                      {formatPublishedDate(post.publishedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-container-max flex-col gap-gutter px-margin-mobile py-stack-lg md:px-margin-desktop lg:flex-row">
          <article className="grow lg:max-w-[800px]">
            <BlogArticleContent content={post.content} />

            <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-outline-variant pt-8 md:flex-row">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-surface-container-high px-3 py-1 font-label-sm text-label-sm text-on-surface-variant"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <span className="font-label-sm uppercase tracking-wider text-outline">
                  Share this insight
                </span>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant transition-all hover:bg-secondary hover:text-white"
                  onClick={() => void navigator.share?.({ title: post.title, url: window.location.href })}
                >
                  <Icon name="share" className="text-lg" />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant transition-all hover:bg-secondary hover:text-white"
                  onClick={() => void navigator.clipboard.writeText(window.location.href)}
                >
                  <Icon name="link" className="text-lg" />
                </button>
              </div>
            </div>
          </article>

          <aside className="w-full shrink-0 lg:w-[360px]">
            <div className="sticky top-28 space-y-stack-lg">
              <div className="rounded-xl border border-primary bg-primary-container p-8 text-on-primary-fixed shadow-lg">
                <div className="mb-6 flex items-center gap-3">
                  <Icon name="auto_awesome" className="text-secondary-fixed" />
                  <h3 className="font-headline-md text-headline-md">AI Insights</h3>
                </div>
                <p className="mb-6 font-label-sm text-label-sm leading-relaxed text-on-primary-container">
                  Key takeaways for busy executives regarding the AI-governance nexus.
                </p>
                <ul className="space-y-4">
                  {aiInsights.map((item) => (
                    <li key={item} className="flex gap-3">
                      <Icon name="check_circle" className="text-sm text-secondary-fixed" />
                      <span className="font-label-bold text-label-bold text-white">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded border border-outline-variant bg-white p-6">
                <h4 className="mb-4 font-label-sm uppercase text-outline">About the Author</h4>
                <div className="mb-4 flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-surface-container-low">
                    {post.authorImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img alt="" className="h-full w-full object-cover" src={post.authorImageUrl} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-primary">
                        {post.authorName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-label-bold text-label-bold">{post.authorName}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {post.authorTitle ?? "Contributor"} at JobsFinder
                    </p>
                  </div>
                </div>
                {post.authorBio ? (
                  <p className="mb-4 font-label-sm text-label-sm text-on-surface-variant">
                    {post.authorBio}
                  </p>
                ) : null}
                <Link
                  href="/career-advice"
                  className="flex items-center gap-1 font-label-bold text-label-bold text-secondary transition-all hover:gap-2"
                >
                  View more insights <Icon name="arrow_forward" className="text-sm" />
                </Link>
              </div>
            </div>
          </aside>
        </section>

        <section className="bg-surface-container py-20">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col items-center justify-between gap-10 rounded-2xl border border-outline-variant bg-white p-12 lg:flex-row">
              <div className="max-w-lg text-center lg:text-left">
                <h2 className="mb-4 font-headline-lg text-headline-lg text-on-surface">
                  The Executive Brief
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Stay ahead with our monthly curated insights on Sri Lanka&apos;s C-suite movements,
                  talent trends, and strategic governance.
                </p>
              </div>
              <div className="flex w-full flex-col gap-4 md:flex-row lg:w-auto">
                <input
                  className="w-full rounded border border-outline px-6 py-4 font-body-md transition-all focus:border-secondary focus:ring-1 focus:ring-secondary md:w-80"
                  placeholder="professional@company.com"
                  type="email"
                />
                <button
                  type="button"
                  className="whitespace-nowrap rounded bg-primary px-10 py-4 font-label-bold text-label-bold text-white shadow-lg transition-all hover:opacity-90"
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {relatedPosts.length > 0 ? (
          <section className="bg-background py-20">
            <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
              <div className="mb-12 flex items-end justify-between">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Continue Reading
                  </h2>
                  <p className="font-body-md text-on-surface-variant">
                    Expand your strategic perspective.
                  </p>
                </div>
                <Link
                  href="/career-advice"
                  className="hidden items-center gap-2 border-b border-transparent font-label-bold text-label-bold text-secondary transition-all hover:border-secondary md:flex"
                >
                  Browse all insights <Icon name="chevron_right" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {relatedPosts.map((related) => (
                  <RelatedCard key={related.id} post={related} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </PublicPageLayout>
  );
}
