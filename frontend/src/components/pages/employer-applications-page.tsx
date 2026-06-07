"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const JOBS = [
  { id: "senior-product-designer", title: "Senior Product Designer" },
  { id: "frontend-dev-react", title: "Frontend Dev (React)" },
  { id: "director-engineering", title: "Director of Engineering" },
] as const;

type PipelineCard = {
  name: string;
  role: string;
  tags?: string[];
  time?: string;
  avatar?: string;
  note?: string;
  interview?: string;
  interviewers?: string;
  offerStatus?: string;
  actionNeeded?: boolean;
  highlight?: boolean;
};

type PipelineColumn = {
  id: string;
  title: string;
  dotClass: string;
  cards: PipelineCard[];
};

const PIPELINE: PipelineColumn[] = [
  {
    id: "applied",
    title: "Applied",
    dotClass: "bg-outline",
    cards: [
      {
        name: "Arjun Perera",
        role: "Lead at DesignCo",
        tags: ["UX Strategy", "Figma"],
        time: "Applied 2h ago",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCjk3WfLsJAOFnySomRyXBvBFZOZhQTJ8Xsx7H8dbTRoH36tM9mJEDcAIuQ3DQL8MkegkkQ_NwjuBXbjR62U5T99_FTfBkH1qCLMzzYK1S_hqaCX6HYqH52fIJog82jIDptv9VtUHzfsDDFfH76Vbnpc9p1pCymSqT78Zzfm0LKpnuScaLuE9o5NaFlOiGuBiSSvw022i1X-ZINslTZeR9ww14l1OzFMLkjxiuCvoY0ebIj6FzKY41CuVPhzi-m2x1sekIhAJAi-prc",
      },
      {
        name: "Sanduni Silva",
        role: "Senior Designer",
        tags: ["Prototyping"],
        time: "Applied 5h ago",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCcJvpxaTHHNwgPKCxUJXDrFTqboI5OfsB_QIV4WUGsOBN8Iio_gS5D4Q1ORIWTQ0QVsmSp6neMWfv_BojYYNqbcNHoQoeHHdz1kx442-yGJ_Vp7MFH6yZ0-Jhwbj7VRaYj6rl4Q7dhGiiZ7YK82qifhLPSGmDNsf5pyleVFB8_QK08JeVkHZ9va3zFpoXxnlwycyiuxeDWJf4bG7z9xFJ1Hw7kSDIiq6KFXiPyNCz9hPwJXOBL9oWJzUGcQsDQrVJDkTQRslAHY3Ul",
      },
    ],
  },
  {
    id: "screening",
    title: "Screening",
    dotClass: "bg-secondary",
    cards: [
      {
        name: "Michael Fernando",
        role: "Design Manager",
        note: "Background check cleared",
        time: "In screening",
        actionNeeded: true,
        highlight: true,
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAFtfv2-6c-hpdCPPNwBGYuVvNQt-uYujKdskjOooW2eFtWWRYcbqlxlV53Ird2zYzx-Ch08sRMDyjuiPlBqdXURMkZpaa1T3IrSnRtN8k93rJ3fVzpL-Rl6pDDk2biIbnckUSq6AEsGVoMVlA0L9S79ny8RLE0nxP5vaze7NJpG-JY5YmF4x_DkJSk_WtDspy560pX1GxvbMliGPpzghIkqmPYFo1uGDzN1TiQpx9LEmKeh7xsFBkRIjrfECbplNa2A8-v00btpQr9",
      },
    ],
  },
  {
    id: "interviewing",
    title: "Interviewing",
    dotClass: "bg-secondary-container",
    cards: [
      {
        name: "Isuru Wickrama",
        role: "Product Designer",
        interview: "Stage 2: Technical",
        interviewers: "Tomorrow, 10:00 AM • 2 Interviewers",
        time: "Updated 1h ago",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD3G8lKwop32MCBYHo5UJS0GGuqKOHh4pRbu0OlPtjYoKtCss4F1w8P3FXR3ta6pc4Ne4LXbeS0ODs4SQdHJVCIRElxbs48JVSeKIuPRwtDw8P5XuCDHizMckwrCh7rWAlxB5RWmbI57Klcq2lwl4D2ssP6mN3d5d68H5F6FwPvlE7Th3oExDdzwgKcVUBZ03I97td17JzaC2b08dvOHlXBlZ0fME0uX7cXCv-XyfitvNO9eHAN3kancALfAseDFuJfqFd005ecrMAW",
      },
    ],
  },
  {
    id: "offer",
    title: "Offer",
    dotClass: "bg-primary-container",
    cards: [
      {
        name: "Kasun Jayasekara",
        role: "Director of UX",
        offerStatus: "Offer Sent • Expiring in 2 days",
        time: "Sent Jun 12",
        highlight: true,
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA6PpeuAyRjlR1EP0UzR0I9r4LTe7VQoAtcjbjqzqbW5y0i0BojNfNC0-whXGUGIdjQlnkaB3Qm4ADe2xoYgyqsAd0F_gWOe6ecu06AGZ4DFK4T6wuY6K7m2qu7DI8yWEP3XbnumDwKnKB-Jj1CYYa4PTliKN5buQOjw9uSPGH7vPEK8IGW2uzg2Ywegp1Tl_SxrchlZjputvyXJHj23inRLhwDcxcLh65lpoappSsh9oOQoYsT1a4NSswOWmvNMjJsN6i1DY8V0ulH",
      },
    ],
  },
];

export function EmployerApplicationsPage() {
  const [selectedJobId, setSelectedJobId] = useState(JOBS[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedJob = JOBS.find((job) => job.id === selectedJobId);

  const filteredPipeline = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return PIPELINE;

    return PIPELINE.map((column) => ({
      ...column,
      cards: column.cards.filter(
        (card) =>
          card.name.toLowerCase().includes(query) ||
          card.role.toLowerCase().includes(query) ||
          card.tags?.some((tag) => tag.toLowerCase().includes(query)),
      ),
    }));
  }, [searchQuery]);

  return (
    <>
      <section className="flex flex-1 flex-col overflow-hidden p-6 md:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <nav className="hidden items-center gap-6 lg:flex">
              <span className="cursor-pointer border-b-2 border-secondary py-2 font-label-bold text-secondary">
                Active Roles
              </span>
              <span className="cursor-pointer font-body-md text-on-surface-variant transition-colors hover:text-secondary">
                Archived
              </span>
            </nav>
            <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-white px-4 py-2">
              <span className="text-xs font-label-bold uppercase tracking-wider text-outline">Role</span>
              <select
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
                className="cursor-pointer border-none bg-transparent text-sm font-bold text-primary-container outline-none"
              >
                {JOBS.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            {selectedJob && (
              <p className="text-sm text-outline">{selectedJob.title}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative sm:block">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search candidates..."
                className="w-full rounded-lg border-none bg-surface-container py-2 pl-10 pr-4 text-sm transition-all focus:ring-2 focus:ring-secondary sm:w-64"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded border border-outline-variant px-4 py-2 text-sm font-label-bold transition-all hover:bg-white"
            >
              <Icon name="filter_list" className="text-sm" />
              Filter
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded border border-outline-variant px-4 py-2 text-sm font-label-bold transition-all hover:bg-white"
            >
              <Icon name="sort" className="text-sm" />
              Sort
            </button>
          </div>
        </div>

        <div className="pipeline-scroll flex flex-1 gap-6 overflow-x-auto pb-6">
          {filteredPipeline.map((column) => (
            <div key={column.id} className="flex w-80 shrink-0 flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", column.dotClass)} />
                  <h3 className="text-xs font-label-bold uppercase tracking-widest text-primary-container">
                    {column.title}
                  </h3>
                  <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold text-primary-container">
                    {column.cards.length}
                  </span>
                </div>
                <Icon name="more_horiz" className="cursor-pointer text-outline" />
              </div>

              <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
                {column.cards.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-outline-variant p-6 text-center text-sm text-outline">
                    No candidates in this stage.
                  </div>
                ) : (
                  column.cards.map((card) => (
                    <div
                      key={card.name}
                      className={cn(
                        "group rounded-xl border border-outline-variant bg-white p-4 transition-all hover:shadow-lg",
                        card.highlight && "border-l-4 border-l-secondary",
                      )}
                    >
                      <div className="mb-3 flex items-start gap-3">
                        {card.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={card.avatar}
                            alt=""
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest font-bold text-primary-container">
                            {card.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-label-bold text-primary-container">{card.name}</p>
                          <p className="text-xs text-outline">{card.role}</p>
                        </div>
                      </div>

                      {card.tags && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {card.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-surface-container px-2 py-1 text-[10px] text-on-surface-variant"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {card.note && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-surface-container-low p-2">
                          <Icon name="verified" className="text-sm text-secondary" />
                          <p className="text-[10px] font-medium text-on-surface-variant">{card.note}</p>
                        </div>
                      )}

                      {card.interview && (
                        <div className="mb-4 rounded-lg border border-outline-variant p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase text-primary-container">
                              {card.interview}
                            </p>
                            {card.interviewers && (
                              <p className="text-[10px] text-outline">{card.interviewers.split("•")[0]?.trim()}</p>
                            )}
                          </div>
                          {card.interviewers && (
                            <p className="text-[10px] italic text-outline">{card.interviewers}</p>
                          )}
                        </div>
                      )}

                      {card.offerStatus && (
                        <div className="mb-4 rounded-lg bg-primary-container p-3 text-center text-on-primary">
                          <p className="text-[10px] font-bold uppercase tracking-wider">Offer Sent</p>
                          <p className="text-xs">{card.offerStatus.replace("Offer Sent • ", "")}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-dashed border-outline-variant pt-3">
                        {card.actionNeeded ? (
                          <div className="flex items-center gap-1">
                            <Icon name="priority_high" className="text-[12px] text-error" />
                            <p className="text-[10px] font-bold text-error">Action Needed</p>
                          </div>
                        ) : (
                          <p className="text-[10px] font-medium text-outline">{card.time}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded p-1.5 text-secondary hover:bg-surface-container-high"
                            title="Message"
                          >
                            <Icon name="mail" className="text-sm" />
                          </button>
                          <button
                            type="button"
                            className="rounded p-1.5 text-secondary hover:bg-surface-container-high"
                            title="Schedule"
                          >
                            <Icon name="calendar_today" className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}

          <div className="flex w-80 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant transition-all hover:border-secondary">
            <Icon name="add_circle" className="mb-2 text-outline" />
            <p className="text-xs font-label-bold text-outline">Add Stage</p>
          </div>
        </div>
      </section>
    </>
  );
}
