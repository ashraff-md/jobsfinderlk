import type { Metadata } from "next";
import { SeekerProfilePage } from "@/components/pages/seeker-profile-page";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/dashboard/profile"];

export const metadata: Metadata = {
  title: meta.title,
};

export default function ProfilePage() {
  return <SeekerProfilePage />;
}
