import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage, type LegalPolicy } from "@/components/pages/legal-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

const VALID_POLICIES: LegalPolicy[] = ["privacy", "terms", "cookies"];

const POLICY_TITLES: Record<LegalPolicy, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  cookies: "Cookie Policy",
};

const POLICY_DESCRIPTIONS: Record<LegalPolicy, string> = {
  privacy:
    "Learn how JobsFinder.lk collects, uses, and protects your personal data under Sri Lanka's PDPA.",
  terms:
    "Read the Terms of Service governing your use of JobsFinder.lk as a job seeker or employer.",
  cookies:
    "Understand how JobsFinder.lk uses cookies and similar technologies on our website.",
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
  const description = POLICY_DESCRIPTIONS[key] ?? "Legal information for JobsFinder.lk.";
  return buildPageMetadata({
    title,
    description,
    path: `/legal/${policy}`,
  });
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
