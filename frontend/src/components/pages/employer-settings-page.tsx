"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmployerShell } from "@/components/layout/employer-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import {
  changePassword,
  getAccessToken,
  getProfile,
  updateEmployerProfile,
} from "@/lib/api/auth";
import { getEmployerJobs } from "@/lib/api/jobs";
import { signInPath } from "@/lib/auth/portal";

export function EmployerSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [activeJobCount, setActiveJobCount] = useState<number | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);

  const [savedSnapshot, setSavedSnapshot] = useState({
    fullName: "",
    title: "",
    phone: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

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
      setFullName(nextFullName);
      setTitle(nextTitle);
      setPhone(nextPhone);
      setSavedSnapshot({
        fullName: nextFullName,
        title: nextTitle,
        phone: nextPhone,
      });
      if (link?.company) {
        setHasCompany(true);
        setCompanyName(link.company.name);
        setCompanyDescription(link.company.description ?? "");
        setCompanyLogo(link.company.logoUrl ?? null);
      } else {
        setHasCompany(false);
        setCompanyName("");
        setCompanyDescription("");
        setCompanyLogo(null);
      }
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
      const link = profile.employerUsers?.[0];
      applyEmployerProfile(link);

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

    setSavingProfile(true);
    try {
      await updateEmployerProfile({
        fullName: fullName.trim(),
        title: title.trim() || undefined,
        contactNo: phone.trim() || undefined,
      });
      setSavedSnapshot({
        fullName: fullName.trim(),
        title: title.trim(),
        phone: phone.trim(),
      });
      setProfileSuccess("Profile saved.");
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDiscard = () => {
    setFullName(savedSnapshot.fullName);
    setTitle(savedSnapshot.title);
    setPhone(savedSnapshot.phone);
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
    <EmployerShell activeNav="settings" userName={displayName} userTitle={title || "Recruiter"} showFooter={false}>
      <header className="-mx-margin-mobile sticky top-0 z-30 flex h-20 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-margin-mobile md:-mx-margin-desktop md:px-margin-desktop">
        <h1 className="text-xl font-bold text-primary-container">Recruiter Profile Settings</h1>
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/jobs" className="font-body-md text-on-surface-variant transition-colors hover:text-secondary">
              Find Jobs
            </Link>
            <Link href="/companies" className="font-body-md text-on-surface-variant transition-colors hover:text-secondary">
              Companies
            </Link>
            <Link href="/pricing" className="font-body-md text-on-surface-variant transition-colors hover:text-secondary">
              Salaries
            </Link>
          </nav>
          <div className="hidden h-8 w-px bg-outline-variant lg:block" />
          <button
            type="button"
            className="rounded p-2 text-on-surface-variant transition-colors hover:text-primary-container"
            aria-label="Notifications"
          >
            <Icon name="notifications" />
          </button>
          <Link
            href="/employer/jobs/new"
            className="rounded bg-primary-container px-4 py-2 font-label-bold text-white transition-all hover:bg-black sm:px-6"
          >
            Post a Job
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-container-max py-stack-lg">
        {loadingProfile ? (
          <p className="text-on-surface-variant">Loading settings…</p>
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

              <div className="flex flex-col gap-8 md:flex-row">
                <div className="shrink-0">
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high">
                    <span className="text-4xl font-bold text-primary-container">{avatarInitial}</span>
                  </div>
                  <p className="mt-4 text-center font-label-sm text-on-surface-variant">Photo upload coming soon</p>
                </div>

                <div className="grow space-y-4">
                  <div>
                    <label htmlFor="settings-full-name" className="mb-2 block font-label-bold text-on-surface">
                      Full Name
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
                      Professional Title
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="settings-email" className="mb-2 block font-label-bold text-on-surface">
                        Email Address
                      </label>
                      <input
                        id="settings-email"
                        type="email"
                        readOnly
                        value={email}
                        className="w-full cursor-not-allowed rounded border border-outline-variant bg-surface-container-low p-3 font-body-md outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-phone" className="mb-2 block font-label-bold text-on-surface">
                        Phone Number
                      </label>
                      <input
                        id="settings-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+94 11 234 5678"
                        className="w-full rounded border border-outline-variant bg-white p-3 font-body-md outline-none transition-all focus:border-primary-container focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="col-span-12 flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-5">
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

            <section className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-7">
              <div className="mb-8">
                <span className="mb-2 inline-block rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Read-Only
                </span>
                <h2 className="text-lg font-bold text-primary-container">Current Company Information</h2>
                <p className="font-body-md text-on-surface-variant">
                  Updates to company branding and details must be reviewed and approved by the platform
                  administration.
                </p>
              </div>

              {hasCompany ? (
                <div className="flex flex-col gap-8 opacity-80 md:flex-row">
                  <div className="shrink-0">
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high">
                      {companyLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="Company logo" className="h-full w-full object-cover" src={companyLogo} />
                      ) : (
                        <span className="text-3xl font-bold text-primary-container">
                          {companyName.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grow space-y-4">
                    <div>
                      <label htmlFor="settings-company-name" className="mb-2 block font-label-bold text-on-surface">
                        Company Name
                      </label>
                      <input
                        id="settings-company-name"
                        readOnly
                        type="text"
                        value={companyName}
                        className="w-full cursor-not-allowed rounded border border-outline-variant bg-surface-container-low p-3 font-body-md outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-company-description" className="mb-2 block font-label-bold text-on-surface">
                        Company Description
                      </label>
                      <textarea
                        id="settings-company-description"
                        readOnly
                        rows={3}
                        value={companyDescription}
                        className="w-full cursor-not-allowed rounded border border-outline-variant bg-surface-container-low p-3 font-body-md outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-6 text-center">
                  <p className="mb-4 text-on-surface-variant">
                    No company is linked to your account yet.
                  </p>
                  <Link
                    href="/employer/companies/new"
                    className="inline-flex items-center justify-center rounded-lg bg-secondary px-6 py-2 font-label-bold text-white"
                  >
                    Register your company
                  </Link>
                </div>
              )}

              <div className="mt-8">
                <button
                  type="button"
                  disabled={!hasCompany}
                  className="w-full rounded border border-secondary px-6 py-3 font-label-bold text-secondary transition-all hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                >
                  Request Company Update
                </button>
              </div>
            </section>

            <section className="relative col-span-12 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-5">
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
    </EmployerShell>
  );
}
