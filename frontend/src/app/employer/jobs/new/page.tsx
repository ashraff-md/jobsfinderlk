import type { Metadata } from "next";
import { PostJobPage } from "@/components/pages/post-job-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/employer/jobs/new"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function NewJobPage() {
  return <PostJobPage />;
}
