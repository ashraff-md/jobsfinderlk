import type { CSSProperties } from "react";
import type { ResumeProfile } from "@/lib/resume/resume-profile-data";
import { getResumeTheme, type ResumeThemeId } from "@/lib/resume/resume-themes";

type ResumeDocumentProps = {
  profile: ResumeProfile;
  themeId: ResumeThemeId;
  className?: string;
};

type ThemeClasses = {
  root: string;
  header: string;
  name: string;
  headline: string;
  sectionTitle: string;
  roleCompany: string;
  body: string;
  skill: string;
  footer: string;
};

function executiveStyles(accent: string, header: string): ThemeClasses {
  return {
    root: "bg-white text-slate-800 font-sans",
    header: `border-b-4 pb-4 mb-5`,
    name: `text-[22px] font-bold uppercase tracking-tight`,
    headline: `text-[11px] font-semibold uppercase tracking-wide mb-2`,
    sectionTitle: `text-[11px] font-bold uppercase border-b pb-0.5 mb-2`,
    roleCompany: `text-[10px] font-semibold mb-1`,
    body: "text-[10px] leading-relaxed text-slate-600",
    skill: `rounded px-2 py-0.5 text-[9px] font-semibold`,
    footer: `font-bold`,
  };
}

function minimalistStyles(accent: string): ThemeClasses {
  return {
    root: "bg-white text-slate-700 font-sans",
    header: "border-b border-slate-200 pb-4 mb-5",
    name: "text-[22px] font-semibold tracking-tight text-slate-900",
    headline: "text-[12px] text-slate-500 mb-2",
    sectionTitle: "text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2",
    roleCompany: "text-[10px] font-medium text-slate-600 mb-1",
    body: "text-[10px] leading-relaxed text-slate-500",
    skill: "rounded border border-slate-200 px-2 py-0.5 text-[9px] text-slate-600",
    footer: "text-slate-400",
  };
}

function modernStyles(accent: string, header: string): ThemeClasses {
  return {
    root: "bg-white text-[#0d1c2e] font-sans",
    header: `-mx-8 -mt-8 mb-5 px-8 pt-8 pb-5 border-l-4`,
    name: "text-[24px] font-extrabold",
    headline: "text-[12px] font-bold mb-2",
    sectionTitle: "text-[12px] font-bold mb-2",
    roleCompany: "text-[10px] font-semibold mb-1",
    body: "text-[10px] leading-relaxed text-[#46464e]",
    skill: "rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white",
    footer: "font-bold",
  };
}

function resolveThemeClasses(themeId: ResumeThemeId): ThemeClasses & { colors: Record<string, string> } {
  const theme = getResumeTheme(themeId);
  const { accent, header, body } = theme.preview;

  if (theme.preset === "minimalist") {
    const t = minimalistStyles(accent);
    return {
      ...t,
      colors: {
        accent,
        header,
        body,
        name: themeId === "elegant" ? "#fafaf9" : "#0f172a",
        headline: accent,
        roleCompany: accent,
        sectionTitle: accent,
        skillBorder: accent,
        skillText: accent,
      },
    };
  }

  if (theme.preset === "modern") {
    const t = modernStyles(accent, header);
    return {
      ...t,
      colors: {
        accent,
        header,
        body,
        name: "#0a1133",
        headline: accent,
        roleCompany: accent,
        sectionTitle: accent,
        skillBg: accent,
        footer: accent,
        headerBorder: accent,
      },
    };
  }

  const t = executiveStyles(accent, header);
  return {
    ...t,
    colors: {
      accent,
      header,
      body,
      name: accent,
      headline: accent,
      roleCompany: accent,
      sectionTitle: accent,
      skillBg: `${accent}18`,
      skillText: accent,
      footer: accent,
      headerBorder: accent,
    },
  };
}

export function ResumeDocument({ profile, themeId, className }: ResumeDocumentProps) {
  const t = resolveThemeClasses(themeId);
  const c = t.colors;
  const contact = [profile.email, profile.phone, profile.location, profile.website];
  const theme = getResumeTheme(themeId);

  const headerStyle: CSSProperties =
    theme.preset === "modern"
      ? { backgroundColor: c.header, borderLeftColor: c.headerBorder ?? c.accent }
      : theme.preset === "executive"
        ? { borderBottomColor: c.headerBorder ?? c.accent }
        : {};

  const nameStyle: CSSProperties = { color: c.name ?? c.accent };
  const headlineStyle: CSSProperties = { color: c.headline ?? c.accent };

  return (
    <div
      className={`resume-document w-[210mm] min-h-[297mm] p-8 ${t.root} ${className ?? ""}`}
      data-resume-theme={themeId}
      style={{ backgroundColor: theme.preview.body }}
    >
      <header className={t.header} style={headerStyle}>
        <h1 className={t.name} style={nameStyle}>
          {profile.fullName}
        </h1>
        <p className={t.headline} style={headlineStyle}>
          {profile.headline}
        </p>
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium opacity-90">
          {contact.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </p>
      </header>

      <div className="space-y-5">
        <section>
          <h2 className={t.sectionTitle} style={{ color: c.sectionTitle, borderColor: `${c.accent}40` }}>
            Professional Summary
          </h2>
          <p className={t.body}>{profile.summary}</p>
        </section>

        <section>
          <h2 className={t.sectionTitle} style={{ color: c.sectionTitle, borderColor: `${c.accent}40` }}>
            Experience
          </h2>
          <div className="space-y-3">
            {profile.experience.map((role) => (
              <div key={`${role.title}-${role.period}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-[11px] font-bold">{role.title}</h3>
                  <span className={`text-[10px] italic opacity-80 ${t.body}`}>{role.period}</span>
                </div>
                <p className={t.roleCompany} style={{ color: c.roleCompany }}>
                  {role.company}
                </p>
                <ul className={`ml-3.5 list-disc space-y-0.5 ${t.body}`}>
                  {role.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={t.sectionTitle} style={{ color: c.sectionTitle, borderColor: `${c.accent}40` }}>
            Education & Certifications
          </h2>
          <div className="space-y-2">
            {[...profile.education, ...profile.certifications].map((item) => (
              <div key={`${item.title}-${item.school}`}>
                <h3 className="text-[11px] font-bold">{item.title}</h3>
                <p className={t.body}>
                  {item.school} · {item.period}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={t.sectionTitle} style={{ color: c.sectionTitle, borderColor: `${c.accent}40` }}>
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className={t.skill}
                style={
                  theme.preset === "modern"
                    ? { backgroundColor: c.skillBg, color: "#fff" }
                    : theme.preset === "executive"
                      ? { backgroundColor: c.skillBg, color: c.skillText }
                      : { borderColor: c.skillBorder, color: c.skillText }
                }
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>

      <p className="mt-8 text-center text-[9px] opacity-30" style={{ color: c.footer ?? c.accent }}>
        JobsFinder.lk
      </p>
    </div>
  );
}
