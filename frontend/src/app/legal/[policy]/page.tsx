import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage, type LegalPolicy } from "@/components/pages/legal-page";

const VALID_POLICIES: LegalPolicy[] = ["privacy", "terms", "cookies"];

const POLICY_TITLES: Record<LegalPolicy, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  cookies: "Cookie Policy",
};

export function generateStaticParams() {
  return VALID_POLICIES.map((policy) => ({ policy }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ policy: string }>;
}): Promise<Metadata> {
  const { policy } = await params;
  const key = policy as LegalPolicy;
  const title = POLICY_TITLES[key] ?? "Legal";
  return {
    title: `${title} | JobsFinder.lk`,
    description: "Legal and PDPA compliance pages.",
  };
}

function isLegalPolicy(value: string): value is LegalPolicy {
  return VALID_POLICIES.includes(value as LegalPolicy);
}

export default async function Page({
  params,
}: {
  params: Promise<{ policy: string }>;
}) {
  const { policy } = await params;
  if (!isLegalPolicy(policy)) {
    notFound();
  }
  return <LegalPage policy={policy} />;
}
