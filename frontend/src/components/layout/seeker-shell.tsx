"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { SiteFooter } from "@/components/layout/site-footer";
import { AVATAR_URL, LOGO_URL } from "@/lib/assets";
import { cn } from "@/lib/utils";

const SIDEBAR_NAV = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/dashboard/applications", icon: "description", label: "Applications", key: "applications" },
  { href: "/dashboard/saved", icon: "bookmark", label: "Saved Jobs", key: "saved" },
  { href: "/dashboard/profile", icon: "person", label: "Profile", key: "profile" },
  { href: "/dashboard/settings", icon: "settings", label: "Settings", key: "settings" },
] as const;

const MOBILE_NAV = [
  { href: "/dashboard", icon: "dashboard", label: "Home", key: "dashboard" },
  { href: "/dashboard/applications", icon: "description", label: "Applied", key: "applications" },
  { href: "/dashboard/saved", icon: "bookmark", label: "Saved", key: "saved" },
  { href: "/dashboard/profile", icon: "person", label: "Profile", key: "profile" },
  { href: "/dashboard/settings", icon: "settings", label: "Settings", key: "settings" },
] as const;

type SeekerNavKey = (typeof SIDEBAR_NAV)[number]["key"];

type SeekerShellProps = {
  children: ReactNode;
  activeNav?: SeekerNavKey;
  userName?: string;
  userTitle?: string;
  userAvatar?: string;
  showTopHeader?: boolean;
  fullHeight?: boolean;
  showFooter?: boolean;
};

function isActive(pathname: string, href: string, key?: SeekerNavKey) {
  if (key === "dashboard") return pathname === "/dashboard";
  if (key === "profile") return pathname.startsWith("/dashboard/profile");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SeekerShell({
  children,
  activeNav,
  userName = "Alex Silva",
  userTitle = "AI Readiness: 94%",
  userAvatar = AVATAR_URL,
  showTopHeader = true,
  fullHeight = false,
  showFooter = true,
}: SeekerShellProps) {
  const pathname = usePathname();

  const navActive = (key: SeekerNavKey, href: string) =>
    activeNav ? activeNav === key : isActive(pathname, href, key);

  return (
    <div className={cn("bg-background font-body-md text-on-surface", fullHeight && "h-screen overflow-hidden")}>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col gap-2 border-r border-on-primary-fixed-variant bg-primary-container p-6 md:flex">
        <div className="mb-10">
          <Link href="/dashboard" className="flex items-center gap-3">
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
        {showTopHeader && (
          <header className="sticky top-0 z-30 border-b border-outline-variant bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-full max-w-container-max items-center justify-between px-6 md:px-margin-desktop">
              <div className="relative hidden max-w-md flex-1 lg:block">
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                />
                <input
                  type="text"
                  placeholder="Search roles, companies..."
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-4 text-body-md text-on-surface outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="rounded-full p-2 text-outline transition-colors duration-200 hover:bg-surface-container-high hover:text-primary-container"
                >
                  <Icon name="notifications" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-2 text-outline transition-colors duration-200 hover:bg-surface-container-high hover:text-primary-container"
                >
                  <Icon name="chat_bubble" />
                </button>
                <div className="mx-2 h-8 w-px bg-outline-variant" />
                <Link href="/dashboard/profile">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="User profile avatar"
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-primary-container/10"
                    src={userAvatar}
                  />
                </Link>
              </div>
            </div>
          </header>
        )}

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
