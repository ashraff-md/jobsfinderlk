"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { InlineEmailVerification } from "@/components/auth/inline-email-verification";
import { InlinePhoneVerification } from "@/components/auth/inline-phone-verification";
import {
  RecruiterPhotoUploader,
  type RecruiterPhotoDraft,
} from "@/components/auth/recruiter-photo-uploader";
import { VerificationStatusBadge } from "@/components/auth/verification-status-badge";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import {
  changePassword,
  getAccessToken,
  getProfile,
  updateEmployerProfile,
} from "@/lib/api/auth";
import { getEmployerJobs } from "@/lib/api/jobs";
import { getVerificationStatus } from "@/lib/api/verification";
import { signInPath } from "@/lib/auth/portal";

export function EmployerSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [photo, setPhoto] = useState<RecruiterPhotoDraft | null>(null);
  const [activeJobCount, setActiveJobCount] = useState<number | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [savedSnapshot, setSavedSnapshot] = useState({
    email: "",
    fullName: "",
    title: "",
    phone: "",
    companyId: "",
    companySearch: "",
    photoUrl: null as string | null,
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [activeVerification, setActiveVerification] = useState<"email" | "phone" | null>(null);

  const displayName = useMemo(() => {
    const trimmed = fullName.trim();
    return trimmed || (email ? email.split("@")[0] : "Recruiter");
  }, [email, fullName]);

  const avatarInitial = useMemo(
    () => (displayName.charAt(0) || "R").toUpperCase(),
    [displayName],
  );

  const applyEmployerProfile = useCallback(
    (link: NonNullable<Awaited<ReturnType<typeof getProfile>>["employerUsers"]>[number] | undefined) => {
      const nextFullName = link?.fullName ?? "";
      const nextTitle = link?.title ?? "";
      const nextPhone = link?.contactNo ?? "";
      const nextCompanyId = link?.company?.id ?? "";
      const nextCompanyName = link?.company?.name ?? "";
      const nextPhotoUrl = link?.photoUrl ?? null;

      setFullName(nextFullName);
      setTitle(nextTitle);
      setPhone(nextPhone);
      setCompanyId(nextCompanyId);
      setCompanySearch(nextCompanyName);
      setPhoto(
        nextPhotoUrl
          ? { name: "profile-photo", previewUrl: nextPhotoUrl, dataUrl: nextPhotoUrl }
          : null,
      );
      setSavedSnapshot({
        fullName: nextFullName,
        title: nextTitle,
        phone: nextPhone,
        companyId: nextCompanyId,
        companySearch: nextCompanyName,
        photoUrl: nextPhotoUrl,
      });
    },
    [],
  );

  const loadProfile = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("employer"));
      return;
    }
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const profile = await getProfile();
      setEmail(profile.email);
      setEmailVerified(profile.emailVerified);
      const link = profile.employerUsers?.[0];
      applyEmployerProfile(link);
      setSavedSnapshot((prev) => ({ ...prev, email: profile.email }));
      setPhoneVerified(link?.phoneVerified ?? false);

      try {
        const verification = await getVerificationStatus(getAccessToken());
        setEmailVerified(verification.emailVerified);
        setPhoneVerified(verification.phoneVerified);
      } catch {
        // Keep values from profile response when verification endpoint fails.
      }

      try {
        const jobs = await getEmployerJobs();
        const active = jobs.filter((j) => j.status === "PUBLISHED").length;
        setActiveJobCount(active);
      } catch {
        setActiveJobCount(null);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("employer"));
        return;
      }
      setProfileError(err instanceof ApiError ? err.message : "Failed to load profile.");
    } finally {
      setLoadingProfile(false);
    }
  }, [applyEmployerProfile, router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(null);

    if (!fullName.trim()) {
      setProfileError("Full name is required.");
      return;
    }
    if (!title.trim()) {
      setProfileError("Professional title is required.");
      return;
    }
    if (!phone.trim()) {
      setProfileError("Phone number is required.");
      return;
    }
    if (!companySearch.trim()) {
      setProfileError("Company name is required.");
      return;
    }
    if (!emailVerified) {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setProfileError("Email address is required.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setProfileError("Enter a valid email address.");
        return;
      }
    }

    setSavingProfile(true);
    try {
      const companyChanged =
        companySearch.trim().toLowerCase() !== savedSnapshot.companySearch.trim().toLowerCase();

      const photoPayload =
        photo === null
          ? savedSnapshot.photoUrl
            ? ""
            : undefined
          : photo.dataUrl !== savedSnapshot.photoUrl
            ? photo.dataUrl
            : undefined;

      const updated = await updateEmployerProfile({
        fullName: fullName.trim(),
        title: title.trim() || undefined,
        contactNo: phone.trim() || undefined,
        ...(companyChanged || !companyId
          ? { companyName: companySearch.trim() }
          : { companyId }),
        ...(photoPayload !== undefined ? { photoUrl: photoPayload } : {}),
        ...(!emailVerified ? { email: email.trim() } : {}),
      });
      const nextPhotoUrl = updated.photoUrl ?? null;
      setCompanySearch(updated.company.name);
      setCompanyId(updated.company.id);
      setPhoto(
        nextPhotoUrl
          ? { name: "profile-photo", previewUrl: nextPhotoUrl, dataUrl: nextPhotoUrl }
          : null,
      );
      setSavedSnapshot({
        email: email.trim(),
        fullName: fullName.trim(),
        title: title.trim(),
        phone: phone.trim(),
        companyId: updated.company.id,
        companySearch: updated.company.name,
        photoUrl: nextPhotoUrl,
      });
      setProfileSuccess("Profile saved.");
      window.dispatchEvent(new Event("employer-profile-updated"));
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDiscard = () => {
    setEmail(savedSnapshot.email);
    setFullName(savedSnapshot.fullName);
    setTitle(savedSnapshot.title);
    setPhone(savedSnapshot.phone);
    setCompanyId(savedSnapshot.companyId);
    setCompanySearch(savedSnapshot.companySearch);
    setPhoto(
      savedSnapshot.photoUrl
        ? {
            name: "profile-photo",
            previewUrl: savedSnapshot.photoUrl,
            dataUrl: savedSnapshot.photoUrl,
          }
        : null,
    );
    setProfileError(null);
    setProfileSuccess(null);
  };

  const handlePasswordSubmit = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword.trim()) {
      setPasswordError("Enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      setPasswordSuccess(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-container-max py-stack-lg">
        {loadingProfile ? (
          <p className="text-on-surface-variant">Loading profile…</p>
        ) : (
          <div className="grid grid-cols-12 gap-gutter">
            {profileError && (
              <p className="col-span-12 rounded-lg border border-error/30 bg-error-container/30 px-4 py-3 text-sm text-error">
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p className="col-span-12 rounded-lg border border-secondary/30 bg-surface-container-low px-4 py-3 text-sm text-secondary">
                {profileSuccess}
              </p>
            )}

            <section className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-7">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-primary-container">Personal Information</h2>
                  <p className="font-body-md text-on-surface-variant">
                    Update your personal details and professional identity.
                  </p>
                </div>
              </div>

              <div className="mx-auto max-w-xl space-y-6">
                <RecruiterPhotoUploader
                  photo={photo}
                  onChange={setPhoto}
                  fallbackInitial={avatarInitial}
                  disabled={savingProfile}
                />

                <div className="space-y-4">
                  <div>
                    <label htmlFor="settings-full-name" className="mb-2 block font-label-bold text-on-surface">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      id="settings-full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-title" className="mb-2 block font-label-bold text-on-surface">
                      Professional Title <span className="text-error">*</span>
                    </label>
                    <input
                      id="settings-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Head of Talent Acquisition"
                      className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-company" className="mb-2 block font-label-bold text-on-surface">
                      Company <span className="text-error">*</span>
                    </label>
                    <input
                      id="settings-company"
                      type="text"
                      value={companySearch}
                      onChange={(e) => {
                        const next = e.target.value;
                        setCompanySearch(next);
                        if (
                          companyId &&
                          next.trim().toLowerCase() !== savedSnapshot.companySearch.trim().toLowerCase()
                        ) {
                          setCompanyId("");
                        }
                      }}
                      placeholder="Enter your company name"
                      className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor="settings-email" className="font-label-bold text-on-surface">
                        Email Address <span className="text-error">*</span>
                      </label>
                      <VerificationStatusBadge
                        verified={emailVerified}
                        onVerify={
                          emailVerified
                            ? undefined
                            : () =>
                                setActiveVerification((current) =>
                                  current === "email" ? null : "email",
                                )
                        }
                      />
                    </div>
                    <input
                      id="settings-email"
                      type="email"
                      readOnly={emailVerified}
                      disabled={emailVerified}
                      value={email}
                      onChange={emailVerified ? undefined : (e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className={
                        emailVerified
                          ? "w-full cursor-not-allowed rounded border border-outline-variant bg-surface-container-low p-3 font-body-md text-on-surface-variant outline-none"
                          : "w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                      }
                    />
                    {!emailVerified && activeVerification === "email" ? (
                      <InlineEmailVerification
                        onVerified={() => {
                          setEmailVerified(true);
                          setActiveVerification(null);
                        }}
                      />
                    ) : null}
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor="settings-phone" className="font-label-bold text-on-surface">
                        Phone Number <span className="text-error">*</span>
                      </label>
                      <VerificationStatusBadge
                        verified={phoneVerified}
                        type="phone"
                        onVerify={
                          phoneVerified
                            ? undefined
                            : () =>
                                setActiveVerification((current) =>
                                  current === "phone" ? null : "phone",
                                )
                        }
                      />
                    </div>
                    <input
                      id="settings-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 11 234 5678"
                      className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                    />
                    {!phoneVerified && activeVerification === "phone" ? (
                      <InlinePhoneVerification
                        phone={phone}
                        onVerified={() => {
                          setPhoneVerified(true);
                          setActiveVerification(null);
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <div className="col-span-12 flex flex-col gap-gutter lg:col-span-5">
            <section className="flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-8">
              <div className="mb-4 flex items-center gap-2">
                <Icon name="security" className="text-primary-container" />
                <h2 className="text-lg font-bold text-primary-container">Security</h2>
              </div>
              <p className="mb-8 font-body-md text-on-surface-variant">
                Manage your password and account security settings.
              </p>
              {passwordError && (
                <p className="mb-4 text-sm text-error">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="mb-4 text-sm text-secondary">{passwordSuccess}</p>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="settings-current-password" className="mb-2 block font-label-bold text-on-surface">
                    Current Password
                  </label>
                  <input
                    id="settings-current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label htmlFor="settings-new-password" className="mb-2 block font-label-bold text-on-surface">
                    New Password
                  </label>
                  <input
                    id="settings-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label htmlFor="settings-retype-password" className="mb-2 block font-label-bold text-on-surface">
                    Retype Password
                  </label>
                  <input
                    id="settings-retype-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none focus:border-primary-container"
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={savingPassword}
                onClick={handlePasswordSubmit}
                className="mt-8 w-full rounded bg-primary-container py-3 font-label-bold text-white transition-all hover:bg-black disabled:opacity-60"
              >
                {savingPassword ? "Updating…" : "Update Password"}
              </button>
            </section>

            <section className="relative overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-8">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-secondary/5 blur-3xl" />
              <h2 className="mb-8 text-lg font-bold text-primary-container">Billing &amp; Plan</h2>
              <div className="mb-4 rounded border border-outline-variant bg-surface-container-low p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded bg-primary-container px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Enterprise Pro
                    </span>
                    <p className="mt-2 text-lg font-bold text-primary-container">
                      $499
                      <span className="font-body-md font-normal text-on-surface-variant">/mo</span>
                    </p>
                    <p className="font-label-sm text-on-surface-variant">Billing details coming soon</p>
                  </div>
                  <Icon name="workspace_premium" className="text-3xl text-secondary" filled />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant py-2">
                  <span className="font-body-md text-on-surface">Published Job Posts</span>
                  <span className="font-label-bold text-primary-container">
                    {activeJobCount !== null ? activeJobCount : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant py-2">
                  <span className="font-body-md text-on-surface">Team Seats</span>
                  <span className="font-label-bold text-primary-container">—</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-body-md text-on-surface">Payment Method</span>
                  <span className="font-label-bold text-on-surface-variant">Not configured</span>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <Link
                  href="/pricing"
                  className="flex-1 rounded bg-primary-container py-3 text-center font-label-bold text-label-sm text-white transition-all hover:bg-black"
                >
                  Manage Subscription
                </Link>
                <button
                  type="button"
                  className="rounded border border-outline-variant px-4 py-3 transition-all hover:bg-surface-variant"
                  aria-label="Download invoice"
                >
                  <Icon name="download" />
                </button>
              </div>
            </section>
            </div>

            <div className="col-span-12 flex flex-col items-stretch justify-end gap-4 border-t border-outline-variant pt-8 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleDiscard}
                className="px-8 py-3 font-label-bold text-on-surface-variant transition-colors hover:text-primary-container"
              >
                Discard Changes
              </button>
              <button
                type="button"
                disabled={savingProfile}
                onClick={handleSaveProfile}
                className="executive-shadow rounded-lg bg-secondary px-10 py-3 font-label-bold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-60"
              >
                {savingProfile ? "Saving…" : "Save All Preferences"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
