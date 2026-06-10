"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { shouldShowRootSiteFooter } from "@/lib/layout/site-chrome";

type SiteChromeProps = {
  children: ReactNode;
};

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const showFooter = shouldShowRootSiteFooter(pathname);

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {showFooter ? <SiteFooter /> : null}
    </div>
  );
}
