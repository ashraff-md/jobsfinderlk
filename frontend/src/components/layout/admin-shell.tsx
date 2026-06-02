"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { LOGO_URL } from "@/lib/assets";
import { cn } from "@/lib/utils";

const HUB_NAV = [
  { href: "/admin", icon: "dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/admin/users", icon: "group", label: "Users", key: "users" },
  { href: "/admin/jobs", icon: "work", label: "Jobs", key: "jobs" },
  { href: "/admin/moderation", icon: "gavel", label: "Moderation", key: "moderation" },
  { href: "/admin/settings", icon: "settings", label: "Settings", key: "settings" },
] as const;

const EXECUTIVE_NAV = [
  { href: "/admin/dashboard", icon: "dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/admin/talent", icon: "group", label: "Talent Pool", key: "talent" },
  { href: "/admin/partners", icon: "business", label: "Partners", key: "partners" },
  { href: "/admin/roles", icon: "work", label: "Executive Roles", key: "roles" },
  { href: "/admin/revenue", icon: "payments", label: "Revenue", key: "revenue" },
  { href: "/admin/analytics", icon: "psychology", label: "AI Analytics", key: "analytics" },
  { href: "/admin/governance", icon: "settings", label: "Governance", key: "governance" },
] as const;

const EXECUTIVE_MOBILE_NAV = [
  { href: "/admin/dashboard", icon: "dashboard", label: "Home", key: "dashboard" },
  { href: "/admin/talent", icon: "group", label: "Talent", key: "talent" },
  { href: "/admin/partners", icon: "business", label: "Clients", key: "partners" },
  { href: "/admin/analytics", icon: "psychology", label: "AI", key: "analytics" },
  { href: "/admin/governance", icon: "settings", label: "System", key: "governance" },
] as const;

type AdminVariant = "hub" | "executive";

type AdminShellProps = {
  children: ReactNode;
  variant?: AdminVariant;
  activeNav?: string;
  userName?: string;
  userTitle?: string;
  userAvatar?: string;
  showHeader?: boolean;
  fullHeight?: boolean;
};

function navItems(variant: AdminVariant) {
  return variant === "executive" ? EXECUTIVE_NAV : HUB_NAV;
}

function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/dashboard") return pathname === "/admin/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  children,
  variant = "hub",
  activeNav,
  userName = "Alex Chen",
  userTitle = "Platform Lead",
  userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAkgqQelegL5KfD_1asj_TDXxZQBgbEdAjtrXPbn0fD5j9VS1s3ku5yd-_fpXqMLC5pdqk-4JfkpkTxR9PbldYzR4EAY_TH90v1qTcXxkQjLF8fDSEKYSIHpWaZ7epjdiU-3u5XmPlP_nhYY-nzLrws9wamW2OkHem7LF9jWCCzJXX2Wn67_Auf7ZYofdLgtR0XWDLKel2SmN6_o9ztgkq5V6TE8FhAFraVNWu90N5hq4_ybOGCE4VY0Q9__1X3tv8dWP0OtYktcEKW",
  showHeader = true,
  fullHeight = true,
}: AdminShellProps) {
  const pathname = usePathname();
  const items = navItems(variant);
  const mobileItems = variant === "executive" ? EXECUTIVE_MOBILE_NAV : HUB_NAV.slice(0, 4);

  const linkActive = (key: string, href: string) =>
    activeNav ? activeNav === key : isNavActive(pathname, href);

  const sidebarActiveClass =
    variant === "executive"
      ? "bg-primary-container text-white"
      : "translate-x-1 bg-secondary text-on-secondary";

  return (
    <div className={cn("flex bg-background text-on-surface", fullHeight && "h-screen overflow-hidden")}>
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-outline-variant md:flex",
          variant === "executive"
            ? "fixed left-0 top-0 z-50 h-screen w-64 gap-stack-sm bg-surface-bright p-gutter"
            : "h-full w-64 bg-surface-container-lowest p-stack-md",
        )}
      >
        <div className={variant === "executive" ? "mb-8" : "mb-stack-lg"}>
          {variant === "executive" ? (
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="JobsFinder.lk Logo" className="h-8 w-auto" src={LOGO_URL} />
            </Link>
          ) : (
            <span className="text-headline-md font-extrabold text-primary">JobsFinder.lk</span>
          )}

          {variant === "executive" && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="User profile picture" className="h-10 w-10 rounded-full object-cover" src={userAvatar} />
              <div className="overflow-hidden">
                <p className="truncate font-label-bold">{userName}</p>
                <p className="truncate text-[11px] font-medium text-on-surface-variant">{userTitle}</p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const active = linkActive(item.key, item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 transition-all",
                  active
                    ? sidebarActiveClass
                    : "text-on-surface-variant hover:bg-surface-container-high",
                )}
              >
                <Icon name={item.icon} filled={active && variant === "hub"} />
                <span className="font-label-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-outline-variant pt-4">
          {variant === "hub" ? (
            <>
              <div className="flex items-center gap-3 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="User Profile Avatar"
                  className="h-10 w-10 rounded-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuANPiUj_n1q_-fxIzF9h1wcZHgF5esX21Nug9tAvqVgjy1l95ckVYWatYrymgi7gJua0qsYQrv2U4cQTKsRurEQMRVV8VpVaCOrLuiXk9Wj39PA6J4i-q_hROtA3PHbPmig3atg9mu-QUdN-RyJp6NDFgA5hGusjw2IHGm1VKZWVNIddGm8GikrCTZC5NHrSGSxIeaTTK10FFuDD1IEqBs_5bj3qy48pRx_zS9luTHl3JI50E_YVAHjAmBKCtHLlZTaYiSMaeLdXv2m"
                />
                <div>
                  <p className="font-label-bold">Alex Silva</p>
                  <p className="text-label-sm text-on-surface-variant">Platform Admin</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-lg border border-primary py-2 font-label-bold text-primary transition-colors hover:bg-surface-container"
              >
                Career Consultation
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="mb-4 w-full rounded-lg bg-primary py-2.5 font-bold text-label-bold text-on-primary transition-all hover:opacity-90"
              >
                Upgrade Tier
              </button>
              <Link
                href="/help"
                className="flex items-center gap-3 px-4 py-2 text-on-surface-variant transition-all hover:text-primary"
              >
                <Icon name="help" />
                <span className="font-label-bold">Support</span>
              </Link>
              <Link
                href="/auth/sign-in"
                className="flex items-center gap-3 px-4 py-2 text-error transition-all hover:opacity-80"
              >
                <Icon name="logout" />
                <span className="font-label-bold">Sign Out</span>
              </Link>
            </>
          )}
        </div>
      </aside>

      <main
        className={cn(
          "relative flex min-w-0 flex-1 flex-col overflow-hidden",
          variant === "executive" && "md:ml-64",
        )}
      >
        {showHeader && (
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-6 md:h-20 md:px-margin-desktop">
            <div className="flex flex-1 items-center gap-stack-lg">
              {variant === "hub" ? (
                <div className="relative hidden lg:block">
                  <Icon
                    name="search"
                    className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant"
                  />
                  <input
                    type="text"
                    placeholder="Global system search..."
                    className="w-80 rounded-lg bg-surface-container-low py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-secondary"
                  />
                </div>
              ) : (
                <div className="relative hidden max-w-md flex-1 sm:block">
                  <Icon
                    name="search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                  />
                  <input
                    type="text"
                    placeholder="Search executive database..."
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-body-md transition-all focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {variant === "hub" ? (
                <>
                  <div className="flex animate-pulse items-center gap-2 rounded-full bg-error-container px-3 py-1 text-on-error-container">
                    <Icon name="report" className="text-[18px]" />
                    <span className="font-label-bold text-label-sm">3 High Risks Alerts</span>
                  </div>
                  <Link
                    href="/employer/jobs/new"
                    className="rounded bg-primary px-4 py-2 font-label-bold text-on-primary transition-transform active:scale-95"
                  >
                    Post a Job
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="relative rounded-full p-2 transition-all hover:bg-surface-container-low"
                  >
                    <Icon name="chat_bubble" className="text-on-surface-variant" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-secondary" />
                  </button>
                  <button
                    type="button"
                    className="relative rounded-full p-2 transition-all hover:bg-surface-container-low"
                  >
                    <Icon name="notifications" className="text-on-surface-variant" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-error" />
                  </button>
                  <div className="mx-2 h-8 w-px bg-outline-variant" />
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-4 py-2 font-bold text-label-bold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
                  >
                    New Requisition
                  </button>
                </>
              )}
            </div>
          </header>
        )}

        <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", fullHeight && "custom-scrollbar")}>
          {children}
        </div>
      </main>

      {variant === "executive" && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-outline-variant bg-white px-4 shadow-lg md:hidden">
          {mobileItems.map((item) => {
            const active = linkActive(item.key, item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1",
                  active ? "font-bold text-primary" : "text-on-surface-variant",
                )}
              >
                <Icon name={item.icon} filled={active} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
