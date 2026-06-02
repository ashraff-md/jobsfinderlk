"use client";

import Link from "next/link";
import { LOGO_URL } from "@/lib/assets";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-container-max items-center justify-between px-margin-mobile md:h-20 md:px-margin-desktop">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="JobsFinder.lk Logo" className="h-10 w-auto" src={LOGO_URL} />
          <span className="text-[22px] font-extrabold tracking-tight text-primary md:text-[24px]">
            JobsFinder.lk
          </span>
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/employer/jobs/new"
            className="executive-shadow rounded-lg bg-primary px-4 py-2.5 text-label-bold text-on-primary transition-all hover:opacity-90 active:scale-95 md:px-6"
          >
            Post a Vacancy
          </Link>
          <Link
            href="/auth/sign-in"
            className="rounded-lg border border-outline-variant px-4 py-2.5 text-label-bold text-primary transition-colors hover:bg-surface-container-low md:px-6"
          >
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
}
