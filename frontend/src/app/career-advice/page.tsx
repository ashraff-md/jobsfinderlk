import type { Metadata } from "next";
import { CareerAdvicePage } from "@/components/pages/career-advice-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/career-advice"];

export const metadata: Metadata = {
  title: `${meta.title} | JobsFinder.lk`,
  description: "Career advice blog and professional resources.",
};

export default function Page() {
  return <CareerAdvicePage />;
}
