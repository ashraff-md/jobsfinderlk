import type { ReactNode } from "react";
import Link from "next/link";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type LegalPolicy = "privacy" | "terms" | "cookies";

const LAST_UPDATED = "June 11, 2026";

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-stack-sm font-headline-md text-headline-md text-on-surface">{title}</h3>
      {children}
    </div>
  );
}

function LegalParagraph({ children }: { children: ReactNode }) {
  return <p className="font-body-md text-body-md">{children}</p>;
}

function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 font-body-md text-body-md">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

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
      <p className="mb-stack-lg font-body-md text-body-md text-on-surface-variant">
        Effective date: {LAST_UPDATED}
      </p>
      <div className="space-y-stack-lg leading-relaxed text-on-surface-variant">
        <LegalSection title="1. Agreement to Terms">
          <LegalParagraph>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the JobsFinder.lk
            website, applications, and related services (collectively, the &quot;Platform&quot;),
            operated by T-Rex Solutions (Pvt) Ltd. (&quot;JobsFinder,&quot; &quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;). By creating an account, browsing listings, posting
            jobs, applying for positions, or otherwise using the Platform, you agree to these Terms
            and our{" "}
            <Link href="/legal/privacy" className="text-secondary hover:underline">
              Privacy Policy
            </Link>
            . If you do not agree, you must not use the Platform.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="2. Definitions">
          <LegalList
            items={[
              '"Job Seeker" or "Candidate" means an individual who uses the Platform to search for employment, create a profile, upload a resume, or apply for jobs.',
              '"Employer" or "Recruiter" means an individual or organization that posts job vacancies, manages company profiles, reviews applications, or purchases recruitment-related services on the Platform.',
              '"User Content" means any information, text, images, resumes, job listings, company descriptions, or other materials you submit, post, or transmit through the Platform.',
              '"Paid Services" means fee-based offerings such as job listing packages, sponsored job placements, banner advertising, and other premium recruitment features.',
            ]}
          />
        </LegalSection>

        <LegalSection title="3. Eligibility">
          <LegalParagraph>
            You must be at least 18 years of age and legally capable of entering into binding
            contracts under the laws of Sri Lanka to use the Platform. By using the Platform, you
            represent that you meet these requirements. Employers must have authority to act on
            behalf of the organization they represent.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="4. Account Registration and Security">
          <LegalParagraph>
            Certain features require registration. You agree to provide accurate, current, and
            complete information and to keep your account details up to date. You are responsible
            for safeguarding your login credentials and for all activity under your account.
          </LegalParagraph>
          <LegalList
            items={[
              "You may maintain only one personal seeker account unless we authorize otherwise.",
              "You must promptly notify us of any unauthorized access or security breach.",
              "We may require email or phone verification before granting access to certain features.",
              "We reserve the right to refuse registration, reclaim usernames, or limit account creation at our discretion.",
            ]}
          />
        </LegalSection>

        <div className="rounded-lg border-l-4 border-secondary bg-surface-container p-stack-md">
          <p className="font-label-bold text-label-bold italic text-primary">
            Important: We may suspend or terminate accounts that provide false information, engage in
            fraudulent activity, violate these Terms, or compromise the integrity of the Platform.
          </p>
        </div>

        <LegalSection title="5. Description of Services">
          <LegalParagraph>
            JobsFinder.lk is an online recruitment platform connecting job seekers with employers in
            Sri Lanka and beyond. Services may include job search and filtering, profile and resume
            management, job applications, employer dashboards, company profiles, internship listings,
            career resources, blog content, and optional paid promotional features. We may modify,
            suspend, or discontinue any part of the Platform at any time.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="6. Job Seeker Terms">
          <LegalList
            items={[
              "You are responsible for the accuracy of your profile, resume, and application materials.",
              "When you apply for a job, your submitted information is shared with the relevant employer.",
              "We do not guarantee interviews, offers, or employment outcomes.",
              "You may save jobs, track applications, and manage privacy preferences through your account settings where available.",
            ]}
          />
        </LegalSection>

        <LegalSection title="7. Employer Terms">
          <LegalParagraph>
            Employers are solely responsible for the content and legality of their job postings,
            company profiles, and communications with candidates.
          </LegalParagraph>
          <LegalList
            items={[
              "Listings must be genuine vacancies and comply with applicable employment, anti-discrimination, and advertising laws.",
              "You may not request payment from candidates as a condition of application or employment unless clearly disclosed and lawful.",
              "You must handle candidate data lawfully and only for legitimate recruitment purposes.",
              "Company profile and branding content must not infringe third-party rights or misrepresent your organization.",
              "Jobs may be subject to review, approval, rejection, or removal by our moderation team.",
            ]}
          />
        </LegalSection>

        <LegalSection title="8. Applications and Communications">
          <LegalParagraph>
            The Platform facilitates connections between seekers and employers but is not a party to
            any employment relationship, contract, or negotiation. We do not screen candidates on
            behalf of employers or verify the accuracy of every listing. Communications sent through
            or in connection with the Platform are primarily between users; we are not responsible
            for off-platform interactions.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="9. Paid Services, Billing, and Refunds">
          <LegalParagraph>
            Certain features require payment. Prices, packages, and promotional terms are displayed
            at the time of purchase and may change prospectively. By purchasing Paid Services, you
            agree to pay all applicable fees and taxes.
          </LegalParagraph>
          <LegalList
            items={[
              "Promotional codes and discounts are subject to their stated terms and may be revoked if misused.",
              "Paid placements and advertising are subject to our content standards and approval process.",
              "Unless required by applicable law or expressly stated at purchase, fees are non-refundable once services are delivered or activated.",
              "We may suspend Paid Services for non-payment, chargebacks, or violations of these Terms.",
            ]}
          />
        </LegalSection>

        <LegalSection title="10. User Content and License">
          <LegalParagraph>
            You retain ownership of your User Content. By submitting User Content, you grant
            JobsFinder a worldwide, non-exclusive, royalty-free license to host, store, reproduce,
            display, distribute, and otherwise use that content solely to operate, promote, and
            improve the Platform and to fulfill the purpose for which you submitted it (for example,
            displaying your job listing or forwarding your application to an employer).
          </LegalParagraph>
          <LegalParagraph>
            You represent that you have all rights necessary to submit User Content and that it does
            not violate any law or third-party rights.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="11. Prohibited Conduct">
          <LegalParagraph>You agree not to:</LegalParagraph>
          <LegalList
            items={[
              "Post false, misleading, discriminatory, or unlawful job listings or profiles.",
              "Impersonate any person or entity or misrepresent your affiliation.",
              "Harvest, scrape, or systematically collect user data without authorization.",
              "Upload malware, spam, or content that is defamatory, obscene, or harassing.",
              "Circumvent security measures, access restrictions, or usage limits.",
              "Use the Platform for pyramid schemes, unsolicited marketing, or non-recruitment purposes.",
              "Interfere with the proper functioning of the Platform or other users' experience.",
            ]}
          />
        </LegalSection>

        <LegalSection title="12. Intellectual Property">
          <LegalParagraph>
            The Platform, including its design, software, logos, trademarks, and original content
            (excluding User Content), is owned by or licensed to T-Rex Solutions (Pvt) Ltd. and
            protected by intellectual property laws. You may not copy, modify, distribute, or create
            derivative works from our proprietary materials without prior written consent.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="13. Third-Party Links and Services">
          <LegalParagraph>
            The Platform may contain links to third-party websites, employer career pages, or
            services. We do not control and are not responsible for third-party content, policies, or
            practices. Your use of third-party services is at your own risk.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="14. Disclaimers">
          <LegalParagraph>
            THE PLATFORM IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS TO
            THE MAXIMUM EXTENT PERMITTED BY LAW. WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR
            IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE,
            OR FREE OF HARMFUL COMPONENTS, OR THAT ANY JOB LISTING, CANDIDATE, OR EMPLOYER IS
            ACCURATE OR SUITABLE.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="15. Limitation of Liability">
          <LegalParagraph>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, JOBSFINDER AND ITS DIRECTORS,
            OFFICERS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, DATA, GOODWILL,
            OR BUSINESS OPPORTUNITIES ARISING FROM YOUR USE OF THE PLATFORM. OUR TOTAL LIABILITY FOR
            ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE PLATFORM SHALL NOT EXCEED THE
            GREATER OF (A) THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM OR
            (B) LKR 10,000.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="16. Indemnification">
          <LegalParagraph>
            You agree to indemnify and hold harmless JobsFinder and T-Rex Solutions (Pvt) Ltd. from
            any claims, damages, losses, and expenses (including reasonable legal fees) arising from
            your use of the Platform, your User Content, your violation of these Terms, or your
            violation of any law or third-party rights.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="17. Suspension and Termination">
          <LegalParagraph>
            We may suspend or terminate your access to the Platform at any time, with or without
            notice, for conduct that we believe violates these Terms, poses a security risk, or is
            otherwise harmful. You may close your account at any time through your account settings
            or by contacting us. Provisions that by their nature should survive termination will
            remain in effect.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="18. Governing Law and Disputes">
          <LegalParagraph>
            These Terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka,
            without regard to conflict-of-law principles. Any dispute arising under these Terms shall
            be subject to the exclusive jurisdiction of the courts of Colombo, Sri Lanka, unless
            mandatory law requires otherwise.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="19. Changes to These Terms">
          <LegalParagraph>
            We may update these Terms from time to time. Material changes will be posted on this
            page with an updated effective date. Continued use of the Platform after changes take
            effect constitutes acceptance of the revised Terms.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="20. Contact">
          <LegalParagraph>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:legal@jobsfinder.lk" className="text-secondary hover:underline">
              legal@jobsfinder.lk
            </a>{" "}
            or visit our{" "}
            <Link href="/contact" className="text-secondary hover:underline">
              Contact page
            </Link>
            .
          </LegalParagraph>
          <LegalParagraph>
            JobsFinder.lk is designed and operated by T-Rex Solutions (Pvt) Ltd.
          </LegalParagraph>
        </LegalSection>
      </div>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <h1 className="mb-stack-lg font-headline-xl text-headline-xl text-primary">Privacy Policy</h1>
      <p className="mb-stack-lg font-body-md text-body-md text-on-surface-variant">
        Effective date: {LAST_UPDATED}
      </p>
      <div className="space-y-stack-lg leading-relaxed text-on-surface-variant">
        <LegalSection title="1. Introduction">
          <LegalParagraph>
            T-Rex Solutions (Pvt) Ltd., operating JobsFinder.lk (&quot;JobsFinder,&quot;
            &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), respects your privacy and is
            committed to protecting your personal data. This Privacy Policy explains how we collect,
            use, disclose, store, and safeguard information when you use our website, applications,
            and recruitment services (the &quot;Platform&quot;).
          </LegalParagraph>
          <LegalParagraph>
            This Policy is designed to comply with the Personal Data Protection Act No. 9 of 2022 of
            Sri Lanka (&quot;PDPA&quot;) and other applicable data protection laws. By using the
            Platform, you acknowledge that you have read and understood this Policy.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="2. Data Controller">
          <LegalParagraph>
            The data controller responsible for your personal data is T-Rex Solutions (Pvt) Ltd.,
            operator of JobsFinder.lk. For privacy-related inquiries, contact us at{" "}
            <a href="mailto:legal@jobsfinder.lk" className="text-secondary hover:underline">
              legal@jobsfinder.lk
            </a>
            .
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="3. Information We Collect">
          <LegalParagraph>
            We collect personal data that you provide directly, data generated through your use of
            the Platform, and limited data from third parties where permitted.
          </LegalParagraph>
          <div className="mt-stack-md grid grid-cols-1 gap-stack-md md:grid-cols-2">
            <div className="rounded border border-outline-variant p-stack-md">
              <h4 className="mb-1 font-label-bold text-label-bold text-on-surface">
                Account and identity data
              </h4>
              <p className="text-label-sm">
                Name, email address, phone number, password (stored in hashed form), account role,
                and verification status.
              </p>
            </div>
            <div className="rounded border border-outline-variant p-stack-md">
              <h4 className="mb-1 font-label-bold text-label-bold text-on-surface">
                Profile and career data
              </h4>
              <p className="text-label-sm">
                Resume or CV, headline, work history, education, skills, and other information you
                include in your seeker profile.
              </p>
            </div>
            <div className="rounded border border-outline-variant p-stack-md">
              <h4 className="mb-1 font-label-bold text-label-bold text-on-surface">
                Employer and company data
              </h4>
              <p className="text-label-sm">
                Company name, logo, description, industry, location, job listings, billing details,
                and recruiter contact information.
              </p>
            </div>
            <div className="rounded border border-outline-variant p-stack-md">
              <h4 className="mb-1 font-label-bold text-label-bold text-on-surface">
                Application and activity data
              </h4>
              <p className="text-label-sm">
                Jobs you view, save, or apply to; application status; communications related to
                recruitment; and employer review activity.
              </p>
            </div>
            <div className="rounded border border-outline-variant p-stack-md">
              <h4 className="mb-1 font-label-bold text-label-bold text-on-surface">
                Technical and usage data
              </h4>
              <p className="text-label-sm">
                IP address, browser type, device identifiers, pages visited, referral URLs, and
                interaction logs collected through cookies and similar technologies.
              </p>
            </div>
            <div className="rounded border border-outline-variant p-stack-md">
              <h4 className="mb-1 font-label-bold text-label-bold text-on-surface">
                Payment and transaction data
              </h4>
              <p className="text-label-sm">
                Purchase history, product selections, promo code usage, and payment confirmation
                details. Full payment card data is processed by our payment providers and is not
                stored by us.
              </p>
            </div>
          </div>
        </LegalSection>

        <LegalSection title="4. How We Use Your Information">
          <LegalParagraph>We use personal data to:</LegalParagraph>
          <LegalList
            items={[
              "Create and manage your account and authenticate your identity.",
              "Provide job search, application, and employer recruitment features.",
              "Share your application materials with employers when you apply for a position.",
              "Display company profiles, job listings, and promotional content.",
              "Process purchases of job listings, sponsored placements, and advertising services.",
              "Send service-related communications, including verification codes and account notices.",
              "Moderate content, detect fraud, and enforce our Terms of Service.",
              "Analyze usage to improve Platform performance, security, and user experience.",
              "Comply with legal obligations and respond to lawful requests.",
            ]}
          />
        </LegalSection>

        <LegalSection title="5. Legal Basis for Processing">
          <LegalParagraph>
            Under the PDPA and applicable law, we process personal data based on one or more of the
            following grounds:
          </LegalParagraph>
          <LegalList
            items={[
              "Your consent, such as when you create an account, submit a profile, or opt in to certain communications.",
              "Performance of a contract, such as providing the services you request or fulfilling a purchase.",
              "Legitimate interests, such as securing the Platform, preventing abuse, and improving our services, balanced against your rights.",
              "Legal obligation, where processing is required to comply with applicable law or regulatory requests.",
            ]}
          />
        </LegalSection>

        <LegalSection title="6. How We Share Information">
          <LegalParagraph>
            We do not sell your personal data. We may share information in the following
            circumstances:
          </LegalParagraph>
          <LegalList
            items={[
              "With employers when you apply for a job or otherwise choose to share your profile or contact details.",
              "With service providers who assist us with hosting, storage, email delivery, analytics, payment processing, and security, under contractual confidentiality obligations.",
              "With administrators and moderators for content review, fraud prevention, and platform operations.",
              "When required by law, court order, or government authority, or to protect the rights, safety, and security of JobsFinder, our users, or the public.",
              "In connection with a merger, acquisition, or sale of assets, subject to appropriate safeguards.",
            ]}
          />
          <LegalParagraph>
            Employers who receive your data are independent controllers or processors of that
            information and are responsible for handling it in accordance with their own privacy
            obligations and applicable law.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="7. Data Retention">
          <LegalParagraph>
            We retain personal data only for as long as necessary to fulfill the purposes described
            in this Policy, unless a longer retention period is required or permitted by law. When
            data is no longer needed, we delete or anonymize it using reasonable technical and
            organizational measures.
          </LegalParagraph>
          <LegalParagraph>
            Account and profile data is generally retained while your account is active. After
            account closure, we may retain limited information for legal, security, and dispute
            resolution purposes.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="8. Security">
          <LegalParagraph>
            We implement appropriate technical and organizational safeguards to protect personal
            data against unauthorized access, alteration, disclosure, or destruction. These measures
            include access controls, encryption in transit, secure authentication practices, and
            regular monitoring. No method of transmission or storage is completely secure, and we
            cannot guarantee absolute security.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="9. Your Rights">
          <LegalParagraph>
            Subject to applicable law, including the PDPA, you may have the right to:
          </LegalParagraph>
          <LegalList
            items={[
              "Request access to the personal data we hold about you.",
              "Request correction of inaccurate or incomplete data.",
              "Request deletion of your data, subject to legal and contractual limitations.",
              "Withdraw consent where processing is based on consent.",
              "Object to or restrict certain processing activities.",
              "Request data portability where technically feasible.",
            ]}
          />
          <LegalParagraph>
            To exercise these rights, contact{" "}
            <a href="mailto:legal@jobsfinder.lk" className="text-secondary hover:underline">
              legal@jobsfinder.lk
            </a>
            . We may need to verify your identity before responding. You also have the right to
            lodge a complaint with the relevant data protection authority in Sri Lanka.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="10. Cookies and Similar Technologies">
          <LegalParagraph>
            We use cookies and similar technologies to operate the Platform, remember your
            preferences, and understand how the site is used. For details on the types of cookies we
            use and how to manage them, see our{" "}
            <Link href="/legal/cookies" className="text-secondary hover:underline">
              Cookie Policy
            </Link>
            .
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="11. International Data Transfers">
          <LegalParagraph>
            Your data may be processed on servers located in Sri Lanka or in other countries where
            our service providers operate. Where personal data is transferred outside Sri Lanka, we
            take steps to ensure appropriate safeguards are in place as required by applicable law.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="12. Children&apos;s Privacy">
          <LegalParagraph>
            The Platform is not intended for individuals under 18 years of age. We do not knowingly
            collect personal data from children. If you believe we have collected data from a minor,
            please contact us and we will take steps to delete it.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="13. Marketing Communications">
          <LegalParagraph>
            We may send you newsletters, career tips, or promotional messages where permitted by law
            and your preferences. You may opt out of marketing emails at any time using the
            unsubscribe link in those messages or by contacting us. Service-related communications
            may still be sent even if you opt out of marketing.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="14. Changes to This Policy">
          <LegalParagraph>
            We may update this Privacy Policy from time to time. Material changes will be posted on
            this page with an updated effective date. We encourage you to review this Policy
            periodically.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="15. Contact Us">
          <LegalParagraph>
            For questions, requests, or complaints regarding this Privacy Policy or our data
            practices, contact:
          </LegalParagraph>
          <LegalParagraph>
            T-Rex Solutions (Pvt) Ltd. — JobsFinder.lk
            <br />
            Email:{" "}
            <a href="mailto:legal@jobsfinder.lk" className="text-secondary hover:underline">
              legal@jobsfinder.lk
            </a>
            <br />
            Website:{" "}
            <Link href="/contact" className="text-secondary hover:underline">
              jobsfinder.lk/contact
            </Link>
          </LegalParagraph>
        </LegalSection>
      </div>
    </>
  );
}

function CookiesContent() {
  return (
    <>
      <h1 className="mb-stack-lg font-headline-xl text-headline-xl text-primary">Cookie Policy</h1>
      <p className="mb-stack-lg font-body-md text-body-md text-on-surface-variant">
        Effective date: {LAST_UPDATED}
      </p>
      <div className="space-y-stack-lg leading-relaxed text-on-surface-variant">
        <LegalSection title="1. Introduction">
          <LegalParagraph>
            This Cookie Policy explains how T-Rex Solutions (Pvt) Ltd., operating JobsFinder.lk
            (&quot;JobsFinder,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), uses
            cookies and similar technologies when you visit or use our website and recruitment
            platform (the &quot;Platform&quot;). It should be read alongside our{" "}
            <Link href="/legal/privacy" className="text-secondary hover:underline">
              Privacy Policy
            </Link>
            , which describes how we handle personal data more broadly.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="2. What Are Cookies and Similar Technologies?">
          <LegalParagraph>
            Cookies are small text files placed on your device when you visit a website. They help
            websites function, remember preferences, and understand how visitors interact with
            content. We also use similar technologies such as local storage, session storage, pixels,
            and server logs that store or access information on your device for comparable purposes.
          </LegalParagraph>
          <LegalList
            items={[
              "Session cookies expire when you close your browser.",
              "Persistent cookies remain on your device until they expire or you delete them.",
              "First-party cookies are set by JobsFinder.lk.",
              "Third-party cookies are set by external services integrated into the Platform.",
            ]}
          />
        </LegalSection>

        <LegalSection title="3. How We Use Cookies">
          <LegalParagraph>
            We use cookies and similar technologies to operate the Platform securely, keep you signed
            in, remember your preferences, measure performance, and deliver relevant recruitment
            content. The table below summarizes the main categories we use.
          </LegalParagraph>
          <table className="mt-stack-md w-full border-collapse border border-outline-variant">
            <thead>
              <tr className="bg-surface-container">
                <th className="border border-outline-variant p-stack-md text-left font-label-bold">
                  Category
                </th>
                <th className="border border-outline-variant p-stack-md text-left font-label-bold">
                  Purpose
                </th>
                <th className="border border-outline-variant p-stack-md text-left font-label-bold">
                  Examples
                </th>
              </tr>
            </thead>
            <tbody className="text-label-sm">
              <tr>
                <td className="border border-outline-variant p-stack-md align-top font-label-bold text-on-surface">
                  Strictly Necessary
                </td>
                <td className="border border-outline-variant p-stack-md align-top">
                  Required for core Platform functionality, security, and network management. These
                  cannot be disabled without affecting how the site works.
                </td>
                <td className="border border-outline-variant p-stack-md align-top">
                  Authentication tokens, session identifiers, load-balancing, and fraud-prevention
                  signals.
                </td>
              </tr>
              <tr>
                <td className="border border-outline-variant p-stack-md align-top font-label-bold text-on-surface">
                  Functional
                </td>
                <td className="border border-outline-variant p-stack-md align-top">
                  Remember choices you make to provide a more personalized experience.
                </td>
                <td className="border border-outline-variant p-stack-md align-top">
                  Saved login state, language or display preferences, and recently viewed job filters.
                </td>
              </tr>
              <tr>
                <td className="border border-outline-variant p-stack-md align-top font-label-bold text-on-surface">
                  Analytics and Performance
                </td>
                <td className="border border-outline-variant p-stack-md align-top">
                  Help us understand how visitors use the Platform so we can improve speed,
                  navigation, and feature design.
                </td>
                <td className="border border-outline-variant p-stack-md align-top">
                  Page views, referral sources, error reports, and aggregated usage statistics.
                </td>
              </tr>
              <tr>
                <td className="border border-outline-variant p-stack-md align-top font-label-bold text-on-surface">
                  Advertising and Promotional
                </td>
                <td className="border border-outline-variant p-stack-md align-top">
                  Support measurement of sponsored job listings, banner campaigns, and promotional
                  placements on the Platform.
                </td>
                <td className="border border-outline-variant p-stack-md align-top">
                  Impression counts, click tracking, and rotation of featured or sponsored content.
                </td>
              </tr>
            </tbody>
          </table>
        </LegalSection>

        <LegalSection title="4. Cookies and Storage We May Set">
          <LegalParagraph>
            Depending on how you use the Platform, we may store the following types of information
            locally on your device through cookies or browser storage:
          </LegalParagraph>
          <LegalList
            items={[
              "Authentication data to keep you signed in and protect your account.",
              "User session data to maintain your active visit and security context.",
              "Preference data such as filters, saved searches, or UI settings where available.",
              "Operational data related to employer purchases or checkout flows during a session.",
              "Analytics identifiers to distinguish unique visits and measure Platform performance.",
            ]}
          />
          <LegalParagraph>
            We review and update the specific cookies and storage keys we use as the Platform evolves.
            The categories above reflect our current practices.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="5. Third-Party Cookies">
          <LegalParagraph>
            Some cookies are placed by third-party services that support our operations. These may
            include:
          </LegalParagraph>
          <LegalList
            items={[
              "Payment processors when you purchase job listings or advertising services.",
              "Infrastructure and hosting providers that deliver content and protect against abuse.",
              "Analytics or monitoring tools that help us measure reliability and usage trends.",
              "Embedded content or links to external employer websites, which may set their own cookies when you leave our Platform.",
            ]}
          />
          <LegalParagraph>
            Third parties are responsible for their own cookie practices. We encourage you to review
            their privacy and cookie policies before interacting with their services.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="6. Legal Basis">
          <LegalParagraph>
            We use strictly necessary cookies based on our legitimate interest in providing a secure
            and functional Platform, and where required, to perform our contract with you. Functional,
            analytics, and advertising cookies may rely on your consent or our legitimate interests,
            as permitted under the Personal Data Protection Act No. 9 of 2022 of Sri Lanka and other
            applicable law.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="7. Managing Your Preferences">
          <LegalParagraph>
            You can control cookies and similar technologies in several ways:
          </LegalParagraph>
          <LegalList
            items={[
              "Browser settings: Most browsers let you block, delete, or alert you about cookies. Refer to your browser's help documentation for instructions.",
              "Device settings: Mobile devices may offer additional controls for tracking or advertising identifiers.",
              "Clearing storage: You can clear cookies, local storage, and session storage through your browser. Doing so may sign you out and reset saved preferences.",
              "Opt-out tools: Where we use optional analytics or advertising technologies that support industry opt-out mechanisms, we will make those options available as we deploy them.",
            ]}
          />
          <LegalParagraph>
            If you disable strictly necessary cookies or clear authentication storage, parts of the
            Platform — including sign-in, job applications, and employer dashboards — may not function
            correctly.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="8. Do Not Track">
          <LegalParagraph>
            Some browsers transmit &quot;Do Not Track&quot; signals. Because there is no uniform
            industry standard for responding to these signals, we do not currently alter our
            practices solely based on a Do Not Track signal. You may still manage cookies through the
            controls described above.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="9. Data Retention">
          <LegalParagraph>
            Cookie lifetimes vary by purpose. Session cookies expire when you close your browser.
            Persistent cookies and stored tokens remain for a defined period or until you delete them.
            We configure retention periods to balance security, usability, and legal requirements.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="10. Changes to This Policy">
          <LegalParagraph>
            We may update this Cookie Policy from time to time to reflect changes in technology,
            regulation, or our practices. Material updates will be posted on this page with a revised
            effective date. Continued use of the Platform after changes take effect constitutes
            acceptance of the updated Policy.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="11. Contact Us">
          <LegalParagraph>
            If you have questions about our use of cookies or wish to exercise your privacy rights,
            contact us at{" "}
            <a href="mailto:legal@jobsfinder.lk" className="text-secondary hover:underline">
              legal@jobsfinder.lk
            </a>{" "}
            or visit our{" "}
            <Link href="/contact" className="text-secondary hover:underline">
              Contact page
            </Link>
            .
          </LegalParagraph>
          <LegalParagraph>
            JobsFinder.lk is designed and operated by T-Rex Solutions (Pvt) Ltd.
          </LegalParagraph>
        </LegalSection>
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
      <main className="min-h-screen">
        <div className="mx-auto max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop">
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
            <aside className="md:col-span-3">
              <div className="sticky top-28 rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-md">
                <div className="mb-stack-lg px-stack-sm">
                  <h2 className="mb-1 font-headline-md text-headline-md text-primary">Legal Center</h2>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Last Updated: {LAST_UPDATED}
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
