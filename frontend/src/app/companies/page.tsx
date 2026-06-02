import type { Metadata } from "next";
import { CompaniesDirectoryPage } from "@/components/pages/companies-directory-page";
import { serverFetch } from "@/lib/api/server";
import type { Company } from "@/lib/api/types";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/companies"];

export const metadata: Metadata = {
  title: meta.title,
};

export default async function CompaniesPage() {
  const companies = (await serverFetch<Company[]>("/companies")) ?? [];
  return <CompaniesDirectoryPage companies={companies} />;
}
