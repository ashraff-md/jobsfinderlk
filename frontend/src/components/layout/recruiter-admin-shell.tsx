"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AdminPostJobTypeDialog } from "@/components/admin/admin-post-job-type-dialog";
import { LogoutLink } from "@/components/auth/logout-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { Icon } from "@/components/ui/icon";
import { getAccessToken, getProfile, getStoredUser } from "@/lib/api/auth";
import { LOGO_URL } from "@/lib/assets";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin", icon: "dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/admin/jobs", icon: "work", label: "Jobs", key: "jobs" },
  {
    href: "/admin/jobs/government",
    icon: "account_balance",
    label: "Government Postings",
    key: "government",
  },
  { href: "/admin/verifications", icon: "group", label: "Recruiters", key: "verifications" },
  {
    href: "/admin/platform-ads",
    icon: "campaign",
    label: "Platform Ads",
    key: "platform-ads",
  },
  { href: "/admin/companies", icon: "business", label: "Companies", key: "companies" },
  { href: "/admin/talent", icon: "person_search", label: "Talent Pool", key: "talent" },
  { href: "/admin/partners", icon: "handshake", label: "Partners", key: "partners" },
  { href: "/admin/revenue", icon: "payments", label: "Revenue", key: "revenue" },
  { href: "/admin/analytics", icon: "insights", label: "Analytics", key: "analytics" },
  { href: "/admin/settings", icon: "manage_accounts", label: "Profile", key: "settings" },
  { href: "/admin/governance", icon: "shield", label: "Governance", key: "governance" },
] as const;

export type AdminNavKey = (typeof ADMIN_NAV)[number]["key"];

type RecruiterAdminShellProps = {
  children: ReactNode;
  activeNav?: AdminNavKey;
  userName?: string;
  userTitle?: string;
  userAvatar?: string;
  showFooter?: boolean;
};

function isNavActive(pathname: string, key: string, href: string) {
  if (key === "dashboard") return pathname === "/admin";
  if (key === "jobs") {
    return (
      pathname.startsWith("/admin/jobs") &&
      !pathname.startsWith("/admin/jobs/government")
    );
  }
  if (key === "government") return pathname.startsWith("/admin/jobs/government");
  if (key === "companies") return pathname.startsWith("/admin/companies");
  if (key === "verifications") return pathname.startsWith("/admin/verifications");
  if (key === "platform-ads") return pathname.startsWith("/admin/platform-ads");
  if (key === "talent") return pathname.startsWith("/admin/talent");
  if (key === "settings") return pathname.startsWith("/admin/settings");
  if (key === "governance") return pathname.startsWith("/admin/governance");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function RecruiterAdminShell({
  children,
  activeNav,
  userName = "Admin User",
  userTitle = "Platform Administrator",
  userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBaui6OWDLzyR9wMBIBJUPcVrfygLZxud54Wb44qPIFKyLSyQIvPYrjfY2ksr8lillY3oVON4LoxLMGWxXAmH7lG3HU1j5ZvC2GrVYjGq_j_NiKNS4CrWOwKEXdzJ-iMDvXdLQK9KmpR3GXO00YMj8tAh2HSPzrgT51eZyY-4-qjzB5tMiDIODB4o_J06FIeQU50zlOIkGXqXnNd3s1J6A9fIh6fTX2lbEAp2qKg7UejY4W0aiM98ztub_YGzt-b5NkxAqnmMIov6JC",
  showFooter = true,
}: RecruiterAdminShellProps) {
  const pathname = usePathname();
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState(userName);
  const [displayTitle, setDisplayTitle] = useState(userTitle);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored?.email) return;

    const applyStored = () => {
      setDisplayName(stored.email.split("@")[0] ?? userName);
      if (stored.role === "ADMIN") setDisplayTitle("Administrator");
      else if (stored.role === "MODERATOR") setDisplayTitle("Moderator");
    };

    applyStored();

    if (!getAccessToken()) return;
    if (stored.role !== "ADMIN" && stored.role !== "MODERATOR") return;

    getProfile()
      .then((profile) => {
        const full = [profile.adminProfile?.firstName, profile.adminProfile?.lastName]
          .filter(Boolean)
          .join(" ");
        if (full) setDisplayName(full);
        if (profile.role === "ADMIN") setDisplayTitle("Administrator");
        else if (profile.role === "MODERATOR") setDisplayTitle("Moderator");
      })
      .catch(() => applyStored());
  }, [userName]);

  const navActive = (key: AdminNavKey, href: string) =>
    activeNav ? activeNav === key : isNavActive(pathname, key, href);

  return (
    <div className="flex min-h-screen w-full bg-background font-body-md text-on-surface">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-on-primary-fixed-variant bg-primary-container md:flex">
        <div className="shrink-0 p-6 pb-4">
          <Link href="/admin" className="flex items-center gap-3">
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

          <div className="mt-6 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <Link href="/admin/settings" className="flex min-w-0 flex-1 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Administrator profile"
                className="h-10 w-10 rounded-lg object-cover"
                src={userAvatar}
              />
              <div className="min-w-0">
                <p className="truncate font-label-bold text-white">{displayName}</p>
                <p className="text-[10px] uppercase tracking-wider text-on-primary-container">
                  {displayTitle}
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6">
          <nav className="flex flex-col gap-1">
            {ADMIN_NAV.map((item) => {
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

          <Link
            href="/help"
            className="mt-2 flex items-center gap-3 rounded p-3 text-on-primary-container transition-colors hover:bg-white/5 hover:text-white"
          >
            <Icon name="help" />
            <span className="font-label-bold">Help Center</span>
          </Link>
        </div>

        <div className="shrink-0 border-t border-white/10 p-6 pt-4">
          <LogoutLink />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between gap-4 border-b border-outline-variant bg-surface px-4 py-stack-md md:px-margin-desktop">
          <h2 className="truncate text-headline-md font-extrabold text-on-surface">Recruiter Portal</h2>
          <div className="flex shrink-0 items-center gap-3 md:gap-4">
            <button
              type="button"
              className="text-on-surface-variant transition-colors hover:text-secondary"
              aria-label="Notifications"
            >
              <Icon name="notifications" />
            </button>
            <button
              type="button"
              className="hidden text-on-surface-variant transition-colors hover:text-secondary sm:block"
              aria-label="History"
            >
              <Icon name="history" />
            </button>
            <button
              type="button"
              onClick={() => setPostDialogOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 font-label-bold text-on-secondary transition-opacity hover:opacity-90"
            >
              <Icon name="add" className="text-[18px]" />
              <span className="hidden sm:inline">Post New Job</span>
            </button>
          </div>
        </header>

        <main className="custom-scrollbar flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-background">
          <div className="min-w-0 flex-1">{children}</div>
          {showFooter && <SiteFooter variant="dark" className="mt-20 shrink-0" />}
        </main>
      </div>

      <AdminPostJobTypeDialog open={postDialogOpen} onClose={() => setPostDialogOpen(false)} />
    </div>
  );
}

export function AdminPageCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 max-w-container-max px-4 py-stack-lg md:px-margin-desktop",
        className,
      )}
    >
      {children}
    </div>
  );
}
