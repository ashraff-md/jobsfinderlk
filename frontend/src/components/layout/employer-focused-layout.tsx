"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Icon } from "@/components/ui/icon";

type EmployerFocusedLayoutProps = {
  children: ReactNode;
};

export function EmployerFocusedLayout({ children }: EmployerFocusedLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-container-max flex-1 flex-col px-margin-mobile py-stack-lg md:px-margin-desktop">
        <Link
          href="/employer/jobs"
          className="mb-6 inline-flex w-fit items-center gap-2 font-label-bold text-secondary transition-colors hover:underline"
        >
          <Icon name="arrow_back" className="text-[20px]" />
          Back to job listings
        </Link>
        {children}
      </main>
      <SiteFooter className="mt-auto" />
    </div>
  );
}
