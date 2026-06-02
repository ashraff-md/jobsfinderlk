import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { LOGO_URL } from "@/lib/assets";
import { cn } from "@/lib/utils";

type SiteFooterProps = {
  variant?: "light" | "dark" | "compact";
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

export function SiteFooter({ variant = "dark", className }: SiteFooterProps) {
  if (variant === "compact") {
    return (
      <footer className={cn("space-y-3", className)}>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-label-sm">
          <Link
            href="/legal/terms"
            className="font-label-bold text-on-primary-container transition-colors hover:text-on-primary"
          >
            Terms of Service
          </Link>
          <Link
            href="/legal/privacy"
            className="font-label-bold text-on-primary-container transition-colors hover:text-on-primary"
          >
            Privacy Policy
          </Link>
        </div>
        <FooterAttribution className="whitespace-nowrap text-label-sm text-on-primary-container" />
      </footer>
    );
  }

  if (variant === "light") {
    return (
      <footer className={cn("border-t border-outline-variant/30 bg-white pb-10 pt-20", className)}>
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <div className="mb-20 grid grid-cols-1 gap-16 md:grid-cols-4">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="JobsFinder.lk Logo" className="h-10 w-auto" src={LOGO_URL} />
                <span className="text-[22px] font-extrabold text-primary">JobsFinder.lk</span>
              </div>
              <p className="pr-10 text-body-md leading-relaxed text-on-surface-variant">
                Sri Lanka&apos;s premier executive recruitment ecosystem.
              </p>
              <div className="flex gap-4">
                <a
                  className="flex h-10 w-10 items-center justify-center rounded bg-primary/5 text-primary transition-all hover:bg-primary hover:text-white"
                  href="#"
                >
                  <Icon name="public" className="text-[20px]" />
                </a>
                <a
                  className="flex h-10 w-10 items-center justify-center rounded bg-primary/5 text-primary transition-all hover:bg-primary hover:text-white"
                  href="#"
                >
                  <Icon name="group" className="text-[20px]" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-8 text-xs font-extrabold uppercase tracking-widest text-primary">
                Solutions
              </h4>
              <ul className="space-y-4 text-sm font-label-bold">
                <li>
                  <Link href="/jobs" className="text-on-surface-variant transition-all hover:text-primary">
                    Executive Search
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/profile"
                    className="text-on-surface-variant transition-all hover:text-primary"
                  >
                    AI Talent Matching
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-on-surface-variant transition-all hover:text-primary">
                    Salary Benchmarking
                  </Link>
                </li>
                <li>
                  <Link href="/employer" className="text-on-surface-variant transition-all hover:text-primary">
                    Interim Management
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-8 text-xs font-extrabold uppercase tracking-widest text-primary">Company</h4>
              <ul className="space-y-4 text-sm font-label-bold">
                <li>
                  <Link
                    href="/career-advice"
                    className="text-on-surface-variant transition-all hover:text-primary"
                  >
                    Our Methodology
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="text-on-surface-variant transition-all hover:text-primary">
                    Partner Organizations
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="text-on-surface-variant transition-all hover:text-primary">
                    Ethics & Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-on-surface-variant transition-all hover:text-primary">
                    Global Network
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-xs font-extrabold uppercase tracking-widest text-primary">Briefing</h4>
              <p className="mb-6 text-xs leading-relaxed text-on-surface-variant">
                Stay updated with monthly executive market insights and salary reports.
              </p>
              <div className="flex border-b border-outline-variant py-2">
                <input
                  className="w-full border-none bg-transparent text-sm placeholder:text-outline focus:ring-0"
                  placeholder="Email address"
                  type="email"
                />
                <button type="button" className="px-2 text-sm font-extrabold text-primary">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-6 border-t border-outline-variant/10 pt-10 text-xs font-label-bold text-on-surface-variant/60 md:flex-row">
            <FooterAttribution className="text-center md:text-left" />
            <div className="flex gap-8">
              <Link href="/legal/terms" className="hover:text-primary">
                Terms of Engagement
              </Link>
              <Link href="/legal/privacy" className="hover:text-primary">
                Privacy Protocol
              </Link>
              <Link href="/legal/cookies" className="hover:text-primary">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn("mt-auto bg-primary py-16 text-on-primary", className)}>
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
            <Link href="/help" className="hover:text-on-primary">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** @deprecated Use SiteFooter */
export const PublicFooter = SiteFooter;
