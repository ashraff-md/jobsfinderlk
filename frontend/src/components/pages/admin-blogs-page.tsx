"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import {
  deleteBlogPost,
  getAdminBlogPostStats,
  getAdminBlogPosts,
} from "@/lib/api/blog-posts";
import { signInPath } from "@/lib/auth/portal";
import { BLOG_CATEGORIES } from "@/lib/blog/categories";
import type { BlogPost, BlogPostStats } from "@/lib/api/types";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusBadge(status: BlogPost["status"]) {
  if (status === "PUBLISHED") {
    return (
      <span className="flex items-center gap-1.5 text-secondary">
        <span className="h-2 w-2 rounded-full bg-secondary" />
        <span className="font-label-bold text-label-bold">Published</span>
      </span>
    );
  }
  if (status === "SCHEDULED") {
    return (
      <span className="flex items-center gap-1.5 text-error">
        <span className="h-2 w-2 animate-pulse rounded-full bg-error" />
        <span className="font-label-bold text-label-bold">Scheduled</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-on-surface-variant">
      <span className="h-2 w-2 rounded-full bg-outline" />
      <span className="font-label-bold text-label-bold">Draft</span>
    </span>
  );
}

export function AdminBlogsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogPostStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [postList, postStats] = await Promise.all([
        getAdminBlogPosts({
          category: categoryFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: debouncedSearch.trim() || undefined,
        }),
        getAdminBlogPostStats(),
      ]);
      setPosts(postList);
      setStats(postStats);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
        return;
      }
      setPosts([]);
      setStats(null);
      setError(err instanceof ApiError ? err.message : "Failed to load blog posts.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, debouncedSearch, router, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasActiveFilters = useMemo(
    () =>
      statusFilter !== "all" ||
      categoryFilter !== "All Categories" ||
      debouncedSearch.trim().length > 0,
    [categoryFilter, debouncedSearch, statusFilter],
  );

  const categoryFilterOptions = useMemo(
    () => [
      { value: "All Categories", label: "All categories" },
      ...BLOG_CATEGORIES.map((category) => ({ value: category, label: category })),
    ],
    [],
  );

  const statusFilterOptions = useMemo(
    () => [
      { value: "all", label: "All statuses" },
      { value: "PUBLISHED", label: "Published" },
      { value: "DRAFT", label: "Draft" },
      { value: "SCHEDULED", label: "Scheduled" },
    ],
    [],
  );

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteBlogPost(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete post.");
    }
  };

  return (
    <RecruiterAdminShell activeNav="blogs">
      <AdminPageCanvas className="md:px-margin-desktop">
        <div className="mb-stack-lg flex flex-col items-end justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-headline-lg tracking-tight text-primary">
              Content Management &amp; Blogs
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Manage editorial content and executive insights across the platform.
            </p>
          </div>
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 rounded bg-primary px-6 py-3 font-label-bold text-on-primary shadow-sm transition-all hover:bg-secondary-container active:scale-95"
          >
            <Icon name="add_circle" className="text-[20px]" />
            Create New Post
          </Link>
        </div>

        {error ? (
          <p className="mb-stack-md rounded-lg border border-error/30 bg-error-container px-4 py-3 text-error">
            {error}
          </p>
        ) : null}

        <section className="mb-stack-lg grid grid-cols-1 gap-gutter md:grid-cols-4">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <span className="font-label-bold text-label-bold text-on-surface-variant">
              Total Posts
            </span>
            <p className="mt-2 font-headline-xl text-headline-xl text-primary">
              {stats?.total ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <span className="font-label-bold text-label-bold text-on-surface-variant">Drafts</span>
            <p className="mt-2 font-headline-xl text-headline-xl text-primary">
              {stats?.drafts ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <span className="font-label-bold text-label-bold text-on-surface-variant">
              Scheduled
            </span>
            <p className="mt-2 font-headline-xl text-headline-xl text-primary">
              {stats?.scheduled ?? "—"}
            </p>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-primary-container p-6">
            <span className="font-label-bold text-label-bold text-on-primary-container">
              Published
            </span>
            <p className="mt-2 font-headline-xl text-headline-xl text-on-secondary">
              {stats?.published ?? "—"}
            </p>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-secondary-container/20 blur-2xl" />
          </div>
        </section>

        <AdminFilterBar
          className="mb-stack-md"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search posts or authors…"
          filters={[
            {
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: categoryFilterOptions,
              ariaLabel: "Filter by category",
            },
            {
              value: statusFilter,
              onChange: setStatusFilter,
              options: statusFilterOptions,
              ariaLabel: "Filter by status",
            },
          ]}
          showClear={hasActiveFilters}
          onClear={() => {
            setSearchQuery("");
            setCategoryFilter("All Categories");
            setStatusFilter("all");
          }}
        />

        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="w-[220px] px-4 py-4 font-label-bold text-label-bold text-primary">
                  Post Title
                </th>
                <th className="w-[120px] px-4 py-4 font-label-bold text-label-bold text-primary">
                  Author
                </th>
                <th className="w-[130px] px-4 py-4 font-label-bold text-label-bold text-primary">
                  Category
                </th>
                <th className="w-[120px] px-4 py-4 font-label-bold text-label-bold text-primary">
                  Date Published
                </th>
                <th className="w-[110px] px-4 py-4 font-label-bold text-label-bold text-primary">
                  Status
                </th>
                <th className="w-[100px] px-2 py-4 text-right font-label-bold text-label-bold text-primary">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-on-surface-variant">
                    Loading blog posts…
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-on-surface-variant">
                    No blog posts yet. Create your first executive insight.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="transition-colors hover:bg-surface-container">
                    <td className="px-4 py-5">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-surface-variant">
                          {post.coverImageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              alt=""
                              className="h-full w-full object-cover"
                              src={post.coverImageUrl}
                            />
                          ) : null}
                        </div>
                        <span
                          className="truncate font-label-bold text-label-bold text-primary"
                          title={post.title}
                        >
                          {post.title}
                        </span>
                      </div>
                    </td>
                    <td className="truncate px-4 py-5 font-body-md text-body-md text-on-surface-variant">
                      {post.authorName}
                    </td>
                    <td className="px-4 py-5">
                      <span className="inline-block max-w-full truncate rounded-full bg-surface-container-high px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant">
                        {post.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 font-body-md text-body-md text-on-surface-variant">
                      {formatDate(post.publishedAt ?? post.scheduledAt)}
                    </td>
                    <td className="px-4 py-5">{statusBadge(post.status)}</td>
                    <td className="w-[100px] px-2 py-5 text-right">
                      <div className="inline-flex items-center justify-end gap-0.5">
                        {post.status === "PUBLISHED" ? (
                          <Link
                            href={`/career-advice/${post.slug}`}
                            target="_blank"
                            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary"
                            aria-label={`View ${post.title}`}
                          >
                            <Icon name="visibility" />
                          </Link>
                        ) : null}
                        <Link
                          href={`/admin/blogs/${post.id}/edit`}
                          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary"
                          aria-label={`Edit ${post.title}`}
                        >
                          <Icon name="edit" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleDelete(post.id, post.title)}
                          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-error"
                          aria-label={`Delete ${post.title}`}
                        >
                          <Icon name="delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
