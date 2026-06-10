"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";

function getPageTitle(pathname: string) {
  if (pathname === "/employer") return "Dashboard";
  if (pathname.startsWith("/employer/applications")) return "Applications";
  if (pathname.includes("/applicants")) return "Candidate Pipeline";
  if (pathname.startsWith("/employer/jobs/new")) return "Post a Job";
  if (pathname.startsWith("/employer/jobs")) return "Job Listings";
  if (pathname.startsWith("/employer/ads/new")) return "Create Campaign";
  if (pathname.startsWith("/employer/ads")) return "Advertising";
  if (pathname.startsWith("/employer/companies/new")) return "Register Company";
  if (pathname.startsWith("/employer/settings")) return "Recruiter Profile";
  return "Recruiter Dashboard";
}

export function EmployerTopNav() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-6 md:px-margin-desktop">
      <h1 className="truncate text-xl font-bold text-primary-container">{title}</h1>

      <div className="flex items-center gap-4 sm:gap-6">
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
  );
}
