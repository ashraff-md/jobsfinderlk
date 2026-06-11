import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { LOGO_URL } from "@/lib/assets";
import { cn } from "@/lib/utils";

type SiteFooterProps = {
  className?: string;
};

function FooterAttribution({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <p className={cn("text-label-sm leading-relaxed", className)}>
      © {year} JobsFinder.lk{" "}
      <span aria-hidden className="opacity-60">
        •
      </span>{" "}
      Designed and Operated by{" "}
      <a
        href="https://trexsolutions.co"
        target="_blank"
        rel="noopener noreferrer"
        className="text-inherit underline-offset-2 hover:underline"
      >
        T-Rex Solutions (Pvt) Ltd.
      </a>
    </p>
  );
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn("mt-auto shrink-0 bg-primary py-16 text-on-primary", className)}>
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-12 px-margin-mobile md:grid-cols-4 md:px-margin-desktop">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="JobsFinder.lk" className="h-8 w-auto brightness-0 invert" src={LOGO_URL} />
            <span className="text-xl font-extrabold">JobsFinder.lk</span>
          </div>
          <p className="text-sm text-on-primary-container">
            Sri Lanka&apos;s premier executive recruitment ecosystem.
          </p>
          <div className="flex gap-4">
            <a
              className="flex h-10 w-10 items-center justify-center rounded bg-white/10 text-on-primary transition-all hover:bg-white/20"
              href="#"
              aria-label="Website"
            >
              <Icon name="public" className="text-[20px]" />
            </a>
            <a
              className="flex h-10 w-10 items-center justify-center rounded bg-white/10 text-on-primary transition-all hover:bg-white/20"
              href="#"
              aria-label="Community"
            >
              <Icon name="group" className="text-[20px]" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-extrabold uppercase tracking-widest">For Seekers</h4>
          <ul className="space-y-2 text-sm text-on-primary-container">
            <li>
              <Link href="/jobs" className="hover:text-white">
                Browse Jobs
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/internships" className="hover:text-white">
                Internships
              </Link>
            </li>
            <li>
              <Link href="/career-advice" className="hover:text-white">
                Career Advice
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-extrabold uppercase tracking-widest">For Employers</h4>
          <ul className="space-y-2 text-sm text-on-primary-container">
            <li>
              <Link href="/employer/jobs/new" className="hover:text-white">
                Post a Job
              </Link>
            </li>
            <li>
              <Link href="/employer" className="hover:text-white">
                Recruiter Dashboard
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-white">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/companies" className="hover:text-white">
                Companies
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-extrabold uppercase tracking-widest">Support</h4>
          <ul className="space-y-2 text-sm text-on-primary-container">
            <li>
              <Link href="/help" className="hover:text-white">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-white">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:text-white">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-container-max border-t border-white/10 px-margin-mobile pt-8 md:px-margin-desktop">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <FooterAttribution className="text-xs text-on-primary-container" />
          <div className="flex flex-wrap justify-center gap-6 text-xs text-on-primary-container">
            <Link href="/legal/terms" className="hover:text-on-primary">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="hover:text-on-primary">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** @deprecated Use SiteFooter */
export const PublicFooter = SiteFooter;
