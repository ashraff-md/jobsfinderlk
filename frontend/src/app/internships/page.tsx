import type { Metadata } from "next";
import { InternshipsPage } from "@/components/pages/internships-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/internships"];

export const metadata: Metadata = {
  title: `${meta.title} | JobsFinder.lk`,
  description: "Internship and graduate opportunities for students and fresh graduates.",
};

export default function Page() {
  return <InternshipsPage />;
}
