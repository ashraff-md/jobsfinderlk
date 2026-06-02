export const COMPANY_TYPES = [
  "Private",
  "Startup",
  "Agency",
  "Government",
  "Small business",
] as const;

export const COMPANY_TYPE_LABELS: Record<(typeof COMPANY_TYPES)[number], string> = {
  Private: "Private",
  Startup: "Startup",
  Agency: "Agency",
  Government: "Government",
  "Small business": "Small business",
};
