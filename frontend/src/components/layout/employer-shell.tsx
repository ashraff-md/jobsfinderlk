"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutLink } from "@/components/auth/logout-link";
import { EmployerTopNav } from "@/components/layout/employer-top-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Icon } from "@/components/ui/icon";
import { LOGO_URL } from "@/lib/assets";
import { cn } from "@/lib/utils";

const SIDEBAR_NAV = [
  { href: "/employer", icon: "dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/employer/applications", icon: "description", label: "Applications", key: "applications" },
  { href: "/employer/jobs", icon: "work", label: "Job Listings", key: "listings" },
  { href: "/employer/ads", icon: "campaign", label: "Advertising", key: "ads" },
  { href: "/employer/settings", icon: "manage_accounts", label: "Profile", key: "settings" },
] as const;

const MOBILE_NAV = [
  { href: "/employer", icon: "dashboard", label: "Home", key: "dashboard" },
  { href: "/employer/applications", icon: "description", label: "Applied", key: "applications" },
  { href: "/employer/ads", icon: "campaign", label: "Ads", key: "ads" },
  { href: "/employer/jobs", icon: "work", label: "Jobs", key: "listings" },
  { href: "/employer/settings", icon: "manage_accounts", label: "Profile", key: "settings" },
] as const;

type EmployerNavKey = (typeof SIDEBAR_NAV)[number]["key"];

type EmployerShellProps = {
  children: ReactNode;
  activeNav?: EmployerNavKey;
  userName?: string;
  userTitle?: string;
  userAvatar?: string;
  fullHeight?: boolean;
};

function isActive(pathname: string, href: string, key?: EmployerNavKey) {
  if (key === "dashboard") return pathname === "/employer";
  if (key === "applications") {
    return pathname.startsWith("/employer/applications") || pathname.includes("/applicants");
  }
  if (key === "listings") {
    if (pathname.includes("/applicants")) return false;
    return pathname.startsWith("/employer/jobs");
  }
  if (key === "ads") return pathname.startsWith("/employer/ads");
  if (key === "settings") {
    return (
      pathname.startsWith("/employer/settings") ||
      pathname.startsWith("/employer/companies/new")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function EmployerShell({
  children,
  activeNav,
  userName = "Alex Thompson",
  userTitle = "Premium Member",
  userAvatar,
  fullHeight = false,
}: EmployerShellProps) {
  const pathname = usePathname();

  const navActive = (key: EmployerNavKey, href: string) =>
    activeNav ? activeNav === key : isActive(pathname, href, key);

  return (
    <div className={cn("bg-background font-body-md text-on-surface", fullHeight && "h-screen overflow-hidden")}>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col gap-2 border-r border-on-primary-fixed-variant bg-primary-container p-6 md:flex">
        <div className="mb-10">
          <Link href="/employer" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="JobsFinder.lk Logo"
              className="h-10 w-auto object-contain brightness-0 invert"
              src={LOGO_URL}
            />
            <span className="text-[22px] font-extrabold tracking-tight text-on-primary">
              JobsFinder.lk
            </span>
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
          {userAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="User profile picture"
              className="h-10 w-10 rounded-lg object-cover"
              src={userAvatar}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-sm font-bold text-white">
              {(userName.charAt(0) || "R").toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-label-bold text-white">{userName}</p>
            <p className="text-[10px] uppercase tracking-wider text-on-primary-container">{userTitle}</p>
          </div>
        </div>

        <nav className="flex grow flex-col gap-1">
          {SIDEBAR_NAV.map((item) => {
            const active = navActive(item.key, item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded p-3 font-bold transition-all duration-200",
                  active
                    ? "bg-white/10 text-white"
                    : "text-on-primary-container hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon name={item.icon} filled={active} />
                <span className="font-label-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/pricing"
            className="rounded bg-secondary p-3 text-center font-bold text-label-bold text-on-secondary transition-all hover:brightness-110"
          >
            View Pricing
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 p-2 text-on-primary-container transition-colors hover:text-white"
          >
            <Icon name="help" />
            <span className="font-label-bold">Help Center</span>
          </Link>
          <LogoutLink />
        </div>
      </aside>

      <main
        className={cn(
          "flex min-h-screen flex-col md:ml-64",
          fullHeight ? "h-screen overflow-hidden pb-16 md:pb-0" : "pb-24 md:pb-0",
        )}
      >
        <EmployerTopNav />
        <div
          className={cn(
            fullHeight
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : "flex-1 p-margin-mobile md:p-margin-desktop",
          )}
        >
          {children}
        </div>

        {!fullHeight ? <SiteFooter className="mt-auto" /> : null}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-white/10 bg-primary-container p-4 md:hidden">
        {MOBILE_NAV.map((item) => {
          const active = navActive(item.key, item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex flex-col items-center",
                active ? "font-bold text-white" : "text-on-primary-container",
              )}
            >
              <Icon name={item.icon} filled={active} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
