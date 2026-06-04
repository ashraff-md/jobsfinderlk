export const reviewedByAdminSelect = {
  select: {
    id: true,
    email: true,
    adminProfile: {
      select: { firstName: true, lastName: true },
    },
  },
} as const;
