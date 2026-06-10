"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { EmployerFocusedLayout } from "@/components/layout/employer-focused-layout";
import { EmployerShell } from "@/components/layout/employer-shell";
import { getAccessToken, getProfile } from "@/lib/api/auth";

type EmployerPortalLayoutProps = {
  children: ReactNode;
};

function useEmployerFullHeight(pathname: string) {
  return pathname.includes("/applicants");
}

function useEmployerFocusedPage(pathname: string) {
  return pathname === "/employer/jobs/new";
}

export function EmployerPortalLayout({ children }: EmployerPortalLayoutProps) {
  const pathname = usePathname();
  const fullHeight = useEmployerFullHeight(pathname);
  const focusedPage = useEmployerFocusedPage(pathname);
  const [userName, setUserName] = useState("Recruiter");
  const [userTitle, setUserTitle] = useState("Recruiter");
  const [userAvatar, setUserAvatar] = useState<string | undefined>();

  const loadProfile = useCallback(async () => {
    if (!getAccessToken()) return;

    try {
      const profile = await getProfile();
      const link = profile.employerUsers?.[0];
      const fullName = link?.fullName?.trim();
      const title = link?.title?.trim();
      const emailName = profile.email.split("@")[0];

      setUserName(fullName || emailName || "Recruiter");
      setUserTitle(title || "Recruiter");
      setUserAvatar(link?.photoUrl ?? undefined);
    } catch {
      // Keep defaults when profile cannot be loaded.
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const handleProfileUpdated = () => {
      void loadProfile();
    };

    window.addEventListener("employer-profile-updated", handleProfileUpdated);
    return () => window.removeEventListener("employer-profile-updated", handleProfileUpdated);
  }, [loadProfile]);

  if (focusedPage) {
    return <EmployerFocusedLayout>{children}</EmployerFocusedLayout>;
  }

  return (
    <EmployerShell
      userName={userName}
      userTitle={userTitle}
      userAvatar={userAvatar}
      fullHeight={fullHeight}
    >
      {children}
    </EmployerShell>
  );
}
