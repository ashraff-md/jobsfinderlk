import type { Metadata } from "next";
import { HelpPage } from "@/components/pages/help-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/help"];

export const metadata: Metadata = {
  title: `${meta.title} | JobsFinder.lk`,
  description: "Help center and support resources.",
};

export default function Page() {
  return <HelpPage />;
}
