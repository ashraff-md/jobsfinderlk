"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import {
  dashboardPath,
  getAccessToken,
  getStoredUser,
  loginAdmin,
} from "@/lib/api/auth";
import { isSafeReturnUrl, userHasPortalAccess } from "@/lib/auth/portal";
import { LOGO_URL } from "@/lib/assets";

export function AuthAdminSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    const user = getStoredUser();
    if (token && user && userHasPortalAccess(user.role, "admin")) {
      const returnUrl = searchParams.get("returnUrl");
      router.replace(
        returnUrl && isSafeReturnUrl(returnUrl, user.role) ? returnUrl : dashboardPath(user.role),
      );
    }
  }, [router, searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const data = await loginAdmin(email, password);
      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl && isSafeReturnUrl(returnUrl, data.user.role)) {
        router.push(returnUrl);
      } else {
        router.push(dashboardPath(data.user.role));
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Sign in failed. Check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-primary-container font-body-md text-on-primary md:flex-row">
      <section className="relative hidden flex-col justify-between overflow-hidden p-margin-desktop md:flex md:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-secondary opacity-90" />
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="JobsFinder.lk Logo" className="h-10 w-auto brightness-0 invert" src={LOGO_URL} />
            <span className="text-xl font-extrabold text-on-primary">JobsFinder.lk</span>
          </Link>
          <p className="mt-2 text-sm font-bold uppercase tracking-wider text-on-primary-container">
            Platform Administration
          </p>
        </div>
        <div className="relative z-10 max-w-md space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <Icon name="admin_panel_settings" className="text-4xl text-on-primary" />
          </div>
          <h1 className="text-3xl font-extrabold leading-tight text-on-primary md:text-4xl">
            Admin control center
          </h1>
          <p className="text-on-primary-container">
            Review jobs, onboard companies, and manage platform operations. Access is restricted to
            administrators and moderators.
          </p>
        </div>
        <p className="relative z-10 text-sm text-on-primary-container/80">
          © {new Date().getFullYear()} JobsFinder.lk — Internal use only
        </p>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center bg-surface-container-lowest p-margin-mobile text-on-surface md:p-margin-desktop">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="flex flex-col items-center md:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="JobsFinder.lk Logo" className="h-10 w-auto" src={LOGO_URL} />
              <span className="text-xl font-extrabold text-primary">JobsFinder.lk</span>
            </Link>
          </div>

          <header className="space-y-2 text-center md:text-left">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Icon name="lock" className="text-base" />
              Secure admin sign-in
            </div>
            <h2 className="text-2xl font-extrabold text-primary">Sign in to admin</h2>
            <p className="text-on-surface-variant">
              Use your administrator credentials. Seeker and recruiter accounts cannot access this
              portal.
            </p>
          </header>

          {error && (
            <div className="rounded-lg border border-error/30 bg-error-container px-4 py-3 text-sm text-on-error-container">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="font-label-bold text-on-surface" htmlFor="admin-email">
                Admin email
              </label>
              <div className="group relative">
                <Icon
                  name="mail"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary"
                />
                <input
                  className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-4 outline-none transition-colors focus:border-secondary focus:ring-0"
                  id="admin-email"
                  name="email"
                  type="email"
                  placeholder="admin@jobsfinder.lk"
                  autoComplete="username"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-label-bold text-on-surface" htmlFor="admin-password">
                Password
              </label>
              <div className="group relative">
                <Icon
                  name="lock"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary"
                />
                <input
                  className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-12 outline-none transition-colors focus:border-secondary focus:ring-0"
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-4 font-label-bold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Enter admin dashboard"}
            </button>
          </form>

          <footer className="border-t border-outline-variant pt-6 text-center text-sm text-on-surface-variant">
            <Link href="/auth/sign-in" className="font-label-bold text-secondary hover:underline">
              ← Back to job seeker / recruiter sign in
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
