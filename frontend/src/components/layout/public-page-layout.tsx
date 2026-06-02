import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { PublicHeader } from "@/components/layout/public-header";

type PublicPageLayoutProps = {
  children: ReactNode;
  footerVariant?: "light" | "dark";
};

export function PublicPageLayout({
  children,
  footerVariant = "dark",
}: PublicPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-on-background">
      <PublicHeader />
      {children}
      <SiteFooter variant={footerVariant} />
    </div>
  );
}
