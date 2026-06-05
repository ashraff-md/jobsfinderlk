"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { confirmPhoneOtp, sendPhoneOtp } from "@/lib/api/verification";

type InlinePhoneVerificationProps = {
  phone: string;
  onVerified?: () => void;
};

export function InlinePhoneVerification({ phone, onVerified }: InlinePhoneVerificationProps) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError("Enter your phone number above before verifying.");
      return;
    }
    setSending(true);
    setMessage(null);
    setError(null);
    try {
      const result = await sendPhoneOtp(phone.trim(), getAccessToken());
      setOtpSent(true);
      setMessage(
        result.alreadyVerified
          ? "Your phone number is already verified."
          : "OTP sent. Enter the 6-digit code below.",
      );
      if (result.alreadyVerified) onVerified?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send OTP.");
    } finally {
      setSending(false);
    }
  };

  const handleConfirm = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setConfirming(true);
    setMessage(null);
    setError(null);
    try {
      await confirmPhoneOtp(otp, getAccessToken());
      setMessage("Phone number verified successfully.");
      setOtp("");
      setOtpSent(false);
      onVerified?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid OTP.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-primary/20 bg-primary-container/5 p-4">
      <p className="text-body-sm text-on-surface-variant">
        We&apos;ll send a one-time code to{" "}
        <span className="font-label-bold text-on-surface">{phone.trim() || "your phone number"}</span>
        .
      </p>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {message ? <p className="text-body-sm text-secondary">{message}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={sending}
          className="rounded-lg border border-primary px-4 py-2 font-label-bold text-primary disabled:opacity-60"
        >
          {sending ? "Sending…" : otpSent ? "Resend OTP" : "Send OTP"}
        </button>
      </div>
      {otpSent ? (
        <div className="space-y-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit code"
            className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming}
            className="rounded-lg bg-primary px-4 py-2 font-label-bold text-on-primary disabled:opacity-60"
          >
            {confirming ? "Verifying…" : "Confirm code"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
