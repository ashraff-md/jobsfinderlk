import type { Metadata } from "next";
import { SeekerSavedJobsPage } from "@/components/pages/seeker-saved-jobs-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/dashboard/saved"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function SavedJobsPage() {
  return <SeekerSavedJobsPage />;
}
