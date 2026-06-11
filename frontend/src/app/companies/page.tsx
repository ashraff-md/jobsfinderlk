import { CompaniesDirectoryPage } from "@/components/pages/companies-directory-page";
import { serverFetch } from "@/lib/api/server";
import type { Company } from "@/lib/api/types";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Companies Hiring in Sri Lanka",
  description:
    "Explore verified employers on JobsFinder.lk. Browse company profiles and discover open roles across Sri Lanka.",
  path: "/companies",
});

export default async function CompaniesPage() {
  const companies = (await serverFetch<Company[]>("/companies")) ?? [];
  return <CompaniesDirectoryPage initialCompanies={companies} />;
}
