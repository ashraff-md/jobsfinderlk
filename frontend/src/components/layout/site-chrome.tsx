import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";

type SiteChromeProps = {
  children: ReactNode;
};

export function SiteChrome({ children }: SiteChromeProps) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
