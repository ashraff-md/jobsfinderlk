"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getAccessToken, getStoredUser } from "@/lib/api/auth";
import {
  signInPath,
  userHasPortalAccess,
  type AuthPortal,
} from "@/lib/auth/portal";

type RequirePortalAuthProps = {
  portal: AuthPortal;
  children: ReactNode;
};

export function RequirePortalAuth({ portal, children }: RequirePortalAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const user = getStoredUser();
    const hasAccess = Boolean(token && userHasPortalAccess(user?.role, portal));

    if (!hasAccess) {
      router.replace(signInPath(portal, pathname));
      return;
    }

    setAllowed(true);
  }, [portal, pathname, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-body-md text-on-surface-variant">
        Checking your session…
      </div>
    );
  }

  return <>{children}</>;
}
