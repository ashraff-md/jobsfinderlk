export const BLOG_CATEGORIES = [
  "Leadership",
  "Interview Tips",
  "Salary Trends",
  "AI in Recruitment",
  "Career Advice",
  "Industry Trends",
  "Hiring Strategies",
  "Executive Search",
] as const;

export const BLOG_FILTER_CATEGORIES = ["All Insights", ...BLOG_CATEGORIES] as const;
