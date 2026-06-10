const LOGO_A =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB6Y-QrW5phX6sGb80XeL_yZ3690aIM2mCobcx_O7R0FOijLIRl6CK0WNZ7_rjZKZokybJoEmtF3Jd0HCf-1pyJy5OV8KswkBi-jfYITmyDu_Eo1MFnA4VOpDVcVSxH4nMvPeaQXAg6WcUtRmp-2XnTk27JPDcnFpBs7DOfjcGL7j_MyB2tbEmT686pOmLBUxLsbdM3y3D7Gzf2RjtBDxWgQiJxhJYUbEJN-EPb823RxrLpOAtJg4c3GzP4lYHeKWRRkhR_ZwOWS55T";
const LOGO_B =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDqWslKRcNqIdWUrrjGbTvyos4grujrdmj8CDbJgaT-sAFL27dmG8uDCYCUk6paiQ8Bg6tgzdiKKwR7IWJFI-aa5BPNaVma352GwkcUMKvPmaHTWXEmblA-A3q4sjhvbT0Yoc0-c3Olagq6H6ckFJKiIhGBWX5y2GJ4RZ0IItS7Z8Ewzojd7gVmI6LwrYTjjKFT_qfqxN44RtGiep6v8bzQgp00kh4KLT-QNZfulQvCV-rb8VnE00Bq85n7SJQo0Y5Dqdc2E0U82e3_";
const LOGO_C =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCgkt8RcEt4ylmDEkhRug-GXORZlFyfaMcPLJOWzfsZ_SBFyc2y_7mfUbmxO7f0_AAU2RjxMD2FTHy8b8ken5bMqpbjI-XvOrU1sxIqFMXzQQVVeAcXyJRE9FXQvTlhUdjO93BIFRVJaAt4OCg93zw5alEfmMSzqwlZvAJTfbO6ArHP8QDrq1xrifW1EdqhhImGjboZP4olWVZpiqFXeph1AkH28KIVXRwH8XCk5AHdO6HYnf5tC_pPGr_N3x8A35gCtodj8mIGlig2";

export const FEATURED_JOB_BADGE = {
  fit: "bg-primary/5 text-primary border-primary/10",
  hot: "bg-secondary/10 text-secondary border-secondary/20",
  confidential: "bg-primary/5 text-primary border-primary/10",
  new: "bg-secondary/10 text-secondary border-secondary/20",
  sponsored: "bg-secondary/10 text-secondary border-secondary/20",
} as const;

export type FeaturedJobCardItem = {
  badge: string;
  badgeClass: string;
  logo: string;
  title: string;
  company: string;
  tags: string[];
  href?: string;
  sponsoredAdId?: string;
};

export const FEATURED_JOB_CARDS: FeaturedJobCardItem[] = [
  {
    badge: "98% Fit",
    badgeClass: FEATURED_JOB_BADGE.fit,
    logo: LOGO_A,
    title: "Chief Technology Officer",
    company: "WSO2 • Colombo (Hybrid)",
    tags: ["Executive", "Annual Equity"],
  },
  {
    badge: "Hot Role",
    badgeClass: FEATURED_JOB_BADGE.hot,
    logo: LOGO_B,
    title: "Head of Digital Strategy",
    company: "Dialog Axiata • Colombo 02",
    tags: ["Strategic Lead", "Full Benefits"],
  },
  {
    badge: "Confidential",
    badgeClass: FEATURED_JOB_BADGE.confidential,
    logo: LOGO_C,
    title: "Managing Director",
    company: "Sysco LABS • Colombo",
    tags: ["Board Level", "Relocation"],
  },
  {
    badge: "92% Fit",
    badgeClass: FEATURED_JOB_BADGE.fit,
    logo: LOGO_A,
    title: "VP of Engineering",
    company: "Virtusa • Colombo (Remote)",
    tags: ["Senior Leadership", "Stock Options"],
  },
  {
    badge: "New Listing",
    badgeClass: FEATURED_JOB_BADGE.new,
    logo: LOGO_B,
    title: "Chief Financial Officer",
    company: "Axiata Group • Colombo",
    tags: ["C-Suite", "Performance Bonus"],
  },
  {
    badge: "95% Fit",
    badgeClass: FEATURED_JOB_BADGE.fit,
    logo: LOGO_C,
    title: "General Manager — Apparel",
    company: "MAS Holdings • Avissawella",
    tags: ["Operations", "Global Travel"],
  },
  {
    badge: "Hot Role",
    badgeClass: FEATURED_JOB_BADGE.hot,
    logo: LOGO_A,
    title: "Director of Data & AI",
    company: "WSO2 • Colombo (Hybrid)",
    tags: ["Innovation Lead", "Research Budget"],
  },
  {
    badge: "Confidential",
    badgeClass: FEATURED_JOB_BADGE.confidential,
    logo: LOGO_B,
    title: "Head of Corporate Banking",
    company: "Dialog Finance • Colombo",
    tags: ["Financial Services", "Full Benefits"],
  },
  {
    badge: "91% Fit",
    badgeClass: FEATURED_JOB_BADGE.fit,
    logo: LOGO_C,
    title: "Chief Marketing Officer",
    company: "Virtusa • Hybrid",
    tags: ["Brand Strategy", "Annual Equity"],
  },
  {
    badge: "97% Fit",
    badgeClass: FEATURED_JOB_BADGE.fit,
    logo: LOGO_A,
    title: "Senior VP — Operations",
    company: "Sysco LABS • Colombo",
    tags: ["Scale-up", "Leadership Team"],
  },
  {
    badge: "New Listing",
    badgeClass: FEATURED_JOB_BADGE.new,
    logo: LOGO_B,
    title: "Head of Human Resources",
    company: "Axiata Group • Colombo",
    tags: ["People & Culture", "C-Suite Access"],
  },
  {
    badge: "94% Fit",
    badgeClass: FEATURED_JOB_BADGE.fit,
    logo: LOGO_C,
    title: "Regional Sales Director",
    company: "MAS Holdings • Colombo",
    tags: ["APAC Region", "Commission Plus"],
  },
  {
    badge: "Confidential",
    badgeClass: FEATURED_JOB_BADGE.confidential,
    logo: LOGO_B,
    title: "Chief Compliance Officer",
    company: "Dialog Axiata • Colombo",
    tags: ["Governance", "Regulatory"],
  },
  {
    badge: "93% Fit",
    badgeClass: FEATURED_JOB_BADGE.fit,
    logo: LOGO_A,
    title: "Product Director",
    company: "Virtusa • Hybrid",
    tags: ["Product Strategy", "Full Benefits"],
  },
  {
    badge: "Hot Role",
    badgeClass: FEATURED_JOB_BADGE.hot,
    logo: LOGO_C,
    title: "Supply Chain Director",
    company: "MAS Holdings • Katunayake",
    tags: ["Logistics", "Global Ops"],
  },
  {
    badge: "96% Fit",
    badgeClass: FEATURED_JOB_BADGE.fit,
    logo: LOGO_A,
    title: "Head of Cybersecurity",
    company: "WSO2 • Colombo (Hybrid)",
    tags: ["InfoSec", "Leadership"],
  },
  {
    badge: "New Listing",
    badgeClass: FEATURED_JOB_BADGE.new,
    logo: LOGO_B,
    title: "Commercial Director",
    company: "Axiata Group • Colombo",
    tags: ["Revenue Growth", "C-Suite Access"],
  },
  {
    badge: "90% Fit",
    badgeClass: FEATURED_JOB_BADGE.fit,
    logo: LOGO_C,
    title: "Executive Legal Counsel",
    company: "Sysco LABS • Colombo",
    tags: ["Legal", "Board Advisory"],
  },
  {
    badge: "99% Fit",
    badgeClass: FEATURED_JOB_BADGE.fit,
    logo: LOGO_A,
    title: "Chief Architect",
    company: "WSO2 • Remote",
    tags: ["Enterprise", "Annual Equity"],
  },
  {
    badge: "Hot Role",
    badgeClass: FEATURED_JOB_BADGE.hot,
    logo: LOGO_B,
    title: "VP Customer Experience",
    company: "Dialog Axiata • Colombo 02",
    tags: ["CX Strategy", "Full Benefits"],
  },
  {
    badge: "92% Fit",
    badgeClass: FEATURED_JOB_BADGE.fit,
    logo: LOGO_C,
    title: "Plant General Manager",
    company: "MAS Holdings • Biyagama",
    tags: ["Manufacturing", "Operations"],
  },
  {
    badge: "Confidential",
    badgeClass: FEATURED_JOB_BADGE.confidential,
    logo: LOGO_A,
    title: "Head of Analytics",
    company: "Virtusa • Colombo",
    tags: ["Data Science", "Stock Options"],
  },
  {
    badge: "95% Fit",
    badgeClass: FEATURED_JOB_BADGE.fit,
    logo: LOGO_B,
    title: "Corporate Treasurer",
    company: "Dialog Finance • Colombo",
    tags: ["Treasury", "Financial Services"],
  },
  {
    badge: "New Listing",
    badgeClass: FEATURED_JOB_BADGE.new,
    logo: LOGO_C,
    title: "Director of Partnerships",
    company: "Axiata Group • Hybrid",
    tags: ["Alliances", "Performance Bonus"],
  },
];

export const SPONSORED_JOB_CARDS: FeaturedJobCardItem[] = FEATURED_JOB_CARDS.slice(0, 3).map(
  (job) => ({
    ...job,
    badge: "Sponsored",
    badgeClass: FEATURED_JOB_BADGE.sponsored,
  }),
);

export const CARDS_PER_SLIDE = 8;
export const JOB_SLIDE_INTERVAL_MS = 3000;

export const JOB_CARD_SLIDES = Array.from({ length: 3 }, (_, index) =>
  FEATURED_JOB_CARDS.slice(index * CARDS_PER_SLIDE, index * CARDS_PER_SLIDE + CARDS_PER_SLIDE),
);
