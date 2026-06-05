"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { sendEmailVerification } from "@/lib/api/verification";

type InlineEmailVerificationProps = {
  onVerified?: () => void;
};

export function InlineEmailVerification({ onVerified }: InlineEmailVerificationProps) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setSending(true);
    setMessage(null);
    setError(null);
    try {
      const result = await sendEmailVerification(getAccessToken());
      setMessage(
        result.alreadyVerified
          ? "Your email is already verified."
          : "Verification link sent. Check your inbox and open the link to confirm your email.",
      );
      if (result.alreadyVerified) onVerified?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send verification email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-primary/20 bg-primary-container/5 p-4">
      <p className="text-body-sm text-on-surface-variant">
        We&apos;ll send a verification link to your email address. Open the link to complete
        verification.
      </p>
      {error ? (
        <p className="text-body-sm text-error">{error}</p>
      ) : null}
      {message ? (
        <p className="text-body-sm text-secondary">{message}</p>
      ) : null}
      <button
        type="button"
        onClick={handleSend}
        disabled={sending}
        className="rounded-lg bg-primary px-4 py-2 font-label-bold text-on-primary disabled:opacity-60"
      >
        {sending ? "Sending…" : message ? "Resend verification link" : "Send verification link"}
      </button>
    </div>
  );
}
