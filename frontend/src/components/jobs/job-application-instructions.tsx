import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import type { Job } from "@/lib/api/types";

type JobApplicationInstructionsProps = {
  job: Job;
  className?: string;
};

function MethodBlock({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon name={icon} className="text-primary" />
        <h4 className="font-label-bold text-on-surface">{title}</h4>
      </div>
      <div className="text-body-md leading-relaxed text-on-surface-variant">{children}</div>
    </div>
  );
}

export function JobApplicationInstructions({ job, className }: JobApplicationInstructionsProps) {
  const methods = [
    job.applyViaRegisteredPost && job.registeredPostDetails?.trim(),
    job.applyViaEmail && job.applicationEmail?.trim(),
    job.applyViaExternalLink && job.applicationExternalUrl?.trim(),
    job.applyViaWalkIn && job.walkInDetails?.trim(),
    job.applyViaOneClick,
  ].filter(Boolean);

  if (methods.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="mb-6 border-l-4 border-secondary pl-4 text-2xl font-extrabold tracking-tight text-navy-deep md:text-[32px]">
        How to apply
      </h2>
      <div className="space-y-4">
        {job.applyViaRegisteredPost && job.registeredPostDetails?.trim() && (
          <MethodBlock icon="local_post_office" title="Registered post">
            <p className="whitespace-pre-wrap">{job.registeredPostDetails.trim()}</p>
          </MethodBlock>
        )}
        {job.applyViaEmail && job.applicationEmail?.trim() && (
          <MethodBlock icon="mail" title="Email">
            <a
              href={`mailto:${job.applicationEmail.trim()}`}
              className="font-label-bold text-primary hover:underline"
            >
              {job.applicationEmail.trim()}
            </a>
          </MethodBlock>
        )}
        {job.applyViaExternalLink && job.applicationExternalUrl?.trim() && (
          <MethodBlock icon="link" title="Online application">
            <Link
              href={job.applicationExternalUrl.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-label-bold text-primary hover:underline"
            >
              {job.applicationExternalUrl.trim()}
            </Link>
          </MethodBlock>
        )}
        {job.applyViaWalkIn && job.walkInDetails?.trim() && (
          <MethodBlock icon="directions_walk" title="Walk-in interview">
            <p className="whitespace-pre-wrap">{job.walkInDetails.trim()}</p>
          </MethodBlock>
        )}
        {job.applyViaOneClick && (
          <MethodBlock icon="touch_app" title="One-click apply">
            <p>Use the Apply button on this page to submit your application through JobsFinder.</p>
          </MethodBlock>
        )}
      </div>
    </section>
  );
}
