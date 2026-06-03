import type { UserRole } from "@/lib/api/types";

export type AuthPortal = "seeker" | "employer" | "admin";

export type SignInRoleParam = "seeker" | "recruiter" | "admin";

const PORTAL_ROLES: Record<AuthPortal, UserRole[]> = {
  seeker: ["SEEKER"],
  employer: ["EMPLOYER"],
  admin: ["ADMIN", "MODERATOR"],
};

export function rolesForPortal(portal: AuthPortal): UserRole[] {
  return PORTAL_ROLES[portal];
}

export function portalForRole(role: UserRole): AuthPortal {
  if (role === "EMPLOYER") return "employer";
  if (role === "ADMIN" || role === "MODERATOR") return "admin";
  return "seeker";
}

export function userHasPortalAccess(role: UserRole | undefined, portal: AuthPortal): boolean {
  if (!role) return false;
  return rolesForPortal(portal).includes(role);
}

export function signInRoleParam(portal: AuthPortal): SignInRoleParam {
  if (portal === "seeker") return "seeker";
  if (portal === "employer") return "recruiter";
  return "admin";
}

export function portalFromSignInRoleParam(param: string | null): AuthPortal | null {
  if (param === "seeker") return "seeker";
  if (param === "recruiter") return "employer";
  if (param === "admin") return "admin";
  return null;
}

export function authRoleFromSignInParam(param: string | null): "seeker" | "recruiter" {
  return param === "recruiter" || param === "admin" ? "recruiter" : "seeker";
}

export function isSafeReturnUrl(url: string, role: UserRole): boolean {
  if (!url.startsWith("/") || url.startsWith("//")) return false;
  const portal = portalForRole(role);
  if (portal === "seeker") return url.startsWith("/dashboard");
  if (portal === "employer") return url.startsWith("/employer");
  return url.startsWith("/admin");
}

export function signInPath(portal: AuthPortal, returnUrl?: string): string {
  const params = new URLSearchParams({ role: signInRoleParam(portal) });
  if (returnUrl) params.set("returnUrl", returnUrl);
  return `/auth/sign-in?${params.toString()}`;
}
