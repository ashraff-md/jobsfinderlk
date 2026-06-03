"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SiteFooter } from "@/components/layout/site-footer";
import { ApiError } from "@/lib/api/client";
import { dashboardPath, login } from "@/lib/api/auth";
import { authRoleFromSignInParam, isSafeReturnUrl, portalFromSignInRoleParam } from "@/lib/auth/portal";
import { LOGO_URL } from "@/lib/assets";
import { cn } from "@/lib/utils";

const BOARDROOM_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBd0O82qlrH0MPPwV_LkMoz6xJmd7vDhRySMAzr7OT9q66LcShR2mQchoZXGK0lyfesDvOCwg8F4Mw4cTeSx5j75rwCHddU7Lnhkie62qoP9LUGeAfZxdWOOUFcfF2HCtd_a7OoLw2TFKSMiDG-7_q3jKXSwzzrpmsP4xQultFaYBGysizJbzlTtlJktK9rA9yZTsndaHoH_62SM3FnLb7jwLvw2EhRpgKw3Y6E3iy6FbGJA2XBiHTkh5FwlWAjA7TOJbEq1am2Qy1d";

const TESTIMONIAL_AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDt3YgqjSHkeaSrFJv337MD0nCFtdMz92AFl4QWy-_MCFPj6lGAu6sRrnArc9dDIcdXB87hZJA6mzAUA7GwVPgxpF5Tz9cfkqEAFklZRG8THoJye5trxVEiOsUvdIEYK5bXIt4QvOND-PvsmhLnGk9Nbxbz9x_PilO2rrpGbVHEvifHZ0UJeckmlmUinbcIrwF2inhv0RrBgGSt2FD2Vho5WghGTcQkTVP9SWNxSDfvFFTbSK-3jHwL0o_X1tP2IJOxDQMAuA9koKSk";

const GOOGLE_ICON_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB1Sym7EpQkNnGLeHpNU8SSZoPdx-AhPWJvP1vQ_E2_bbWHN6zbB8MkHMPvHQPG1zpa4mWtDb8_IGsxUib4X7aIWzbwXSn56MY9RKJSQOkXyw-xedd-srEjWxY7Ns4FtSk5iuyd2L4jmAIlBjyWgvlkxo6b6LVzwBoFJ6kR6AgAUxC2htNZDsknFVCFfTM9HWWKE2b8U3wwBd1UaOOGE7ttfNNHPQK8t1gzLOqBA3KJKVR6gAUAgvpbyR2CLjuqCSJ1E398jryfbrfz";

type AuthRole = "seeker" | "recruiter";

function AuthBrandingPanel({ imageRef }: { imageRef: React.RefObject<HTMLImageElement | null> }) {
  return (
    <section className="relative hidden flex-col justify-between overflow-hidden bg-primary-container p-margin-desktop md:flex md:w-1/2">
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          alt="Modern executive boardroom overlooking a metropolitan skyline"
          className="h-full w-full object-cover opacity-60 transition-transform duration-300"
          src={BOARDROOM_URL}
        />
        <div className="auth-image-gradient absolute inset-0" />
      </div>
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="JobsFinder.lk Logo"
            className="h-10 w-auto brightness-0 invert"
            src={LOGO_URL}
          />
          <span className="font-headline-md text-headline-md font-extrabold text-on-primary">
            JobsFinder.lk
          </span>
        </Link>
        <p className="mt-stack-sm font-label-bold text-label-bold uppercase tracking-wider text-on-primary-container">
          Executive Talent Solutions
        </p>
      </div>
      <div className="relative z-10 max-w-md">
        <blockquote className="mb-stack-lg">
          <p className="font-headline-lg text-headline-lg leading-tight text-on-primary">
            &ldquo;The most precise match between visionaries and high-growth enterprises.&rdquo;
          </p>
          <footer className="mt-stack-md flex items-center gap-stack-sm">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Alex Silva"
                className="h-full w-full object-cover"
                src={TESTIMONIAL_AVATAR_URL}
              />
            </div>
            <div>
              <p className="font-label-bold text-label-bold text-on-primary">Alex Silva</p>
              <p className="font-label-sm text-label-sm text-on-primary-container">
                Executive Candidate
              </p>
            </div>
          </footer>
        </blockquote>
      </div>
      <div className="relative z-10 max-w-sm opacity-80">
        <SiteFooter variant="compact" />
      </div>
    </section>
  );
}

export function AuthSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<AuthRole>("seeker");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boardroomRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (portalFromSignInRoleParam(searchParams.get("role")) === "admin") {
      const returnUrl = searchParams.get("returnUrl");
      const target = returnUrl
        ? `/admin/login?returnUrl=${encodeURIComponent(returnUrl)}`
        : "/admin/login";
      router.replace(target);
      return;
    }
    setRole(authRoleFromSignInParam(searchParams.get("role")));
  }, [searchParams, router]);

  useEffect(() => {
    const img = boardroomRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      if (!img) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      img.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const data = await login(email, password);
      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl && isSafeReturnUrl(returnUrl, data.user.role)) {
        router.push(returnUrl);
      } else {
        router.push(dashboardPath(data.user.role));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const emailPlaceholder = role === "seeker" ? "seeker@jobsfinder.lk" : "hr@wso2.com";

  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-background font-body-md text-on-surface selection:bg-secondary-fixed selection:text-on-secondary-fixed md:flex-row">
      <AuthBrandingPanel imageRef={boardroomRef} />

      <section className="flex flex-1 flex-col items-center justify-center bg-surface-container-lowest p-margin-mobile md:p-margin-desktop">
        <div className="w-full max-w-[440px] space-y-stack-lg">
          <div className="mb-stack-lg flex flex-col items-center md:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="JobsFinder.lk Logo" className="h-10 w-auto" src={LOGO_URL} />
              <span className="font-headline-md text-headline-md font-extrabold text-primary">
                JobsFinder.lk
              </span>
            </Link>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Executive Recruitment
            </p>
          </div>

          <header className="space-y-stack-sm">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Welcome back</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Sign in to your professional workspace to manage applications and discover elite
              roles.
            </p>
          </header>

          <div className="flex rounded-xl bg-surface-container p-1">
            <button
              type="button"
              onClick={() => setRole("seeker")}
              className={cn(
                "flex-1 rounded-lg py-stack-sm font-label-bold text-label-bold transition-all duration-300",
                role === "seeker"
                  ? "bg-secondary text-on-secondary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={cn(
                "flex-1 rounded-lg py-stack-sm font-label-bold text-label-bold transition-all duration-300",
                role === "recruiter"
                  ? "bg-secondary text-on-secondary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              Recruiter
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-md text-on-error-container">
              {error}
            </div>
          )}

          <form className="space-y-stack-md" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="font-label-bold text-label-bold text-on-surface" htmlFor="email">
                Work Email
              </label>
              <div className="group relative">
                <Icon
                  name="mail"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary"
                />
                <input
                  className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-4 font-body-md outline-none transition-colors focus:border-secondary focus:ring-0"
                  id="email"
                  name="email"
                  key={emailPlaceholder}
                  placeholder={emailPlaceholder}
                  required
                  type="email"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-label-bold text-label-bold text-on-surface" htmlFor="password">
                  Password
                </label>
                <Link
                  href="#"
                  className="font-label-sm text-label-sm text-secondary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="group relative">
                <Icon
                  name="lock"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary"
                />
                <input
                  className="w-full rounded-lg border border-outline-variant bg-white py-3 pl-10 pr-12 font-body-md outline-none transition-colors focus:border-secondary focus:ring-0"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-stack-sm py-2">
              <input
                className="h-5 w-5 rounded border-outline-variant text-secondary focus:ring-secondary"
                id="remember-device"
                type="checkbox"
              />
              <label
                className="select-none font-body-md text-body-md text-on-surface-variant"
                htmlFor="remember-device"
              >
                Remember this device for 30 days
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-4 font-label-bold text-label-bold text-on-primary shadow-sm transition-all hover:bg-on-surface-variant active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="space-y-stack-md">
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-outline-variant" />
              <span className="mx-4 flex-shrink font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                or continue with
              </span>
              <div className="flex-grow border-t border-outline-variant" />
            </div>
            <div className="grid grid-cols-2 gap-stack-md">
              <button
                type="button"
                className="flex items-center justify-center gap-stack-sm rounded-lg border border-outline-variant px-4 py-3 transition-all hover:bg-surface-container"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Google" className="h-5 w-5" src={GOOGLE_ICON_URL} />
                <span className="font-label-bold text-label-bold text-on-surface">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-stack-sm rounded-lg border border-outline-variant px-4 py-3 transition-all hover:bg-surface-container"
              >
                <svg className="h-5 w-5 fill-[#0077b5]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="font-label-bold text-label-bold text-on-surface">LinkedIn</span>
              </button>
            </div>
          </div>

          <footer className="pt-stack-sm text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              New to JobsFinder?{" "}
              <Link href="/auth/sign-up" className="font-label-bold text-secondary hover:underline">
                Create an account
              </Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
