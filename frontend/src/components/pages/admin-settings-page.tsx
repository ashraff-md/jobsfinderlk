"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import {
  changePassword,
  getAccessToken,
  getProfile,
  updateAdminProfile,
} from "@/lib/api/auth";
import { signInPath } from "@/lib/auth/portal";
import type { UserRole } from "@/lib/api/types";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "font-label-bold text-on-surface";

function roleLabel(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "MODERATOR":
      return "Moderator";
    default:
      return role;
  }
}

export function AdminSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const displayName = useMemo(() => {
    const full = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    return full || (email ? email.split("@")[0] : "Admin User");
  }, [email, firstName, lastName]);

  const loadProfile = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoadingProfile(true);
    try {
      const profile = await getProfile();
      setEmail(profile.email);
      setRole(profile.role);
      setFirstName(profile.adminProfile?.firstName ?? "");
      setLastName(profile.adminProfile?.lastName ?? "");
      setContactEmail(profile.adminProfile?.email ?? profile.email);
      setContactNo(profile.adminProfile?.contactNo ?? "");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!firstName.trim()) {
      setProfileError("First name is required.");
      return;
    }
    if (!lastName.trim()) {
      setProfileError("Last name is required.");
      return;
    }
    if (!contactEmail.trim()) {
      setProfileError("Email is required.");
      return;
    }

    setSavingProfile(true);
    try {
      await updateAdminProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: contactEmail.trim(),
        contactNo: contactNo.trim() || undefined,
      });
      setProfileSuccess("Admin profile updated.");
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      setPasswordError(
        err instanceof ApiError ? err.message : "Failed to update password.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <RecruiterAdminShell
      activeNav="settings"
      userName={displayName}
      userTitle={roleLabel(role)}
    >
      <AdminPageCanvas className="max-w-[960px]">
        <div className="mb-stack-lg">
          <nav className="mb-2 flex font-label-sm uppercase tracking-wider text-outline">
            <Link href="/admin" className="hover:text-secondary">
              Admin
            </Link>
            <span className="mx-2">/</span>
            <span className="text-secondary">Profile</span>
          </nav>
          <h1 className="text-headline-lg text-on-background">Admin Profile</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Update your administrator identity and account security.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <section className="professional-card rounded-xl border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-7">
            <div className="mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <Icon name="manage_accounts" className="text-primary" />
              <h2 className="text-headline-md text-on-surface">Admin Profile</h2>
            </div>

            {loadingProfile ? (
              <p className="text-on-surface-variant">Loading profile…</p>
            ) : (
              <form className="space-y-4" onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className={labelClass} htmlFor="admin-first-name">
                      First name
                    </label>
                    <input
                      id="admin-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass} htmlFor="admin-last-name">
                      Last name
                    </label>
                    <input
                      id="admin-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className={labelClass} htmlFor="admin-email">
                      Email
                    </label>
                    <input
                      id="admin-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="admin@jobsfinder.lk"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass} htmlFor="admin-contact-no">
                      Contact no
                    </label>
                    <input
                      id="admin-contact-no"
                      type="tel"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      placeholder="+94 11 234 5678"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className={labelClass}>Access level</span>
                  <p className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 font-body-md">
                    {roleLabel(role)}
                  </p>
                </div>

                {profileError && (
                  <p className="rounded-lg border border-error/30 bg-error-container/30 px-3 py-2 text-label-sm text-error">
                    {profileError}
                  </p>
                )}
                {profileSuccess && (
                  <p className="rounded-lg border border-secondary/30 bg-secondary-container/10 px-3 py-2 text-label-sm text-secondary">
                    {profileSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-lg bg-primary px-8 py-3 font-label-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {savingProfile ? "Saving…" : "Save Profile"}
                </button>
              </form>
            )}
          </section>

          <section className="professional-card rounded-xl border border-outline-variant bg-surface-container-lowest p-8 lg:col-span-5">
            <div className="mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <Icon name="security" className="text-primary" />
              <h2 className="text-headline-md text-on-surface">Password</h2>
            </div>
            <p className="mb-6 text-body-md text-on-surface-variant">
              Change the password used to sign in to the admin portal.
            </p>

            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="current-password">
                  Current password
                </label>
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="new-password">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="confirm-password">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={inputClass}
                />
              </div>

              {passwordError && (
                <p className="rounded-lg border border-error/30 bg-error-container/30 px-3 py-2 text-label-sm text-error">
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p className="rounded-lg border border-secondary/30 bg-secondary-container/10 px-3 py-2 text-label-sm text-secondary">
                  {passwordSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={savingPassword}
                className="mt-2 w-full rounded-lg border border-primary-container py-3 font-label-bold text-primary-container transition-colors hover:bg-surface-container-low disabled:opacity-50"
              >
                {savingPassword ? "Updating…" : "Update Password"}
              </button>
            </form>
          </section>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
