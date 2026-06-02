export type ResumeThemeId =
  | "executive"
  | "minimalist"
  | "modern"
  | "classic"
  | "creative"
  | "corporate"
  | "elegant"
  | "horizon"
  | "slate"
  | "fresh";

export type ThemePreset = "executive" | "minimalist" | "modern";

export type ResumeTheme = {
  id: ResumeThemeId;
  name: string;
  description: string;
  preset: ThemePreset;
  preview: {
    accent: string;
    header: string;
    body: string;
  };
};

export const RESUME_THEMES: ResumeTheme[] = [
  {
    id: "executive",
    name: "Executive Premium",
    description: "Bold navy header, classic hierarchy",
    preset: "executive",
    preview: { accent: "#0a1133", header: "#12193b", body: "#f8f9ff" },
  },
  {
    id: "minimalist",
    name: "Minimalist Slate",
    description: "Clean type, subtle dividers",
    preset: "minimalist",
    preview: { accent: "#46464e", header: "#ffffff", body: "#f1f5f9" },
  },
  {
    id: "modern",
    name: "Modern Professional",
    description: "Blue accent, contemporary layout",
    preset: "modern",
    preview: { accent: "#0051d5", header: "#eff4ff", body: "#ffffff" },
  },
  {
    id: "classic",
    name: "Classic Serif",
    description: "Timeless black-and-ivory look",
    preset: "executive",
    preview: { accent: "#1c1917", header: "#292524", body: "#fafaf9" },
  },
  {
    id: "creative",
    name: "Creative Violet",
    description: "Distinctive purple for design roles",
    preset: "modern",
    preview: { accent: "#6d28d9", header: "#f5f3ff", body: "#ffffff" },
  },
  {
    id: "corporate",
    name: "Corporate Teal",
    description: "Calm teal for finance & consulting",
    preset: "executive",
    preview: { accent: "#0f766e", header: "#134e4a", body: "#f0fdfa" },
  },
  {
    id: "elegant",
    name: "Elegant Gold",
    description: "Refined dark header with gold accent",
    preset: "minimalist",
    preview: { accent: "#b45309", header: "#1c1917", body: "#fffbeb" },
  },
  {
    id: "horizon",
    name: "Horizon Sunset",
    description: "Warm orange for marketing & sales",
    preset: "modern",
    preview: { accent: "#ea580c", header: "#fff7ed", body: "#ffffff" },
  },
  {
    id: "slate",
    name: "Slate Mono",
    description: "Monochrome for technical profiles",
    preset: "minimalist",
    preview: { accent: "#334155", header: "#0f172a", body: "#f8fafc" },
  },
  {
    id: "fresh",
    name: "Fresh Growth",
    description: "Green accent for ops & sustainability",
    preset: "modern",
    preview: { accent: "#15803d", header: "#ecfdf5", body: "#ffffff" },
  },
];

export const DEFAULT_RESUME_THEME: ResumeThemeId = "executive";

export function getResumeTheme(id: ResumeThemeId) {
  return RESUME_THEMES.find((t) => t.id === id) ?? RESUME_THEMES[0];
}
