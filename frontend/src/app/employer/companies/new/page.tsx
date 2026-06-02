import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterCompanyPage } from "@/components/pages/register-company-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/employer/companies/new"] ?? {
  title: "Register Company | JobsFinder.lk",
};

export const metadata: Metadata = {
  title: meta.title,
};

export default function NewCompanyPage() {
  return (
    <Suspense fallback={null}>
      <RegisterCompanyPage />
    </Suspense>
  );
}
