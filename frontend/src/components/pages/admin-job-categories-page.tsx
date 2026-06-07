"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { JobCategoryFormModal } from "@/components/admin/job-category-form-modal";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import {
  deleteAdminJobCategory,
  getAdminJobCategories,
  updateAdminJobCategory,
} from "@/lib/api/admin";
import { signInPath } from "@/lib/auth/portal";
import type { AdminJobCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminJobCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<AdminJobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminJobCategory | null>(null);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setCategories(await getAdminJobCategories());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
        return;
      }
      setCategories([]);
      setError(err instanceof ApiError ? err.message : "Failed to load job categories.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(q) ||
        (category.description ?? "").toLowerCase().includes(q),
    );
  }, [categories, searchQuery]);

  const totalCategories = categories.length;

  const openCreateModal = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEditModal = (category: AdminJobCategory) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleToggleActive = async (category: AdminJobCategory) => {
    setActionId(category.id);
    try {
      await updateAdminJobCategory(category.id, { active: !category.active });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update category status.");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (category: AdminJobCategory) => {
    const confirmed = window.confirm(
      `Delete "${category.name}"? This cannot be undone if the category has no linked jobs.`,
    );
    if (!confirmed) return;

    setActionId(category.id);
    try {
      await deleteAdminJobCategory(category.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete category.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <RecruiterAdminShell activeNav="job-categories">
      <AdminPageCanvas>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
              Settings / Job Categories
            </p>
            <h1 className="mt-2 text-display-sm text-on-surface">Job Categories</h1>
            <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
              Manage platform taxonomies and career paths used in job listings and candidate search.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Total categories
              </p>
              <p className="text-headline-md text-primary">{totalCategories}</p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-label-sm font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              <Icon name="add" className="text-lg" />
              Create New Category
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-6 rounded-lg border border-error/30 bg-error-container px-4 py-3 text-label-sm text-on-error-container">
            {error}
          </p>
        )}

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="flex flex-col gap-4 border-b border-outline-variant/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-title-md font-bold text-on-surface">Category directory</h2>
            <div className="relative w-full max-w-sm">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories…"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-4 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/50 bg-surface-container-low text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="px-6 py-4">Category name</th>
                  <th className="px-6 py-4">Total jobs</th>
                  <th className="px-6 py-4">Active jobs</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                      Loading categories…
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-outline-variant/30 last:border-b-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <Icon
                            name={category.icon ?? "work"}
                            className="mt-0.5 shrink-0 text-2xl text-primary"
                          />
                          <div>
                            <p className="font-label-bold text-on-surface">{category.name}</p>
                            {category.description ? (
                              <p className="mt-0.5 max-w-md text-label-sm text-on-surface-variant">
                                {category.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-label-bold text-on-surface">
                        {category.totalJobs.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-label-bold text-on-surface">
                        {category.activeJobs.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={actionId === category.id}
                          onClick={() => void handleToggleActive(category)}
                          className={cn(
                            "rounded-full px-3 py-1 text-[11px] font-bold uppercase transition-opacity disabled:opacity-50",
                            category.active
                              ? "bg-green-100 text-green-700"
                              : "bg-surface-container-high text-on-surface-variant",
                          )}
                        >
                          {category.active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-label-sm text-on-surface-variant">
                        {formatDate(category.updatedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            type="button"
                            disabled={actionId === category.id}
                            onClick={() => openEditModal(category)}
                            className="text-label-sm font-bold text-primary hover:underline disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={actionId === category.id}
                            onClick={() => void handleDelete(category)}
                            className="text-label-sm font-bold text-error hover:underline disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant/50 px-6 py-4 text-label-sm text-on-surface-variant">
            <span>
              Showing {filteredCategories.length} of {totalCategories} categories
            </span>
          </div>
        </div>

        <JobCategoryFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingCategory(null);
          }}
          onSaved={() => void load()}
          category={editingCategory}
        />
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
