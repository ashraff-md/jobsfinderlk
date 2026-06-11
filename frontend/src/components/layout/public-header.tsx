"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dashboardPath, getAccessToken, getStoredUser } from "@/lib/api/auth";
import type { UserRole } from "@/lib/api/types";
import { AVATAR_URL, LOGO_URL } from "@/lib/assets";

export function PublicHeader() {
  const pathname = usePathname();
  const [sessionRole, setSessionRole] = useState<UserRole | null>(null);
  const [ready, setReady] = useState(false);
  const showPostVacancy = !pathname.startsWith("/employer/jobs/new");

  useEffect(() => {
    const syncSession = () => {
      const token = getAccessToken();
      const user = getStoredUser();
      setSessionRole(token && user?.role ? user.role : null);
      setReady(true);
    };
    syncSession();
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  const isLoggedIn = Boolean(sessionRole);

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-container-max items-center justify-between px-margin-mobile md:h-20 md:px-margin-desktop">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="JobsFinder.lk Logo"
            className="h-10 w-auto"
            fetchPriority="high"
            src={LOGO_URL}
          />
          <span className="text-[22px] font-extrabold tracking-tight text-primary md:text-[24px]">
            JobsFinder.lk
          </span>
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          {showPostVacancy ? (
            <Link
              href="/employer/jobs/new"
              className="executive-shadow rounded-lg bg-primary px-4 py-2.5 text-label-bold text-on-primary transition-all hover:opacity-90 active:scale-95 md:px-6"
            >
              Post a Vacancy
            </Link>
          ) : null}
          {ready && isLoggedIn && sessionRole ? (
            <Link
              href={dashboardPath(sessionRole)}
              className="rounded-full ring-2 ring-primary-container/10 transition-opacity hover:opacity-90"
              title="Your account"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Your account"
                className="h-10 w-10 rounded-full object-cover md:h-11 md:w-11"
                src={AVATAR_URL}
              />
            </Link>
          ) : ready ? (
            <Link
              href="/auth/sign-in"
              className="rounded-lg border border-outline-variant px-4 py-2.5 text-label-bold text-primary transition-colors hover:bg-surface-container-low md:px-6"
            >
              Log in
            </Link>
          ) : (
            <span
              className="inline-block h-10 w-[88px] rounded-lg md:h-11 md:w-[100px]"
              aria-hidden
            />
          )}
        </div>
      </nav>
    </header>
  );
}
