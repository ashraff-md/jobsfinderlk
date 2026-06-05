"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { verifyEmailToken } from "@/lib/api/verification";

export function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("This verification link is invalid.");
      return;
    }

    verifyEmailToken(token)
      .then((result) => {
        setState("success");
        setMessage(result.message);
        setEmail(result.email);
      })
      .catch((err) => {
        setState("error");
        setMessage(err instanceof ApiError ? err.message : "Verification failed.");
      });
  }, [token]);

  return (
    <div className="custom-scrollbar bg-background text-on-surface">
      <PublicHeader />

      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-margin-mobile py-16 md:px-margin-desktop">
        <div className="professional-card space-y-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
          {state === "loading" ? (
            <p className="text-body-md text-on-surface-variant">Verifying your email…</p>
          ) : null}

          {state === "success" ? (
            <>
              <div className="flex items-center gap-3 text-primary">
                <Icon name="mark_email_read" />
                <h1 className="text-headline-md text-on-surface">Email verified</h1>
              </div>
              <p className="text-body-md text-on-surface-variant">
                {email ? (
                  <>
                    <span className="font-label-bold text-on-surface">{email}</span> is now
                    verified.
                  </>
                ) : (
                  message
                )}
              </p>
              <Link
                href="/employer/jobs/new"
                className="inline-flex rounded-lg bg-primary px-6 py-3 font-label-bold text-on-primary"
              >
                Post a vacancy
              </Link>
            </>
          ) : null}

          {state === "error" ? (
            <>
              <div className="flex items-center gap-3 text-error">
                <Icon name="error" />
                <h1 className="text-headline-md text-on-surface">Verification failed</h1>
              </div>
              <p className="text-body-md text-on-surface-variant">{message}</p>
              <Link
                href="/employer/settings"
                className="inline-flex rounded-lg border border-primary px-6 py-3 font-label-bold text-primary"
              >
                Go to profile
              </Link>
            </>
          ) : null}
        </div>
      </main>

      <SiteFooter variant="dark" />
    </div>
  );
}
