import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/public-header";

type PublicPageLayoutProps = {
  children: ReactNode;
};

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="flex flex-1 flex-col bg-background text-on-background">
      <PublicHeader />
      {children}
    </div>
  );
}
