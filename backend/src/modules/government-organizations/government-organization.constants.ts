export const GOVERNMENT_ORGANIZATION_TYPES = [
  'Ministry',
  'Department',
  'Authority',
  'Board',
  'Commission',
  'State Corporation',
  'State-Owned Enterprise',
  'Provincial Council',
  'Local Authority',
  'University',
  'Other Government Institution',
] as const;

export type GovernmentOrganizationType =
  (typeof GOVERNMENT_ORGANIZATION_TYPES)[number];

export const GOVERNMENT_ORG_INCLUDE = {
  parent: {
    select: {
      id: true,
      name: true,
      organizationType: true,
      shortName: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      email: true,
      adminProfile: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  _count: {
    select: { jobs: true },
  },
} as const;
