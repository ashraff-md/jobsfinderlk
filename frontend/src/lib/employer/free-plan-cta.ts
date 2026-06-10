import type { UserRole } from "@/lib/api/types";
import { signInPath } from "@/lib/auth/portal";

const POST_JOB_PATH = "/employer/jobs/new";

export function freePlanCta(
  isLoggedIn: boolean,
  role: UserRole | null | undefined,
): { href: string; label: string } {
  if (isLoggedIn && role === "EMPLOYER") {
    return { href: POST_JOB_PATH, label: "Post Your Free Listing" };
  }

  if (isLoggedIn && (role === "ADMIN" || role === "MODERATOR")) {
    return { href: "/admin/jobs/new", label: "Post a Job" };
  }

  if (isLoggedIn) {
    return {
      href: signInPath("employer", POST_JOB_PATH),
      label: "Activate Free Plan",
    };
  }

  const params = new URLSearchParams({
    role: "recruiter",
    returnUrl: POST_JOB_PATH,
  });

  return {
    href: `/auth/sign-up?${params.toString()}`,
    label: "Activate Free Plan",
  };
}
