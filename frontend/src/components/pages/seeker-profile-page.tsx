import { SeekerShell } from "@/components/layout/seeker-shell";
import { ResumePdfDownload } from "@/components/resume/resume-pdf-download";
import { Icon } from "@/components/ui/icon";

const EXPERIENCE = [
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNHbgpst68EEok9pI7ojZsS5bC_ax_JrFc2kV5zOR8gFNLK-yq3WzALxpjXb92lu-R6NcZpkLd_Mb4hQ7R7Lys3ozMdxT-mZADFTJsVO-TL6ORiOQdfhJQvvWJ5mlIaLMlTC3Q6KVYczwT4Opa6jcQmzTpAul2L9EsY7Z1r81-S9E14lKcrzmxWLjgswTPuqrzAamV4wJIT-vlgJ3k6V1Qst-ObIVdxLmP1RkW0-9AfVCNYFRTfA40lNM0vBnWTI79PgwhzS2e0XTo",
    title: "Senior Product Designer",
    period: "Jan 2021 — Present",
    company: "InnovateX Studio • Full-time",
    bullets: [
      "Architected and maintained a comprehensive design system utilized by 4 cross-functional squads, reducing development time by 30%.",
      "Led the redesign of the core dashboard, improving task completion rates by 25% for enterprise clients.",
      "Mentored 3 junior designers and established new user research protocols across the design department.",
    ],
  },
  {
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpFcq5T4G82T7EG4mWEjhc1OObqy3wK5Hbjtmc9x2EbLlV5MOan5dLNynV5SCqZlTp1pgadBBKj-QqjfK6px3cdHCyRsGpVf4pmgmKLxAgOwZH-4N1eMkvbxNyy7V9ASsRMXymw0c3iPOD0jMpBIJQtWNGfDqAuTfR_iA-_vHIosq5dyHI4gw-scPO3y6lJg9cH2E0nnSKv9xftF99f4yxvLkeQ6b6N4omF6_fBHhwd9mMaQ_hlxxXCgT5Oo0Oqx5h1r_2-qCVSkBN",
    title: "UI/UX Designer",
    period: "May 2018 — Dec 2020",
    company: "Nexus Digital • Full-time",
    bullets: [
      "Designed end-to-end mobile experiences for high-traffic fintech applications with over 1M monthly active users.",
      "Collaborated directly with stakeholders to translate business goals into high-fidelity interactive prototypes.",
    ],
  },
];

const PORTFOLIO = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCCgvWrDu2h9-1MAo6AcavwlBsq8s7lNgCQbNQs0_2UilIfgUhdOuBXWEeg2Qnb7Tnkfb5POB_kLXAf4iribjWpuhImk8uJ0DayUO-AQM3K_I298MaJL6SylQDcXji0wzbMrgQGhJEp35bqvFXRu3U6sisP2BvLh6XW6r5nU4NmEDyi3y1KtwUDp--WdUkmA4tOvryzp2zGRDL2OP_Gxzmd4sAhKTB3_qrpw5_QrKqt23oit51vDEqEHnOpAxM_lAKmL7lBhVj_iq9e",
    title: "NeoBank Enterprise Suite",
    subtitle: "B2B Financial Operations Platform",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCYRbWLTmsM0-1KW0vNtbYLq4DZ8zv9mWV0llx0cqQ2BdTzP3SF17-L0pCJZ5QAtT2qD44GGV7XFTK1Kr1_bfseI9XYDAR-sR7AlC0kEV5n50qo7xQIiJ3zdQgBH3lKcc3Ba7FgYoDe-5LLVvB79KzmlnYwD-EKS5i_yz_gJzJYkc0HX73KfHhky8327uu_1QtVYwYFJDzpuqRW4Tacruc542_MpJU1ILuIV0kGoB7lo2PW1BsHrAz2i0XXwR3e2DHzAq8jmGsaPRcp",
    title: "LuxeCommerce App",
    subtitle: "iOS & Android Fashion Marketplace",
  },
];

const SKILLS = [
  { name: "UI/UX Design", value: 95 },
  { name: "Strategic Thinking", value: 90 },
  { name: "Interaction Design", value: 88 },
];

const PROFILE_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCMuYdnuTfxsodYpTdNOuvXhBCPUsMDcCryveZgzchX7a_XYkGJx16to7ZmY6xfrdRaFIRKSuTMZqaS-PfUFNTGRC8wZbhDJCbqamUHkRv9qe2PvXUKt23iUXGUwBPV6YGcbyHSUmoWmP9Fu-ZRz0T_2SwvjOSszcu0mQ9JJXXdTkL_0UXSZFfSCL76cQzUsVsJ6n4SF9dJOvu6YaLtVrpwCEQ17dRINotlY7dB2Z5WaTWm4z_84Mxst0wwD-U1hXCtZa7vm4q9KAMb";

export function SeekerProfilePage() {
  return (
    <SeekerShell activeNav="profile" userName="Alex Thompson">
      <div className="mx-auto max-w-container-max">
        <div className="grid grid-cols-1 gap-stack-lg lg:grid-cols-12">
          <div className="space-y-stack-lg lg:col-span-8">
            <section className="professional-card relative overflow-hidden rounded-xl p-8">
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-secondary/5" />
              <div className="relative flex flex-col items-start gap-8 md:flex-row">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Alex Thompson"
                    className="h-32 w-32 rounded-xl border-4 border-surface-container-lowest object-cover shadow-sm"
                    src={PROFILE_AVATAR}
                  />
                  <div className="absolute -bottom-2 -right-2 rounded-full border-4 border-surface-container-lowest bg-secondary p-1.5 text-white">
                    <Icon name="check_circle" className="text-[16px]" filled />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h2 className="font-headline-lg text-headline-lg text-primary-container">Alex Thompson</h2>
                    <span className="rounded-full bg-secondary/10 px-3 py-1 font-label-sm font-bold text-secondary">
                      Open to Opportunities
                    </span>
                  </div>
                  <p className="mb-4 font-body-lg text-outline">
                    Senior Product Designer at InnovateX Studio
                  </p>
                  <div className="flex flex-wrap gap-6 text-outline">
                    <span className="flex items-center gap-2 font-label-bold">
                      <Icon name="location_on" className="text-secondary" />
                      Colombo, Sri Lanka
                    </span>
                    <span className="flex items-center gap-2 font-label-bold">
                      <Icon name="mail" className="text-secondary" />
                      alex.t@jobsfinder.lk
                    </span>
                    <span className="flex items-center gap-2 font-label-bold">
                      <Icon name="link" className="text-secondary" />
                      alexthompson.design
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="professional-card rounded-xl p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-primary-container">Professional Summary</h3>
                <div className="flex items-center gap-2 rounded-lg bg-secondary/5 px-3 py-1 font-label-sm font-bold text-secondary">
                  <Icon name="auto_awesome" className="text-[18px]" />
                  AI Enhanced
                </div>
              </div>
              <p className="font-body-md leading-relaxed text-outline">
                Visionary Senior Product Designer with over 8 years of experience in crafting high-impact
                digital ecosystems. Specialized in bridging the gap between complex business requirements
                and intuitive user experiences. Proven track record of leading design teams at top-tier
                tech firms, resulting in a 40% increase in user retention across flagship products.
              </p>
            </section>

            <section className="professional-card rounded-xl p-8">
              <h3 className="mb-8 font-headline-md text-headline-md text-primary-container">Work Experience</h3>
              <div className="relative space-y-10 before:absolute before:bottom-2 before:left-[23px] before:top-2 before:w-0.5 before:bg-outline-variant">
                {EXPERIENCE.map((role) => (
                  <div key={role.title} className="relative pl-16">
                    <div className="absolute left-0 top-0 z-10 flex h-12 w-12 items-center justify-center rounded-lg border border-outline-variant bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" className="h-full w-full object-contain" src={role.logo} />
                    </div>
                    <div className="mb-2 flex flex-col justify-between sm:flex-row sm:items-center">
                      <h4 className="font-label-bold text-primary-container">{role.title}</h4>
                      <span className="text-label-sm text-outline">{role.period}</span>
                    </div>
                    <p className="mb-4 font-label-sm font-bold text-secondary">{role.company}</p>
                    <ul className="list-disc space-y-3 pl-4 text-outline">
                      {role.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="professional-card rounded-xl p-8">
              <h3 className="mb-8 font-headline-md text-headline-md text-primary-container">
                Education & Certifications
              </h3>
              <div className="grid grid-cols-1 gap-stack-lg md:grid-cols-2">
                <div className="flex gap-4">
                  <Icon name="school" className="h-fit rounded-xl bg-secondary/5 p-3 text-secondary" />
                  <div>
                    <h4 className="font-label-bold text-primary-container">BSc in Interactive Media</h4>
                    <p className="text-label-sm text-outline">University of Westminster</p>
                    <p className="mt-1 text-label-sm text-outline">2014 — 2018</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Icon name="workspace_premium" className="h-fit rounded-xl bg-secondary/5 p-3 text-secondary" />
                  <div>
                    <h4 className="font-label-bold text-primary-container">Google UX Design Professional</h4>
                    <p className="text-label-sm text-outline">Coursera / Google</p>
                    <p className="mt-1 text-label-sm text-outline">Issued 2021</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="professional-card rounded-xl p-8">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-primary-container">Portfolio Highlights</h3>
                <button type="button" className="font-label-bold text-secondary hover:underline">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {PORTFOLIO.map((project) => (
                  <div key={project.title} className="group cursor-pointer">
                    <div className="relative mb-4 h-48 overflow-hidden rounded-xl bg-surface-container">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={project.image}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-primary-container/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded-full bg-white px-6 py-2 font-label-bold text-primary-container">
                          View Project
                        </span>
                      </div>
                    </div>
                    <h4 className="font-label-bold text-primary-container transition-colors group-hover:text-secondary">
                      {project.title}
                    </h4>
                    <p className="text-label-sm text-outline">{project.subtitle}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-stack-lg lg:col-span-4">
            <ResumePdfDownload />
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant py-3 font-label-bold text-primary-container transition-all hover:bg-surface-container"
                >
                  <Icon name="share" />
                  Share
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant py-3 font-label-bold text-primary-container transition-all hover:bg-surface-container"
                >
                  <Icon name="edit" />
                  Edit
                </button>
              </div>
            </div>

            <div className="professional-card rounded-xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-label-bold text-primary-container">Profile Strength</h3>
                <span className="font-label-bold text-secondary">85%</span>
              </div>
              <div className="mb-6 h-2 overflow-hidden rounded-full bg-surface-container">
                <div className="h-full w-[85%] rounded-full bg-secondary" />
              </div>
              <p className="mb-4 text-label-sm text-outline">
                You&apos;re almost there! Complete these steps to stand out to more recruiters:
              </p>
              <ul className="space-y-3">
                <li className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-label-sm font-medium text-secondary transition-all hover:bg-secondary/5">
                  <Icon name="add_circle" className="text-[20px]" />
                  Add your volunteer experience
                </li>
                <li className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-label-sm font-medium text-secondary transition-all hover:bg-secondary/5">
                  <Icon name="add_circle" className="text-[20px]" />
                  Request 2 more endorsements
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-primary-container p-6 text-white">
              <div className="mb-4 flex items-center gap-3">
                <Icon name="psychology" className="text-secondary-fixed" />
                <h3 className="font-label-bold">Skills Gap Analysis</h3>
              </div>
              <p className="mb-6 text-label-sm opacity-80">
                Based on Senior Product Designer roles at top-tier companies, consider adding:
              </p>
              <div className="space-y-4">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="mb-1 font-label-sm font-bold">Mastering Design Systems</p>
                  <p className="text-[11px] opacity-60">High demand in your current field.</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="mb-1 font-label-sm font-bold">Ethical AI Design</p>
                  <p className="text-[11px] opacity-60">Emerging requirement for leadership roles.</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-6 w-full rounded-lg bg-secondary py-2 font-label-sm font-bold text-on-secondary transition-all hover:opacity-90"
              >
                Explore Learning
              </button>
            </div>

            <div className="professional-card rounded-xl p-6">
              <h3 className="mb-6 font-label-bold text-primary-container">Skills & Proficiency</h3>
              <div className="space-y-6">
                {SKILLS.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex justify-between text-label-sm font-bold">
                      <span>{skill.name}</span>
                      <span>{skill.value}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-container">
                      <div
                        className="h-full rounded-full bg-primary-container"
                        style={{ width: `${skill.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Figma", "Webflow", "React", "Design Systems"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-surface-container-high px-3 py-1 text-label-sm text-outline"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SeekerShell>
  );
}
