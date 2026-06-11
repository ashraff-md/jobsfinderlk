import type { ReactNode } from "react";
import { PRIVATE_ROBOTS_METADATA } from "@/lib/seo/metadata";

export const metadata = PRIVATE_ROBOTS_METADATA;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
