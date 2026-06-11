import { ContactPage } from "@/components/pages/contact-page";
import { JsonLd } from "@/components/seo/json-ld";
import { CONTACT_FAQS } from "@/lib/content/contact-faqs";
import { buildFaqJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with JobsFinder.lk. Reach our support team by phone, email, or contact form for help with jobs, postings, and billing.",
  path: "/contact",
});

export default function Page() {
  return (
    <>
      <JsonLd data={buildFaqJsonLd(CONTACT_FAQS)} />
      <ContactPage />
    </>
  );
}
