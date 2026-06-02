import Link from "next/link";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { Icon } from "@/components/ui/icon";
import {
  INTERNSHIPS_FEATURED_LOGO,
  INTERNSHIPS_HERO_IMG,
  INTERNSHIPS_PATHWAY_IMG,
  INTERNSHIPS_UNI_LOGOS,
} from "@/lib/assets";

export function InternshipsPage() {
  return (
    <PublicPageLayout>
      <main className="w-full">
        <section className="relative overflow-hidden bg-surface-container-low px-margin-mobile py-16 md:px-margin-desktop md:py-20">
          <div className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="z-10">
              <span className="mb-4 inline-block rounded-full bg-secondary-fixed px-3 py-1 font-label-bold text-secondary">
                University Program
              </span>
              <h1 className="mb-6 font-headline-xl text-headline-xl text-primary">
                Launch Your Career Before Graduation.
              </h1>
              <p className="mb-8 max-w-lg font-body-lg text-body-lg text-on-surface-variant">
                Connect with elite internship opportunities and graduate pathways designed
                specifically for Sri Lankan students. Your first step into the professional
                world starts here.
              </p>
              <div className="flex flex-col items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm md:flex-row">
                <div className="flex w-full flex-1 items-center border-b border-outline-variant pb-2 md:border-b-0 md:border-r md:pb-0 md:pr-4">
                  <Icon name="search" className="mr-2 text-outline" />
                  <input
                    className="w-full border-none bg-transparent font-body-md text-body-md focus:ring-0"
                    placeholder="Job title or skill..."
                    type="text"
                  />
                </div>
                <div className="flex w-full items-center gap-2 md:w-auto">
                  <Icon name="schedule" className="text-outline" />
                  <select className="cursor-pointer border-none bg-transparent font-label-bold text-label-bold text-on-surface-variant focus:ring-0">
                    <option>Duration</option>
                    <option>3 Months</option>
                    <option>6 Months</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="w-full rounded-lg bg-secondary px-8 py-3 font-label-bold text-label-bold text-on-secondary transition-opacity hover:opacity-90 md:w-auto"
                >
                  Find Opportunities
                </button>
              </div>
            </div>
            <div className="relative hidden h-[500px] md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Students working"
                className="h-full w-full rounded-2xl object-cover shadow-lg"
                src={INTERNSHIPS_HERO_IMG}
              />
            </div>
          </div>
        </section>

        <section className="bg-white px-margin-mobile py-stack-lg md:px-margin-desktop">
          <div className="mx-auto max-w-container-max">
            <div className="mb-stack-lg flex items-end justify-between">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">
                  Internship of the Week
                </h2>
                <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                  Selected for outstanding mentorship and project exposure.
                </p>
              </div>
            </div>
            <div className="group flex flex-col items-start gap-8 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 transition-all hover:border-secondary lg:flex-row">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Company Logo"
                  className="h-16 w-16 rounded-md object-contain"
                  src={INTERNSHIPS_FEATURED_LOGO}
                />
              </div>
              <div className="flex-1">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded bg-secondary-container px-3 py-1 font-label-sm text-label-sm text-on-secondary-container">
                    Tech/Software
                  </span>
                  <span className="rounded bg-surface-container-highest px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
                    3 Months
                  </span>
                  <span className="rounded bg-surface-container-highest px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
                    Remote Friendly
                  </span>
                </div>
                <h3 className="mb-2 font-headline-md text-headline-md text-primary">
                  Associate Product Design Intern
                </h3>
                <p className="mb-6 max-w-3xl font-body-md text-body-md text-on-surface-variant">
                  Join the Fintech Innovation Lab to work on next-generation payment systems.
                  You will be mentored by senior designers and contribute to live features used
                  by millions. Ideal for 3rd or 4th year undergraduates.
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-outline">
                    <Icon name="location_on" className="text-[20px]" />
                    <span className="font-label-bold text-label-bold">Colombo 07, LK</span>
                  </div>
                  <div className="flex items-center gap-2 text-outline">
                    <Icon name="payments" className="text-[20px]" />
                    <span className="font-label-bold text-label-bold">LKR 45,000 /mo</span>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 lg:w-auto">
                <button
                  type="button"
                  className="whitespace-nowrap rounded-lg bg-primary px-8 py-3 font-label-bold text-label-bold text-on-primary transition-opacity hover:opacity-90"
                >
                  Apply Now
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-outline-variant px-8 py-3 font-label-bold text-label-bold text-on-surface transition-all hover:bg-surface-container"
                >
                  Save for Later
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest px-margin-mobile py-stack-lg md:px-margin-desktop">
          <div className="mx-auto max-w-container-max text-center">
            <p className="mb-stack-lg font-label-bold text-label-bold uppercase tracking-widest text-outline-variant">
              Our University Partners
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 transition-opacity hover:opacity-100">
              {INTERNSHIPS_UNI_LOGOS.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} alt={`University partner ${i + 1}`} className="h-12 w-auto grayscale" src={src} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background px-margin-mobile py-24 md:px-margin-desktop">
          <div className="mx-auto max-w-container-max">
            <div className="mb-16">
              <h2 className="font-headline-lg text-headline-lg text-primary">Pathways for Grads</h2>
              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Strategic roadmaps to bridge the gap between classroom and boardroom.
              </p>
            </div>
            <div className="grid h-auto grid-cols-1 grid-rows-2 gap-gutter md:h-[600px] md:grid-cols-3 md:grid-rows-2">
              <div className="group flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest transition-all hover:shadow-lg md:col-span-2 md:row-span-2">
                <div className="h-1/2 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Tech Pathway"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={INTERNSHIPS_PATHWAY_IMG}
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-8">
                  <div>
                    <h3 className="mb-4 font-headline-md text-headline-md text-primary">
                      Engineering Excellence Program
                    </h3>
                    <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
                      A 12-month rotation across DevOps, Full-stack, and AI Research teams at
                      leading tech giants in Colombo.
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-label-bold text-label-bold text-secondary">
                      View Roadmap <Icon name="arrow_forward" className="text-[18px]" />
                    </span>
                    <span className="font-label-sm text-label-sm text-outline">Starts July 2024</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-2xl border border-outline-variant bg-surface-container-low p-8 transition-colors hover:bg-surface-container">
                <Icon name="psychology" className="text-4xl text-secondary" />
                <div>
                  <h4 className="mb-2 text-lg font-label-bold text-label-bold text-primary">
                    AI Interviewer
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Practice with our custom AI trained on real internship interview scripts.
                  </p>
                </div>
                <Link href="/dashboard/profile" className="font-label-bold text-label-bold text-secondary underline">
                  Try Beta
                </Link>
              </div>
              <div className="flex flex-col justify-between rounded-2xl bg-primary p-8 text-on-primary shadow-xl">
                <div>
                  <h4 className="mb-2 font-headline-md text-headline-md">Career Guide 2024</h4>
                  <p className="font-label-sm text-label-sm opacity-80">
                    Download our free 50-page guide on navigating the Sri Lankan job market.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-white px-6 py-3 font-label-bold text-label-bold text-primary transition-all hover:bg-opacity-90"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container px-margin-mobile py-24 md:px-margin-desktop">
          <div className="mx-auto max-w-container-max text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-6 font-headline-lg text-headline-lg text-primary">
                Never miss an opportunity.
              </h2>
              <p className="mb-10 font-body-lg text-body-lg text-on-surface-variant">
                Get weekly alerts for internships matching your university major and interests.
              </p>
              <div className="flex flex-col justify-center gap-4 md:flex-row">
                <input
                  className="w-full rounded-lg border-outline-variant px-6 py-4 font-body-md focus:border-secondary focus:ring-1 focus:ring-secondary md:w-96"
                  placeholder="Enter your university email"
                  type="email"
                />
                <button
                  type="button"
                  className="rounded-lg bg-secondary px-10 py-4 font-label-bold text-label-bold text-on-secondary transition-all hover:opacity-90 active:scale-95"
                >
                  Subscribe Now
                </button>
              </div>
              <p className="mt-4 font-label-sm text-label-sm italic text-outline">
                Join 5,000+ students from Moratuwa, Colombo, and SLIIT.
              </p>
            </div>
          </div>
        </section>
      </main>
    </PublicPageLayout>
  );
}
