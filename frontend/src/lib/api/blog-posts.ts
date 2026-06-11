import { apiFetch } from "./client";
import { getAccessToken } from "./auth";
import type { BlogPost, BlogPostStats } from "./types";

export async function getBlogPosts(search?: string, category?: string) {
  const query = new URLSearchParams();
  if (search?.trim()) query.set("search", search.trim());
  if (category && category !== "All Insights") query.set("category", category);
  const qs = query.toString();
  return apiFetch<BlogPost[]>(`/blog-posts${qs ? `?${qs}` : ""}`);
}

export async function getFeaturedBlogPost() {
  return apiFetch<BlogPost | null>("/blog-posts/featured");
}

export async function getBlogPostBySlug(slug: string) {
  return apiFetch<BlogPost>(`/blog-posts/${slug}`);
}

export async function getAdminBlogPosts(filters?: {
  search?: string;
  category?: string;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (filters?.search?.trim()) query.set("search", filters.search.trim());
  if (filters?.category && filters.category !== "All Categories") {
    query.set("category", filters.category);
  }
  if (filters?.status) query.set("status", filters.status);
  const qs = query.toString();
  return apiFetch<BlogPost[]>(`/admin/blog-posts${qs ? `?${qs}` : ""}`, {
    token: getAccessToken(),
  });
}

export async function getAdminBlogPostStats() {
  return apiFetch<BlogPostStats>("/admin/blog-posts/stats", {
    token: getAccessToken(),
  });
}

export async function getAdminBlogCategories() {
  return apiFetch<string[]>("/admin/blog-posts/categories", {
    token: getAccessToken(),
  });
}

export async function getAdminBlogPost(id: string) {
  return apiFetch<BlogPost>(`/admin/blog-posts/${id}`, {
    token: getAccessToken(),
  });
}

export async function createBlogPost(body: Record<string, unknown>) {
  return apiFetch<BlogPost>("/admin/blog-posts", {
    method: "POST",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function updateBlogPost(id: string, body: Record<string, unknown>) {
  return apiFetch<BlogPost>(`/admin/blog-posts/${id}`, {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify(body),
  });
}

export async function deleteBlogPost(id: string) {
  return apiFetch<{ success: boolean }>(`/admin/blog-posts/${id}`, {
    method: "DELETE",
    token: getAccessToken(),
  });
}
