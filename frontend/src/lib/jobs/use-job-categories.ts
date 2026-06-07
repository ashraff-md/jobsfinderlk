"use client";

import { useEffect, useState } from "react";
import { getJobCategories } from "@/lib/api/jobs";
import type { JobCategory } from "@/lib/api/types";

let cachedCategories: JobCategory[] | null = null;
let fetchPromise: Promise<JobCategory[]> | null = null;

function loadJobCategories() {
  if (cachedCategories) {
    return Promise.resolve(cachedCategories);
  }

  if (!fetchPromise) {
    fetchPromise = getJobCategories()
      .then((categories) => {
        cachedCategories = categories;
        return categories;
      })
      .catch((error) => {
        fetchPromise = null;
        throw error;
      });
  }

  return fetchPromise;
}

export function useJobCategories() {
  const [categories, setCategories] = useState<JobCategory[]>(cachedCategories ?? []);
  const [loading, setLoading] = useState(!cachedCategories);

  useEffect(() => {
    let active = true;

    loadJobCategories()
      .then((items) => {
        if (!active) return;
        setCategories(items);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const names = categories.map((category) => category.name);

  return { categories, names, loading };
}
