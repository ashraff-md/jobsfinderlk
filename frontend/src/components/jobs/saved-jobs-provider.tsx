"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAccessToken, getStoredUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { getSavedJobIds, saveJob, unsaveJob } from "@/lib/api/saved-jobs";

type SavedJobsContextValue = {
  canSave: boolean;
  loading: boolean;
  savedIds: Set<string>;
  isSaved: (jobId: string) => boolean;
  toggleSave: (jobId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const SavedJobsContext = createContext<SavedJobsContextValue | null>(null);

function isSeekerSession() {
  const token = getAccessToken();
  const user = getStoredUser();
  return Boolean(token && user?.role === "SEEKER");
}

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const [canSave, setCanSave] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());

  const refresh = useCallback(async () => {
    if (!isSeekerSession()) {
      setCanSave(false);
      setSavedIds(new Set());
      setLoading(false);
      return;
    }

    setCanSave(true);
    setLoading(true);
    try {
      const ids = await getSavedJobIds();
      setSavedIds(new Set(ids));
    } catch {
      setSavedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleSave = useCallback(
    async (jobId: string) => {
      if (!canSave) return;

      const wasSaved = savedIds.has(jobId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(jobId);
        else next.add(jobId);
        return next;
      });

      try {
        if (wasSaved) {
          await unsaveJob(jobId);
        } else {
          await saveJob(jobId);
        }
      } catch (error) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(jobId);
          else next.delete(jobId);
          return next;
        });
        throw error;
      }
    },
    [canSave, savedIds],
  );

  const value = useMemo<SavedJobsContextValue>(
    () => ({
      canSave,
      loading,
      savedIds,
      isSaved: (jobId) => savedIds.has(jobId),
      toggleSave,
      refresh,
    }),
    [canSave, loading, savedIds, toggleSave, refresh],
  );

  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>;
}

export function useSavedJobs() {
  const context = useContext(SavedJobsContext);
  if (!context) {
    throw new Error("useSavedJobs must be used within SavedJobsProvider");
  }
  return context;
}

export function useOptionalSavedJobs() {
  return useContext(SavedJobsContext);
}

export function useCanSaveJobs() {
  return isSeekerSession();
}
