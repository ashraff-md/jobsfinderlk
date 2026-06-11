export const BLOG_CATEGORIES = [
  'Leadership',
  'Interview Tips',
  'Salary Trends',
  'AI in Recruitment',
  'Career Advice',
  'Industry Trends',
  'Hiring Strategies',
  'Executive Search',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
