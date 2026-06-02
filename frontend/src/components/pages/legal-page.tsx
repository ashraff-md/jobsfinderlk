import Link from "next/link";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type LegalPolicy = "privacy" | "terms" | "cookies";

const POLICY_NAV: { id: LegalPolicy; label: string; icon: string }[] = [
  { id: "terms", label: "Terms of Service", icon: "gavel" },
  { id: "privacy", label: "Privacy Policy", icon: "security" },
  { id: "cookies", label: "Cookie Policy", icon: "cookie" },
];

type LegalPageProps = {
  policy: LegalPolicy;
};

function TermsContent() {
  return (
    <>
      <h1 className="mb-stack-lg font-headline-xl text-headline-xl text-primary">Terms of Service</h1>
      <div className="space-y-stack-lg leading-relaxed text-on-surface-variant">
        <div>
          <h3 className="mb-stack-sm font-headline-md text-headline-md text-on-surface">
            1. Acceptance of Terms
          </h3>
          <p className="font-body-md text-body-md">
            By accessing or using JobsFinder.lk, you agree to be bound by these Terms of Service. If
            you do not agree to all of these terms, do not use our services. These terms constitute a
            legally binding agreement between you and JobsFinder.lk regarding your use of our
            recruitment platform.
          </p>
        </div>
        <div>
          <h3 className="mb-stack-sm font-headline-md text-headline-md text-on-surface">
            2. User Accounts
          </h3>
          <p className="mb-stack-sm font-body-md text-body-md">
            To access certain features of the platform, you must create an account. You are
            responsible for maintaining the confidentiality of your account credentials and for all
            activities that occur under your account.
          </p>
          <ul className="list-disc space-y-2 pl-5 font-body-md text-body-md">
            <li>You must provide accurate and complete information.</li>
            <li>You must be at least 18 years of age.</li>
            <li>One person may only maintain one account.</li>
          </ul>
        </div>
        <div className="rounded-lg border-l-4 border-secondary bg-surface-container p-stack-md">
          <p className="font-label-bold text-label-bold italic text-primary">
            Important Notice: We reserve the right to suspend or terminate accounts that violate our
            community guidelines or provide fraudulent documentation.
          </p>
        </div>
        <div>
          <h3 className="mb-stack-sm font-headline-md text-headline-md text-on-surface">
            3. Employer Responsibilities
          </h3>
          <p className="font-body-md text-body-md">
            Employers posting jobs are responsible for ensuring that all listings comply with local
            labor laws, non-discrimination policies, and industry standards. JobsFinder.lk does not
            guarantee the quality or truthfulness of any job listing or the suitability of any
            candidate.
          </p>
        </div>
      </div>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <h1 className="mb-stack-lg font-headline-xl text-headline-xl text-primary">Privacy Policy</h1>
      <div className="space-y-stack-lg leading-relaxed text-on-surface-variant">
        <div>
          <h3 className="mb-stack-sm font-headline-md text-headline-md text-on-surface">
            1. Data Collection
          </h3>
          <p className="font-body-md text-body-md">
            We collect information that you provide directly to us when you create an account, upload
            a resume, or communicate with potential employers. This includes your name, contact
            information, work history, and educational background.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-stack-md py-stack-sm md:grid-cols-2">
          <div className="rounded border border-outline-variant p-stack-md">
            <h4 className="mb-1 font-label-bold text-label-bold text-on-surface">Personal Data</h4>
            <p className="text-label-sm">
              Identifiers like name, email, and social profiles used for authentication and profile
              building.
            </p>
          </div>
          <div className="rounded border border-outline-variant p-stack-md">
            <h4 className="mb-1 font-label-bold text-label-bold text-on-surface">Usage Data</h4>
            <p className="text-label-sm">
              Technical data including IP addresses, browser types, and interaction patterns on the
              site.
            </p>
          </div>
        </div>
        <div>
          <h3 className="mb-stack-sm font-headline-md text-headline-md text-on-surface">
            2. Use of Information
          </h3>
          <p className="font-body-md text-body-md">
            Your data is used to provide, maintain, and improve our services, including matching you
            with relevant job opportunities and facilitating communication with employers.
          </p>
        </div>
        <div>
          <h3 className="mb-stack-sm font-headline-md text-headline-md text-on-surface">
            3. Data Sharing
          </h3>
          <p className="font-body-md text-body-md">
            We do not sell your personal data. We share your information with employers only when you
            explicitly apply for a position or set your profile to &quot;Public.&quot;
          </p>
        </div>
      </div>
    </>
  );
}

function CookiesContent() {
  return (
    <>
      <h1 className="mb-stack-lg font-headline-xl text-headline-xl text-primary">Cookie Policy</h1>
      <div className="space-y-stack-lg leading-relaxed text-on-surface-variant">
        <p className="font-body-md text-body-md">
          This Cookie Policy explains how JobsFinder.lk uses cookies and similar technologies to
          recognize you when you visit our website. It explains what these technologies are and why we
          use them.
        </p>
        <table className="mt-stack-md w-full border-collapse border border-outline-variant">
          <thead>
            <tr className="bg-surface-container">
              <th className="border border-outline-variant p-stack-md text-left font-label-bold">
                Type
              </th>
              <th className="border border-outline-variant p-stack-md text-left font-label-bold">
                Purpose
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-outline-variant p-stack-md">Essential Cookies</td>
              <td className="border border-outline-variant p-stack-md">
                Required for technical reasons for our platform to operate.
              </td>
            </tr>
            <tr>
              <td className="border border-outline-variant p-stack-md">Performance Cookies</td>
              <td className="border border-outline-variant p-stack-md">
                To help us understand how visitors use our site.
              </td>
            </tr>
            <tr>
              <td className="border border-outline-variant p-stack-md">Functional Cookies</td>
              <td className="border border-outline-variant p-stack-md">
                To remember choices you make (like your username).
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <h3 className="mb-stack-sm font-headline-md text-headline-md text-on-surface">
            Managing Cookies
          </h3>
          <p className="font-body-md text-body-md">
            You can set or amend your web browser controls to accept or refuse cookies. If you choose
            to reject cookies, you may still use our website, though your access to some functionality
            may be restricted.
          </p>
        </div>
      </div>
    </>
  );
}

function PolicyContent({ policy }: { policy: LegalPolicy }) {
  switch (policy) {
    case "terms":
      return <TermsContent />;
    case "privacy":
      return <PrivacyContent />;
    case "cookies":
      return <CookiesContent />;
  }
}

export function LegalPage({ policy }: LegalPageProps) {
  return (
    <PublicPageLayout>
      <main className="min-h-screen pt-20">
        <div className="mx-auto max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
            <aside className="md:col-span-3">
              <div className="sticky top-28 rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md">
                <div className="mb-stack-lg px-stack-sm">
                  <h2 className="mb-1 font-headline-md text-headline-md text-primary">Legal Center</h2>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Last Updated: Oct 24, 2023
                  </p>
                </div>
                <nav className="flex flex-col gap-stack-sm">
                  {POLICY_NAV.map((item) => {
                    const active = policy === item.id;
                    return (
                      <Link
                        key={item.id}
                        href={`/legal/${item.id}`}
                        className={cn(
                          "flex items-center gap-stack-md px-stack-md py-3 font-label-bold text-label-bold transition-all",
                          active
                            ? "rounded bg-secondary text-on-secondary"
                            : "rounded-lg text-on-surface-variant hover:bg-surface-container",
                        )}
                      >
                        <Icon name={item.icon} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-stack-lg border-t border-outline-variant px-stack-sm pt-stack-lg">
                  <p className="mb-stack-sm font-label-sm text-label-sm text-on-surface-variant">
                    Need help?
                  </p>
                  <a
                    href="mailto:legal@jobsfinder.lk"
                    className="flex items-center gap-1 font-label-bold text-label-bold text-secondary hover:underline"
                  >
                    <Icon name="mail" className="!text-[18px]" />
                    Contact Legal Team
                  </a>
                </div>
              </div>
            </aside>

            <article className="rounded-lg border border-outline-variant bg-surface-container-lowest p-10 md:col-span-9">
              <PolicyContent policy={policy} />
            </article>
          </div>
        </div>
      </main>
    </PublicPageLayout>
  );
}
