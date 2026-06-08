import { parseGovernmentJobDescription } from "@/lib/jobs/government-job-mapper";

const bodyClass = "whitespace-pre-wrap font-body-lg leading-relaxed text-on-surface-variant";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 border-l-4 border-secondary pl-4 text-2xl font-extrabold tracking-tight text-navy-deep md:text-[32px]">
      {children}
    </h2>
  );
}

type GovernmentJobDescriptionSectionsProps = {
  description: string;
};

export function GovernmentJobDescriptionSections({
  description,
}: GovernmentJobDescriptionSectionsProps) {
  const parsed = parseGovernmentJobDescription(description);

  const hasStructuredContent =
    parsed.description || parsed.eligibilityCriteria;

  if (!hasStructuredContent) {
    return (
      <section>
        <SectionHeading>About this role</SectionHeading>
        <p className={bodyClass}>{description}</p>
      </section>
    );
  }

  return (
    <>
      {parsed.description && (
        <section>
          <SectionHeading>About this role</SectionHeading>
          <p className={bodyClass}>{parsed.description}</p>
        </section>
      )}

      {parsed.eligibilityCriteria && (
        <section>
          <SectionHeading>Eligibility Criteria</SectionHeading>
          <p className={bodyClass}>{parsed.eligibilityCriteria}</p>
        </section>
      )}
    </>
  );
}

export function GovernmentJobSalarySection({ description }: { description: string }) {
  const salaryScale = parseGovernmentJobDescription(description).salaryScale;
  if (!salaryScale) return null;

  return (
    <section>
      <SectionHeading>Salary</SectionHeading>
      <p className={bodyClass}>{salaryScale}</p>
    </section>
  );
}
