"use client";

import { RegisterCompanyForm } from "@/components/companies/register-company-form";
import { PublicHeader } from "@/components/layout/public-header";
import { SiteFooter } from "@/components/layout/site-footer";

export function RegisterCompanyPage() {
  return (
    <div className="custom-scrollbar bg-background text-on-surface">
      <PublicHeader />

      <main className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <RegisterCompanyForm />
      </main>

      <SiteFooter variant="dark" />
    </div>
  );
}
