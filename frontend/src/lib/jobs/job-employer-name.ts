type JobEmployerSource = {
  company: { name: string; logoUrl?: string | null };
  requestedCompanyName?: string | null;
  jobSourceType?: string | null;
  governmentOrganization?: { name: string; logoUrl?: string | null } | null;
};

export function getJobEmployerName(job: JobEmployerSource): string {
  if (job.jobSourceType === "GOVERNMENT") {
    if (job.governmentOrganization?.name?.trim()) {
      return job.governmentOrganization.name.trim();
    }
    if (job.requestedCompanyName?.trim()) {
      return job.requestedCompanyName.trim();
    }
  }
  return job.company.name;
}

export function getJobEmployerLogo(job: JobEmployerSource): string | null | undefined {
  if (job.jobSourceType === "GOVERNMENT" && job.governmentOrganization?.logoUrl) {
    return job.governmentOrganization.logoUrl;
  }
  return job.company.logoUrl;
}

export function getJobLocationLabel(job: {
  location?: string | null;
  city?: string | null;
}): string {
  return job.location?.trim() || job.city?.trim() || "Sri Lanka";
}
