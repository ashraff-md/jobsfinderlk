import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/contact-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/contact"];

export const metadata: Metadata = {
  title: `${meta.title} | JobsFinder.lk`,
  description: "Contact form and support channels.",
};

export default function Page() {
  return <ContactPage />;
}
