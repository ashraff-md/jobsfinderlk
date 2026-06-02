"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { applyToJob } from "@/lib/api/jobs";

export function ApplyButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    if (!getAccessToken()) {
      router.push("/auth/sign-in");
      return;
    }
    setLoading(true);
    try {
      await applyToJob(slug);
      setApplied(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/auth/sign-in");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleApply}
      disabled={loading || applied}
      className="w-full rounded-xl bg-white py-4 font-bold text-navy-deep shadow-md transition-all hover:bg-surface-container-low active:scale-[0.98] disabled:opacity-70"
    >
      {applied ? "Application Submitted" : loading ? "Submitting…" : "Apply Now"}
    </button>
  );
}
