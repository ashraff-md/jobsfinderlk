import type { GovernmentOrganization } from "@/lib/api/types";
import {
  DEFAULT_GOVERNMENT_ORGANIZATION_VALUES,
  GOVERNMENT_ORGANIZATION_TYPES,
  type GovernmentOrganizationFormValues,
  type GovernmentOrganizationType,
} from "@/lib/government-organizations/constants";

function asOrganizationType(value: string): GovernmentOrganizationType {
  return (GOVERNMENT_ORGANIZATION_TYPES as readonly string[]).includes(value)
    ? (value as GovernmentOrganizationType)
    : "Other Government Institution";
}

export function governmentOrganizationToFormValues(
  org: GovernmentOrganization,
): GovernmentOrganizationFormValues {
  return {
    ...DEFAULT_GOVERNMENT_ORGANIZATION_VALUES,
    name: org.name,
    organizationType: asOrganizationType(org.organizationType),
    parentOrganizationId: org.parentOrganizationId ?? org.parent?.id ?? "",
    parentOrganizationSearch: org.parent?.name ?? "",
    shortName: org.shortName ?? "",
    description: org.description ?? "",
    website: org.website ?? "",
    email: org.email ?? "",
    contactNumber: org.contactNumber ?? "",
    headOfficeAddress: org.headOfficeAddress ?? "",
    district: org.district ?? "",
    province: org.province ?? "",
  };
}

export function buildGovernmentOrganizationPayload(
  form: GovernmentOrganizationFormValues,
  logoDataUrl?: string | null,
) {
  const parentOrganizationId = form.parentOrganizationId.trim() || undefined;

  return {
    name: form.name.trim(),
    organizationType: form.organizationType,
    ...(parentOrganizationId ? { parentOrganizationId } : {}),
    shortName: form.shortName.trim() || undefined,
    description: form.description.trim() || undefined,
    website: form.website.trim() || undefined,
    email: form.email.trim() || undefined,
    contactNumber: form.contactNumber.trim() || undefined,
    headOfficeAddress: form.headOfficeAddress.trim() || undefined,
    district: form.district.trim() || undefined,
    province: form.province.trim() || undefined,
    ...(logoDataUrl !== undefined ? { logoUrl: logoDataUrl || undefined } : {}),
  };
}

export function buildGovernmentOrganizationUpdatePayload(
  form: GovernmentOrganizationFormValues,
  logoDataUrl?: string | null,
) {
  const parentOrganizationId = form.parentOrganizationId.trim() || undefined;

  return {
    name: form.name.trim(),
    organizationType: form.organizationType,
    parentOrganizationId,
    shortName: form.shortName.trim() || undefined,
    description: form.description.trim() || undefined,
    website: form.website.trim() || undefined,
    email: form.email.trim() || undefined,
    contactNumber: form.contactNumber.trim() || undefined,
    headOfficeAddress: form.headOfficeAddress.trim() || undefined,
    district: form.district.trim() || undefined,
    province: form.province.trim() || undefined,
    ...(logoDataUrl !== undefined ? { logoUrl: logoDataUrl || undefined } : {}),
  };
}
