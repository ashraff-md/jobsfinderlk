"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type CandidatePipelinePageProps = {
  id: string;
};

type PipelineCard = {
  name: string;
  role: string;
  dotClass?: string;
  tags?: string[];
  time?: string;
  avatar?: string;
  note?: string;
  interview?: string;
  highlight?: boolean;
};

type PipelineColumn = {
  title: string;
  count: number;
  cards?: PipelineCard[];
  empty?: boolean;
};

const PIPELINE_COLUMNS: PipelineColumn[] = [
  {
    title: "Applied",
    count: 24,
    cards: [
      {
        name: "Sarah Jenkins",
        role: "Senior Software Engineer",
        dotClass: "bg-secondary",
        tags: ["React", "Node.js"],
        time: "2h ago",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCqlP1VSUexQxBUbraUS19bToIESQxTu_cn1HpzS8Ag9H0aW_gWDysft4Gnd_JhsQRur2Q06VKcyrfF38hURYYlGnxRHZJj9Vadi3rF828uOC6KWPQrpvRQtglk2pHbm-ZsFksbJuzpxRgJlqdt-0AHCOL5ASIW5M_rxKaw4RT3U1lzYAptUiFv3FyTUK6JOeaN2sNo0HXG_nobKHnBobrEXroUFlUZDVNGw5Y5DXo3K_cyQmCohi265kNWBvnA-xc_PAVHS245OoIQ",
      },
      {
        name: "David Chen",
        role: "Fullstack Developer",
        dotClass: "bg-error",
        tags: ["Python", "AWS"],
        time: "Yesterday",
      },
    ],
  },
  {
    title: "Screened",
    count: 12,
    cards: [
      {
        name: "Marcus Thorne",
        role: "DevOps Engineer",
        note: "Passed initial phone screen",
        time: "Screened 1d ago",
      },
    ],
  },
  {
    title: "Interviewed",
    count: 5,
    cards: [
      {
        name: "Elena Rodriguez",
        role: "Product Designer",
        interview: "Today, 2:30 PM",
        highlight: true,
      },
    ],
  },
  {
    title: "Hired",
    count: 8,
    empty: true,
  },
];

export function CandidatePipelinePage({ id }: CandidatePipelinePageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-outline-variant bg-surface-container-lowest px-6 py-4 md:px-margin-desktop">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <Link
            href="/employer/jobs"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-on-surface-variant transition-colors hover:bg-surface-container-low sm:px-4"
          >
            <Icon name="arrow_back" />
            <span className="font-label-bold">Back to Listings</span>
          </Link>
          <p className="text-label-sm text-on-surface-variant">Job #{id}</p>
        </div>
        <div className="relative w-full max-w-md sm:w-auto sm:min-w-[280px]">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search candidates, roles..."
            className="w-full rounded-full border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-label-sm transition-colors focus:border-secondary focus:outline-none"
          />
        </div>
      </div>

      <div className="pipeline-scroll flex-1 overflow-x-auto bg-background p-6">
        <div className="flex min-h-[600px] gap-6 pb-6">
          {PIPELINE_COLUMNS.map((column) => (
            <div key={column.title} className="flex w-80 shrink-0 flex-col">
              <div className="mb-4 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="font-label-bold">{column.title}</span>
                  <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-label-sm font-label-bold">
                    {column.count}
                  </span>
                </div>
                <Icon name="more_horiz" className="cursor-pointer text-on-surface-variant" />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                {column.empty ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-outline-variant p-8 text-center opacity-50">
                    <div>
                      <Icon name="assignment_turned_in" className="mb-2 text-4xl" />
                      <p className="font-label-bold">Drag here to finalize hire</p>
                    </div>
                  </div>
                ) : (
                  column.cards?.map((card) => (
                    <div
                      key={card.name}
                      className={cn(
                        "group rounded-xl border border-outline-variant bg-surface-container-lowest p-4 transition-all hover:shadow-lg",
                        card.highlight && "border-l-4 border-l-secondary",
                      )}
                    >
                      <div className="mb-3 flex items-start gap-3">
                        {card.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                            src={card.avatar}
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
                          <h3 className="font-label-bold">{card.name}</h3>
                          <p className="text-label-sm text-on-surface-variant">{card.role}</p>
                        </div>
                      </div>

                      {card.tags && (
                        <div className="mb-4 flex flex-wrap gap-1.5">
                          {card.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-surface-container px-2 py-1 text-[10px] font-bold uppercase text-on-surface-variant"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {card.note && (
                        <div className="mb-3 rounded bg-surface-container-low p-2">
                          <p className="text-[12px] text-on-surface-variant">{card.note}</p>
                        </div>
                      )}

                      {card.interview && (
                        <div className="mb-4 flex items-center gap-2">
                          <Icon name="calendar_today" className="text-[16px] text-secondary" />
                          <span className="font-label-bold text-label-sm">{card.interview}</span>
                        </div>
                      )}

                      {card.time && (
                        <div className="flex items-center justify-between border-t border-outline-variant pt-3">
                          <span className="text-label-sm text-on-surface-variant">{card.time}</span>
                          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button type="button" className="rounded p-1.5 text-secondary hover:bg-surface-container-high">
                              <Icon name="mail" className="text-sm" />
                            </button>
                            <button type="button" className="rounded p-1.5 text-secondary hover:bg-surface-container-high">
                              <Icon name="calendar_today" className="text-sm" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
