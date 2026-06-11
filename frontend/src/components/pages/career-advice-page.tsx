"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { Icon } from "@/components/ui/icon";
import { CAREER_AUTHOR_IMG } from "@/lib/assets";
import { BLOG_FILTER_CATEGORIES } from "@/lib/blog/categories";
import type { BlogPost } from "@/lib/api/types";

type CareerAdvicePageProps = {
  initialPosts: BlogPost[];
  initialFeatured: BlogPost | null;
};

function formatReadTime(minutes: number) {
  return `${minutes} min read`;
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/career-advice/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all hover:border-secondary"
    >
      <div className="relative h-48 overflow-hidden">
        {post.coverImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            alt=""
            src={post.coverImageUrl}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary via-primary/90 to-secondary/80" />
        )}
        <span className="absolute left-4 top-4 rounded-lg bg-secondary-container px-3 py-1 font-label-sm text-label-sm text-on-secondary-container">
          {post.category}
        </span>
      </div>
      <div className="flex grow flex-col p-6">
        <h3 className="mb-2 text-[20px] font-headline-md text-on-surface transition-colors group-hover:text-secondary">
          {post.title}
        </h3>
        <p className="mb-4 line-clamp-2 font-body-md text-body-md text-on-surface-variant">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-4">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            By {post.authorName} • {formatReadTime(post.readMinutes)}
          </span>
          <Icon
            name="arrow_right_alt"
            className="text-secondary opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      </div>
    </Link>
  );
}

export function CareerAdvicePage({ initialPosts, initialFeatured }: CareerAdvicePageProps) {
  const [activeCategory, setActiveCategory] = useState("All Insights");
  const [searchInput, setSearchInput] = useState("");

  const featured = initialFeatured;
  const gridPosts = useMemo(() => {
    const withoutFeatured = featured
      ? initialPosts.filter((post) => post.id !== featured.id)
      : initialPosts;

    return withoutFeatured.filter((post) => {
      const matchesCategory =
        activeCategory === "All Insights" || post.category === activeCategory;
      const query = searchInput.trim().toLowerCase();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.authorName.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, featured, initialPosts, searchInput]);

  const trending = useMemo(
    () => gridPosts.slice(0, 4),
    [gridPosts],
  );

  return (
    <PublicPageLayout>
      <main>
        <section className="border-b border-outline-variant bg-surface py-stack-lg">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            {featured ? (
              <>
                <div className="mb-stack-md flex items-center gap-2">
                  <Icon name="stars" className="text-secondary" filled />
                  <span className="font-label-bold text-label-bold uppercase tracking-wider text-secondary">
                    Editor&apos;s Choice
                  </span>
                </div>
                <div className="grid grid-cols-1 items-center gap-stack-lg lg:grid-cols-2">
                  <div className="space-y-stack-md">
                    <h1 className="font-headline-xl text-headline-xl leading-tight text-on-surface">
                      {featured.title}
                    </h1>
                    <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-4 py-4">
                      <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-surface-container-high">
                        {featured.authorImageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            alt=""
                            className="h-full w-full object-cover"
                            src={featured.authorImageUrl}
                          />
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            alt=""
                            className="h-full w-full object-cover"
                            src={CAREER_AUTHOR_IMG}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-label-bold text-label-bold text-on-surface">
                          {featured.authorName}
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          {featured.authorTitle ?? "Career Advisor"} •{" "}
                          {formatReadTime(featured.readMinutes)}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/career-advice/${featured.slug}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-label-bold text-label-bold text-on-primary transition-all hover:shadow-lg"
                    >
                      Read Full Article <Icon name="arrow_forward" className="text-sm" />
                    </Link>
                  </div>
                  <Link
                    href={`/career-advice/${featured.slug}`}
                    className="group relative cursor-pointer overflow-hidden rounded-xl shadow-[0_24px_48px_-12px_rgba(13,28,46,0.08)]"
                  >
                    {featured.coverImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        alt=""
                        className="h-[480px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={featured.coverImageUrl}
                      />
                    ) : (
                      <div className="h-[480px] w-full bg-gradient-to-br from-primary via-primary/90 to-secondary/80" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center">
                <h1 className="font-headline-xl text-headline-xl text-on-surface">
                  Career Insights
                </h1>
                <p className="mt-4 font-body-lg text-on-surface-variant">
                  Executive guidance and industry intelligence will appear here soon.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="sticky top-20 z-40 border-b border-outline-variant bg-surface-container-low">
          <div className="mx-auto flex max-w-container-max flex-col justify-between gap-gutter px-margin-mobile py-stack-md md:flex-row md:items-center md:px-margin-desktop">
            <div className="no-scrollbar flex items-center gap-4 overflow-x-auto pb-2 md:pb-0">
              <span className="whitespace-nowrap font-label-bold text-label-bold text-on-surface">
                Filter by:
              </span>
              {BLOG_FILTER_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={
                    activeCategory === category
                      ? "whitespace-nowrap rounded-full bg-secondary px-4 py-2 font-label-sm text-label-sm text-on-secondary"
                      : "whitespace-nowrap rounded-full border border-outline-variant bg-surface px-4 py-2 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
                  }
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant"
              />
              <input
                className="w-full rounded-lg border border-outline-variant bg-surface py-2 pl-10 pr-4 font-body-md text-body-md outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary"
                placeholder="Search insights..."
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
          <div className="flex flex-col gap-gutter lg:flex-row">
            <div className="lg:w-3/4">
              <h2 className="mb-stack-lg font-headline-md text-headline-md text-on-surface">
                Latest Industry Intelligence
              </h2>
              {gridPosts.length === 0 ? (
                <p className="rounded-xl border border-outline-variant bg-surface-container-low p-8 text-on-surface-variant">
                  No articles match your filters.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
                  {gridPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-stack-lg lg:w-1/4">
              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
                <h3 className="mb-stack-md flex items-center gap-2 text-[20px] font-headline-md text-on-surface">
                  <Icon name="trending_up" className="text-secondary" />
                  Trending Topics
                </h3>
                <ul className="space-y-4">
                  {trending.map((post, index) => (
                    <li key={post.id}>
                      <Link href={`/career-advice/${post.slug}`} className="group block">
                        <span className="font-label-bold text-label-sm uppercase text-secondary">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="font-label-bold text-label-bold text-on-surface transition-colors group-hover:text-secondary">
                          {post.title}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-primary-container p-6">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-secondary opacity-10 blur-2xl" />
                <h3 className="relative z-10 mb-stack-sm text-[20px] font-headline-md text-on-primary-container">
                  Executive Digest
                </h3>
                <p className="relative z-10 mb-stack-md font-body-md text-label-sm text-on-primary-container/80">
                  Weekly high-level insights and exclusive recruitment data, delivered to your inbox.
                </p>
                <form className="relative z-10 space-y-stack-sm">
                  <input
                    className="w-full rounded-lg border border-primary-fixed-dim/20 bg-primary-fixed-dim/10 px-4 py-2 text-label-sm text-on-primary-container placeholder:text-on-primary-container/40 outline-none focus:ring-1 focus:ring-secondary"
                    placeholder="Professional Email"
                    type="email"
                  />
                  <button
                    type="button"
                    className="w-full rounded-lg bg-secondary py-2 font-label-bold text-label-bold text-on-secondary transition-all hover:brightness-110 active:scale-[0.98]"
                  >
                    Subscribe Now
                  </button>
                </form>
                <p className="relative z-10 mt-4 text-[10px] font-label-sm text-on-primary-container/50">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="overflow-hidden border-y border-outline-variant bg-surface py-stack-lg">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-wrap items-center justify-between gap-stack-lg">
              <div className="text-center md:text-left">
                <p className="font-headline-xl text-headline-xl text-secondary">15k+</p>
                <p className="font-label-bold text-label-bold uppercase text-on-surface-variant">
                  Subscribers
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="font-headline-xl text-headline-xl text-secondary">250+</p>
                <p className="font-label-bold text-label-bold uppercase text-on-surface-variant">
                  Expert Authors
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="font-headline-xl text-headline-xl text-secondary">
                  {initialPosts.length || 42}
                </p>
                <p className="font-label-bold text-label-bold uppercase text-on-surface-variant">
                  Published Insights
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="font-headline-xl text-headline-xl text-secondary">98%</p>
                <p className="font-label-bold text-label-bold uppercase text-on-surface-variant">
                  Trust Rating
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPageLayout>
  );
}
