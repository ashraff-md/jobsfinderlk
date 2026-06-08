export const GOVERNMENT_ORGANIZATION_TYPES = [
  "Ministry",
  "Department",
  "Authority",
  "Board",
  "Commission",
  "State Corporation",
  "State-Owned Enterprise",
  "Provincial Council",
  "Local Authority",
  "University",
  "Other Government Institution",
] as const;

export type GovernmentOrganizationType = (typeof GOVERNMENT_ORGANIZATION_TYPES)[number];

export const SRI_LANKA_PROVINCES = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
] as const;

export type GovernmentOrganizationFormValues = {
  name: string;
  organizationType: GovernmentOrganizationType;
  parentOrganizationId: string;
  parentOrganizationSearch: string;
  shortName: string;
  description: string;
  website: string;
  email: string;
  contactNumber: string;
  headOfficeAddress: string;
  district: string;
  province: string;
};

export const DEFAULT_GOVERNMENT_ORGANIZATION_VALUES: GovernmentOrganizationFormValues = {
  name: "",
  organizationType: "Ministry",
  parentOrganizationId: "",
  parentOrganizationSearch: "",
  shortName: "",
  description: "",
  website: "",
  email: "",
  contactNumber: "",
  headOfficeAddress: "",
  district: "",
  province: "",
};
