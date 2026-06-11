"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import {
  createBlogPost,
  getAdminBlogCategories,
  getAdminBlogPost,
  updateBlogPost,
} from "@/lib/api/blog-posts";
import { signInPath } from "@/lib/auth/portal";
import { BLOG_CATEGORIES } from "@/lib/blog/categories";
import type { BlogPost, BlogPostStatus } from "@/lib/api/types";

type AdminBlogFormPageProps = {
  postId?: string;
};

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: BLOG_CATEGORIES[0],
  tags: [] as string[],
  authorName: "",
  authorTitle: "",
  authorBio: "",
  authorImageUrl: "",
  coverImageUrl: "",
  coverImageAlt: "",
  readMinutes: 5,
  featured: false,
  status: "DRAFT" as BlogPostStatus,
  publishedAt: "",
  scheduledAt: "",
};

export function AdminBlogFormPage({ postId }: AdminBlogFormPageProps) {
  const router = useRouter();
  const isEdit = Boolean(postId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<string[]>([...BLOG_CATEGORIES]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      const categories = await getAdminBlogCategories();
      setCategoryOptions(categories);
    } catch {
      setCategoryOptions([...BLOG_CATEGORIES]);
    }
  }, []);

  const load = useCallback(async () => {
    if (!postId) return;
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const post = await getAdminBlogPost(postId);
      setCategoryOptions((current) =>
        [...new Set([...current, post.category])].sort((a, b) => a.localeCompare(b)),
      );
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags,
        authorName: post.authorName,
        authorTitle: post.authorTitle ?? "",
        authorBio: post.authorBio ?? "",
        authorImageUrl: post.authorImageUrl ?? "",
        coverImageUrl: post.coverImageUrl ?? "",
        coverImageAlt: post.coverImageAlt ?? "",
        readMinutes: post.readMinutes,
        featured: post.featured,
        status: post.status,
        publishedAt: toDateTimeLocal(post.publishedAt),
        scheduledAt: toDateTimeLocal(post.scheduledAt),
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
        return;
      }
      setError(err instanceof ApiError ? err.message : "Failed to load blog post.");
    } finally {
      setLoading(false);
    }
  }, [postId, router]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleTitleChange = (value: string) => {
    setForm((current) => ({
      ...current,
      title: value,
      slug: current.slug || slugifyTitle(value),
    }));
  };

  const handleImageUpload =
    (field: "coverImageUrl" | "authorImageUrl") => async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await readFileAsDataUrl(file);
        updateField(field, dataUrl);
      } catch {
        setError("Failed to upload image.");
      }
    };

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || form.tags.includes(tag)) return;
    updateField("tags", [...form.tags, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    updateField(
      "tags",
      form.tags.filter((item) => item !== tag),
    );
  };

  const addCategory = () => {
    const name = newCategory.trim().replace(/\s+/g, " ");
    if (name.length < 2) {
      setError("Category must be at least 2 characters.");
      return;
    }
    setCategoryOptions((current) =>
      [...new Set([...current, name])].sort((a, b) => a.localeCompare(b)),
    );
    updateField("category", name);
    setNewCategory("");
    setError(null);
  };

  const submit = async (statusOverride?: BlogPostStatus) => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }

    setSaving(true);
    setError(null);

    const status = statusOverride ?? form.status;
    const payload = {
      ...form,
      status,
      readMinutes: Number(form.readMinutes) || 5,
      publishedAt: status === "PUBLISHED" && form.publishedAt ? form.publishedAt : undefined,
      scheduledAt: status === "SCHEDULED" && form.scheduledAt ? form.scheduledAt : undefined,
    };

    try {
      if (isEdit && postId) {
        await updateBlogPost(postId, payload);
      } else {
        await createBlogPost(payload);
      }
      router.push("/admin/blogs");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RecruiterAdminShell activeNav="blogs">
        <AdminPageCanvas>
          <p className="text-on-surface-variant">Loading post…</p>
        </AdminPageCanvas>
      </RecruiterAdminShell>
    );
  }

  return (
    <RecruiterAdminShell activeNav="blogs">
      <AdminPageCanvas className="md:px-margin-desktop">
        <div className="mb-stack-lg flex flex-col items-end justify-between gap-4 lg:flex-row">
          <div>
            <nav className="mb-2 flex gap-2 font-label-sm text-on-surface-variant">
              <Link href="/admin/blogs" className="hover:text-secondary">
                Content Management
              </Link>
              <span>/</span>
              <span className="font-label-bold text-primary">
                {isEdit ? "Edit Post" : "New Post"}
              </span>
            </nav>
            <h1 className="font-headline-xl text-headline-xl text-primary">
              {isEdit ? "Edit Blog Post" : "Create New Blog Post"}
            </h1>
          </div>
          <div className="flex gap-stack-sm">
            {form.slug ? (
              <Link
                href={`/career-advice/${form.slug}`}
                target="_blank"
                className="border border-primary px-6 py-2.5 font-label-bold text-primary transition-all hover:bg-primary/5"
              >
                Preview Post
              </Link>
            ) : null}
            <button
              type="button"
              disabled={saving}
              onClick={() => void submit("PUBLISHED")}
              className="bg-primary px-8 py-2.5 font-label-bold text-on-primary transition-all hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Publish Now"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="mb-stack-md rounded-lg border border-error/30 bg-error-container px-4 py-3 text-error">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 space-y-gutter lg:col-span-8">
            <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-[0_4px_24px_-2px_rgba(18,25,59,0.05)]">
              <header className="mb-stack-md flex items-center border-b border-outline-variant pb-stack-sm">
                <Icon name="edit_note" className="mr-2 text-secondary" />
                <h2 className="font-headline-md text-headline-md text-primary">Core Content</h2>
              </header>
              <div className="space-y-stack-md">
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-primary" htmlFor="post-title">
                    Post Title
                  </label>
                  <input
                    id="post-title"
                    value={form.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    className="rounded border border-outline-variant bg-background/30 p-3 font-headline-md text-body-lg focus:border-primary focus:ring-0"
                    placeholder="Navigating the C-Suite: Executive Recruitment in 2024"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-primary" htmlFor="url-slug">
                    URL Slug
                  </label>
                  <div className="flex items-center overflow-hidden rounded border border-outline-variant bg-surface-container">
                    <span className="px-3 font-label-sm text-on-surface-variant">
                      jobsfinder.lk/career-advice/
                    </span>
                    <input
                      id="url-slug"
                      value={form.slug}
                      onChange={(event) => updateField("slug", event.target.value)}
                      className="grow border-none bg-transparent py-2.5 font-body-md focus:ring-0"
                      placeholder="navigating-the-c-suite-2024"
                    />
                    <button
                      type="button"
                      onClick={() => updateField("slug", slugifyTitle(form.title))}
                      className="px-4 font-label-sm text-secondary hover:underline"
                    >
                      Auto-gen
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-primary" htmlFor="excerpt">
                    Excerpt
                  </label>
                  <textarea
                    id="excerpt"
                    value={form.excerpt}
                    onChange={(event) => updateField("excerpt", event.target.value)}
                    rows={3}
                    className="rounded border border-outline-variant bg-background/30 p-3 font-body-md focus:border-primary focus:ring-0"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-primary">Body Content</label>
                  <textarea
                    value={form.content}
                    onChange={(event) => updateField("content", event.target.value)}
                    rows={15}
                    className="w-full rounded border border-outline-variant bg-surface-container-lowest p-stack-md font-body-md focus:border-primary focus:ring-0"
                    placeholder="Begin drafting your executive insights here..."
                  />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-[0_4px_24px_-2px_rgba(18,25,59,0.05)]">
              <header className="mb-stack-md flex items-center border-b border-outline-variant pb-stack-sm">
                <Icon name="image" className="mr-2 text-secondary" />
                <h2 className="font-headline-md text-headline-md text-primary">Media &amp; Visuals</h2>
              </header>
              <div className="grid grid-cols-1 gap-stack-lg md:grid-cols-2">
                <div className="space-y-stack-md">
                  <label className="font-label-bold text-primary">Featured Image</label>
                  <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-background/50 transition-colors hover:bg-surface-container">
                    <Icon name="cloud_upload" className="mb-2 text-on-surface-variant" />
                    <span className="font-label-bold text-primary">Click to upload image</span>
                    <span className="font-label-sm text-on-surface-variant">PNG, JPG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => void handleImageUpload("coverImageUrl")(event)}
                    />
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-primary" htmlFor="alt-text">
                      Image Alt Text
                    </label>
                    <textarea
                      id="alt-text"
                      value={form.coverImageAlt}
                      onChange={(event) => updateField("coverImageAlt", event.target.value)}
                      rows={2}
                      className="rounded border border-outline-variant bg-background/30 p-3 font-body-md focus:border-primary focus:ring-0"
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-stack-md">
                  <span className="mb-4 block font-label-bold uppercase tracking-tighter text-on-surface-variant">
                    Preview
                  </span>
                  <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded bg-outline-variant/10">
                    {form.coverImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        alt={form.coverImageAlt || "Featured preview"}
                        className="h-full w-full object-cover"
                        src={form.coverImageUrl}
                      />
                    ) : (
                      <Icon name="image" className="text-4xl text-outline" />
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="col-span-12 space-y-gutter lg:col-span-4">
            <section className="rounded-lg bg-primary-container p-stack-lg text-on-secondary shadow-[0_4px_24px_-2px_rgba(18,25,59,0.05)]">
              <header className="mb-stack-md flex items-center border-b border-on-primary-container/20 pb-stack-sm">
                <Icon name="schedule" className="mr-2 text-on-secondary-container" />
                <h2 className="font-label-bold uppercase tracking-widest text-on-secondary">
                  Publishing Controls
                </h2>
              </header>
              <div className="space-y-stack-md">
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-on-primary-container">Post Status</label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField("status", event.target.value as BlogPostStatus)
                    }
                    className="rounded border border-on-primary-container/20 bg-background/10 p-2.5 font-label-bold text-on-secondary focus:border-on-secondary focus:ring-0"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="SCHEDULED">Scheduled</option>
                  </select>
                </div>
                {form.status === "SCHEDULED" ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-label-bold text-on-primary-container">
                      Publication Date
                    </label>
                    <input
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={(event) => updateField("scheduledAt", event.target.value)}
                      className="rounded border border-on-primary-container/20 bg-background/10 p-2.5 font-label-bold text-on-secondary focus:border-on-secondary focus:ring-0"
                    />
                  </div>
                ) : null}
                <div className="flex flex-col gap-3 pt-stack-sm">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void submit("DRAFT")}
                    className="w-full bg-on-secondary py-3 font-label-bold text-primary transition-all hover:bg-surface-variant disabled:opacity-60"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void submit("PUBLISHED")}
                    className="w-full bg-secondary py-3 font-label-bold text-on-secondary transition-all hover:bg-secondary/90 disabled:opacity-60"
                  >
                    Publish Immediately
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-[0_4px_24px_-2px_rgba(18,25,59,0.05)]">
              <header className="mb-stack-md flex items-center border-b border-outline-variant pb-stack-sm">
                <Icon name="label" className="mr-2 text-secondary" />
                <h2 className="font-headline-md text-headline-md text-primary">Metadata</h2>
              </header>
              <div className="space-y-stack-md">
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-primary" htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    className="rounded border border-outline-variant bg-background/30 p-2.5 font-body-md focus:border-primary focus:ring-0"
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      value={newCategory}
                      onChange={(event) => setNewCategory(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addCategory();
                        }
                      }}
                      placeholder="New category name"
                      className="grow rounded border border-outline-variant bg-background/30 p-2.5 font-body-md focus:border-primary focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={addCategory}
                      className="shrink-0 rounded border border-secondary px-3 py-2 font-label-bold text-label-bold text-secondary transition-colors hover:bg-secondary/5"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-primary" htmlFor="tags">
                    Tags
                  </label>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center border border-outline-variant/30 bg-surface-container px-3 py-1 font-label-sm text-label-bold text-primary"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-error"
                        >
                          <Icon name="close" className="text-sm" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    id="tags"
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTag();
                      }
                    }}
                    className="rounded border border-outline-variant bg-background/30 p-2.5 font-body-md focus:border-primary focus:ring-0"
                    placeholder="Add tag + press Enter"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-primary" htmlFor="author">
                    Author Attribution
                  </label>
                  <input
                    id="author"
                    value={form.authorName}
                    onChange={(event) => updateField("authorName", event.target.value)}
                    className="rounded border border-outline-variant bg-background/30 p-2.5 font-body-md focus:border-primary focus:ring-0"
                    placeholder="Sarah Jenkins"
                  />
                  <input
                    value={form.authorTitle}
                    onChange={(event) => updateField("authorTitle", event.target.value)}
                    className="rounded border border-outline-variant bg-background/30 p-2.5 font-body-md focus:border-primary focus:ring-0"
                    placeholder="Managing Partner"
                  />
                  <textarea
                    value={form.authorBio}
                    onChange={(event) => updateField("authorBio", event.target.value)}
                    rows={3}
                    className="rounded border border-outline-variant bg-background/30 p-2.5 font-body-md focus:border-primary focus:ring-0"
                    placeholder="Short author bio"
                  />
                  <label className="font-label-bold text-primary">Author Photo</label>
                  <input type="file" accept="image/*" onChange={(event) => void handleImageUpload("authorImageUrl")(event)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-bold text-primary" htmlFor="read-minutes">
                    Read Time (minutes)
                  </label>
                  <input
                    id="read-minutes"
                    type="number"
                    min={1}
                    value={form.readMinutes}
                    onChange={(event) => updateField("readMinutes", Number(event.target.value))}
                    className="rounded border border-outline-variant bg-background/30 p-2.5 font-body-md focus:border-primary focus:ring-0"
                  />
                </div>
                <label className="flex items-center gap-2 font-label-bold text-primary">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) => updateField("featured", event.target.checked)}
                  />
                  Feature as Editor&apos;s Choice
                </label>
              </div>
            </section>
          </div>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
