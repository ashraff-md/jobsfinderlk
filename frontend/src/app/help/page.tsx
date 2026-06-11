import { HelpPage } from "@/components/pages/help-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Help Center",
  description:
    "Find answers about job seeking, recruiting, billing, and technical support on JobsFinder.lk.",
  path: "/help",
});

export default function Page() {
  return <HelpPage />;
}
