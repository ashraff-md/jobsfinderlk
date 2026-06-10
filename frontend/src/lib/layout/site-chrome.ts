export function isPortalAppRoute(pathname: string): boolean {
  if (pathname === "/admin/login") return false;

  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/employer") ||
    pathname.startsWith("/admin")
  );
}

export function shouldShowRootSiteFooter(pathname: string): boolean {
  return !isPortalAppRoute(pathname);
}
