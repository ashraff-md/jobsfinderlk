"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import {
  confirmPhoneOtp,
  getVerificationStatus,
  RecruiterVerificationStatus,
  sendEmailVerification,
  sendPhoneOtp,
} from "@/lib/api/verification";
import { VerificationStatusBadge } from "@/components/auth/verification-status-badge";
import { cn } from "@/lib/utils";

type RecruiterVerificationPanelProps = {
  compact?: boolean;
  onVerified?: () => void;
  onStatusChange?: (status: RecruiterVerificationStatus) => void;
  /** Always show email/phone status rows (e.g. on profile page). */
  alwaysShowStatus?: boolean;
};

export function RecruiterVerificationPanel({
  compact = false,
  onVerified,
  onStatusChange,
  alwaysShowStatus = false,
}: RecruiterVerificationPanelProps) {
  const [status, setStatus] = useState<RecruiterVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneConfirming, setPhoneConfirming] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await getVerificationStatus(token);
      setStatus(next);
      setPhone(next.contactNo ?? "");
      onStatusChange?.(next);
      if (next.canPostJobs) onVerified?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load verification status.");
    } finally {
      setLoading(false);
    }
  }, [onVerified, onStatusChange]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleSendEmail = async () => {
    setEmailSending(true);
    setEmailMessage(null);
    setError(null);
    try {
      const result = await sendEmailVerification(getAccessToken());
      setEmailMessage(result.message);
      await loadStatus();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send verification email.");
    } finally {
      setEmailSending(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError("Enter your phone number first.");
      return;
    }
    setPhoneSending(true);
    setPhoneMessage(null);
    setError(null);
    try {
      const result = await sendPhoneOtp(phone.trim(), getAccessToken());
      setPhone(result.contactNo);
      setOtpSent(true);
      setPhoneMessage(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send OTP.");
    } finally {
      setPhoneSending(false);
    }
  };

  const handleConfirmOtp = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setPhoneConfirming(true);
    setPhoneMessage(null);
    setError(null);
    try {
      const result = await confirmPhoneOtp(otp, getAccessToken());
      setPhoneMessage(result.message);
      setOtp("");
      setOtpSent(false);
      await loadStatus();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid OTP.");
    } finally {
      setPhoneConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
        Checking verification status…
      </div>
    );
  }

  if (!status) return null;

  if (!status.profileComplete) {
    if (compact) return null;
    return (
      <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
        Save your full name, professional title, and phone number in the form above, then verify
        your email and phone below.
      </div>
    );
  }

  if (status.canPostJobs && !alwaysShowStatus) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-3 rounded-lg border border-secondary/30 bg-secondary/10 p-4">
        <Icon name="verified" className="text-secondary" filled />
        <p className="text-body-md text-on-surface">
          Your email and phone are verified. You can post vacancies.
        </p>
      </div>
    );
  }

  const showActions = !status.canPostJobs;

  return (
    <div
      className={cn(
        "space-y-5 rounded-lg border border-outline-variant bg-surface-container-lowest p-6",
        showActions && "border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/20",
        compact && "p-4",
      )}
    >
      {showActions ? (
        <div className="flex items-start gap-3">
          <Icon name="shield" className="mt-0.5 text-amber-700 dark:text-amber-400" />
          <div>
            <h3 className="text-title-md text-on-surface">Verify before posting</h3>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Recruiters must verify their email (via link) and phone (via OTP) before posting a
              vacancy.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Icon name="verified_user" className="text-secondary" />
          <h3 className="text-title-md text-on-surface">Contact verification</h3>
        </div>
      )}

      {error ? (
        <p className="rounded-lg bg-error-container px-4 py-2 text-body-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-bold text-on-surface">Email</span>
            <VerificationStatusBadge
              verified={status.emailVerified}
              onVerify={
                showActions && !status.emailVerified ? handleSendEmail : undefined
              }
            />
          </div>
          <p className="text-body-sm text-on-surface-variant">{status.email}</p>
          {showActions && !status.emailVerified ? (
            <>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={emailSending}
                className="rounded-lg bg-primary px-4 py-2 font-label-bold text-on-primary disabled:opacity-60"
              >
                {emailSending ? "Sending…" : "Send verification link"}
              </button>
              {emailMessage ? (
                <p className="text-body-sm text-on-surface-variant">{emailMessage}</p>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="space-y-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-bold text-on-surface">Phone</span>
            <VerificationStatusBadge verified={status.phoneVerified} type="phone" />
          </div>

          {showActions && !status.phoneVerified ? (
            <>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={phoneSending}
                  className="rounded-lg border border-primary px-4 py-2 font-label-bold text-primary disabled:opacity-60"
                >
                  {phoneSending ? "Sending…" : otpSent ? "Resend OTP" : "Send OTP"}
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
                    className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmOtp}
                    disabled={phoneConfirming}
                    className="rounded-lg bg-primary px-4 py-2 font-label-bold text-on-primary disabled:opacity-60"
                  >
                    {phoneConfirming ? "Verifying…" : "Verify phone"}
                  </button>
                </div>
              ) : null}
              {phoneMessage ? (
                <p className="text-body-sm text-on-surface-variant">{phoneMessage}</p>
              ) : null}
            </>
          ) : (
            <p className="text-body-sm text-on-surface-variant">{status.contactNo}</p>
          )}
        </div>
      </div>

      {!compact ? (
        <p className="text-body-sm text-on-surface-variant">
          Need help? Visit{" "}
          <Link href="/employer/settings" className="font-label-bold text-primary hover:underline">
            your profile
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
