import { AdminGovernmentOrganizationEditPage } from "@/components/pages/admin-government-organizations-page";

export const metadata = {
  title: "Edit Government Organization",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminGovernmentOrganizationEditRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminGovernmentOrganizationEditPage organizationId={id} />;
}
