export type ResumeExperience = {
  title: string;
  period: string;
  company: string;
  bullets: string[];
};

export type ResumeEducation = {
  title: string;
  school: string;
  period: string;
};

export type ResumeProfile = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  certifications: ResumeEducation[];
  skills: string[];
};

export const DEMO_RESUME_PROFILE: ResumeProfile = {
  fullName: "Alex Thompson",
  headline: "Senior Product Designer",
  email: "alex.t@jobsfinder.lk",
  phone: "+94 77 123 4567",
  location: "Colombo, Sri Lanka",
  website: "alexthompson.design",
  summary:
    "Visionary Senior Product Designer with over 8 years of experience in crafting high-impact digital ecosystems. Specialized in bridging the gap between complex business requirements and intuitive user experiences.",
  experience: [
    {
      title: "Senior Product Designer",
      period: "Jan 2021 — Present",
      company: "InnovateX Studio • Full-time",
      bullets: [
        "Architected and maintained a comprehensive design system utilized by 4 cross-functional squads.",
        "Led the redesign of the core dashboard, improving task completion rates by 25%.",
        "Mentored 3 junior designers and established new user research protocols.",
      ],
    },
    {
      title: "UI/UX Designer",
      period: "May 2018 — Dec 2020",
      company: "Nexus Digital • Full-time",
      bullets: [
        "Designed end-to-end mobile experiences for fintech applications with 1M+ monthly active users.",
        "Collaborated with stakeholders to translate business goals into high-fidelity prototypes.",
      ],
    },
  ],
  education: [
    {
      title: "BSc in Interactive Media",
      school: "University of Westminster",
      period: "2014 — 2018",
    },
  ],
  certifications: [
    {
      title: "Google UX Design Professional",
      school: "Coursera / Google",
      period: "Issued 2021",
    },
  ],
  skills: ["UI/UX Design", "Figma", "Design Systems", "Strategic Thinking", "Interaction Design"],
};
