import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyProfilePage } from "@/components/pages/company-profile-page";
import { JsonLd } from "@/components/seo/json-ld";
import { serverFetch } from "@/lib/api/server";
import type { CompanyDetail } from "@/lib/api/types";
import {
  buildBreadcrumbJsonLd,
  buildOrganizationCompanyJsonLd,
} from "@/lib/seo/json-ld";
import { buildCompanyMetadata } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/seo/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await serverFetch<CompanyDetail>(`/companies/${slug}`);
  if (!company) return { title: "Company Not Found" };
  return buildCompanyMetadata(company);
}

export default async function CompanySlugPage({ params }: Props) {
  const { slug } = await params;
  const company = await serverFetch<CompanyDetail>(`/companies/${slug}`);
  if (!company) notFound();

  const siteUrl = getSiteUrl();

  return (
    <>
      <JsonLd
        data={[
          buildOrganizationCompanyJsonLd(company, siteUrl),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Companies", path: "/companies" },
            { name: company.name, path: `/companies/${company.slug}` },
          ]),
        ]}
      />
      <CompanyProfilePage company={company} />
    </>
  );
}
