import {
  checkGovernmentOrganizationDuplicates,
  createGovernmentOrganization,
} from "@/lib/api/government-organizations";
import type { GovernmentOrganizationType } from "@/lib/government-organizations/constants";

export async function resolveGovernmentOrganizationId(options: {
  organizationId?: string;
  search: string;
  excludeOrganizationId?: string;
  defaultOrganizationType?: GovernmentOrganizationType;
}): Promise<string | undefined> {
  const selectedId = options.organizationId?.trim();
  if (selectedId) return selectedId;

  const name = options.search.trim();
  if (!name) return undefined;

  const matches = await checkGovernmentOrganizationDuplicates(name);
  const existing = matches.find((item) => item.id !== options.excludeOrganizationId);
  if (existing) return existing.id;

  const created = await createGovernmentOrganization({
    name,
    organizationType: options.defaultOrganizationType ?? "Other Government Institution",
  });
  return created.id;
}
