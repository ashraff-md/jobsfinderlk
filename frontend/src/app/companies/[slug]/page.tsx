import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyProfilePage } from "@/components/pages/company-profile-page";
import { serverFetch } from "@/lib/api/server";
import type { CompanyDetail } from "@/lib/api/types";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/companies/[slug]"];

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await serverFetch<CompanyDetail>(`/companies/${slug}`);
  return { title: `${company?.name ?? slug} — ${meta.title}` };
}

export default async function CompanySlugPage({ params }: Props) {
  const { slug } = await params;
  const company = await serverFetch<CompanyDetail>(`/companies/${slug}`);
  if (!company) notFound();
  return <CompanyProfilePage company={company} />;
}
