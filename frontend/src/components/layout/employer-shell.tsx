"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { SiteFooter } from "@/components/layout/site-footer";
import { LOGO_URL } from "@/lib/assets";
import { cn } from "@/lib/utils";

const SIDEBAR_NAV = [
  { href: "/employer", icon: "dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/employer/applications", icon: "description", label: "Applications", key: "applications" },
  { href: "/employer/jobs", icon: "work", label: "Job Listings", key: "listings" },
  { href: "/employer/settings", icon: "settings", label: "Settings", key: "settings" },
] as const;

const MOBILE_NAV = [
  { href: "/employer", icon: "dashboard", label: "Home", key: "dashboard" },
  { href: "/employer/applications", icon: "description", label: "Applications", key: "applications" },
  { href: "/employer/jobs", icon: "work", label: "Listings", key: "listings" },
  { href: "/employer/settings", icon: "settings", label: "Settings", key: "settings" },
] as const;

type EmployerNavKey = (typeof SIDEBAR_NAV)[number]["key"];

type EmployerShellProps = {
  children: ReactNode;
  activeNav?: EmployerNavKey;
  userName?: string;
  userTitle?: string;
  userAvatar?: string;
  fullHeight?: boolean;
  showFooter?: boolean;
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
  if (key === "settings") {
    return pathname.startsWith("/employer/settings");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function EmployerShell({
  children,
  activeNav,
  userName = "Alex Thompson",
  userTitle = "Premium Member",
  userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCQH7H2wmG7YUMqctDa4qd2OLickv61G0wiqZ11wTPLV4rPj9ewDglttOi590KUiab97n9bfRrzmAGv-_MSW4ZT96XOymKst1emBUf8YExZnVBCHdlcRAVFJsfvvbTbOAu7mNGDE8KNE7Dd2FfFrKhjlNGeanUjqL8otzfSXNtdQcLZ7zcIWZF3ZvLobh6-CUKeYkx6b-OOSKYbTOCJoyg_dJ0ETqjj_EgXynC7VTnRfRE277i-AVdw_QWy0kNk6vadkHo5oLeq1oZP",
  fullHeight = false,
  showFooter = true,
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="User profile picture"
            className="h-10 w-10 rounded-lg object-cover"
            src={userAvatar}
          />
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
            Upgrade to Pro
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 p-2 text-on-primary-container transition-colors hover:text-white"
          >
            <Icon name="help" />
            <span className="font-label-bold">Help Center</span>
          </Link>
          <Link
            href="/auth/sign-in"
            className="flex items-center gap-3 p-2 text-on-primary-container transition-colors hover:text-error"
          >
            <Icon name="logout" />
            <span className="font-label-bold">Logout</span>
          </Link>
        </div>
      </aside>

      <main
        className={cn(
          "min-h-screen md:ml-64",
          fullHeight ? "flex h-screen flex-col overflow-hidden pb-16 md:pb-0" : "pb-24 md:pb-0",
        )}
      >
        <div
          className={cn(
            fullHeight
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : "p-margin-mobile md:p-margin-desktop",
          )}
        >
          {children}
        </div>
        {showFooter && !fullHeight && <SiteFooter variant="dark" className="mt-20" />}
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
