"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Icon } from "@/components/ui/icon";
import { formatSalary } from "@/lib/api/jobs";
import type { CompanyDetail } from "@/lib/api/types";

type CompanyProfilePageProps = {
  company: CompanyDetail;
};

const NAV_SECTIONS = [
  { id: "about", icon: "info", label: "About" },
  { id: "life", icon: "groups", label: "Life at Company" },
  { id: "openings", icon: "work", label: "Current Openings" },
  { id: "reviews", icon: "rate_review", label: "Reviews" },
];

export function CompanyProfilePage({ company }: CompanyProfilePageProps) {
  const companyName = company.name;
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) setActiveSection(id);
          }
        });
      },
      { rootMargin: "-150px 0px -70% 0px", threshold: 0 },
    );

    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <PublicHeader />

      <main className="pt-20">
        <section className="relative h-[400px] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Company headquarters"
            className="h-full w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPgS0arizck0ZVGEpjND6j2UPu3Os3D2h_5HkF0jKU50BEV_XBgdtdfAlgV0DNHhZ3iWNLzVvlgmOxqHDMvTqZi-2V2GWottL28u2-YId9wAFHPQpdYxTXyVcLvxXTPugU8akRx_gOJhRF528jse_Xd6uyLA6dU7lcEKYDrPQnQpZyejnDJRdkiyAcL1jQBJl3w4sfMMleu2BfvXJEvVRkYjfqJLMoNZ4mTj8c8tXs1YRmO0O3MOh0OVbj6oS49vQrv8OCEdSK5SbV"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full">
            <div className="mx-auto flex max-w-container-max items-end gap-stack-lg px-margin-mobile pb-stack-lg md:px-margin-desktop">
              <div className="-mb-12 rounded-lg border border-outline-variant bg-surface-container-lowest p-2 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`${companyName} logo`}
                  className="h-32 w-32 rounded bg-white object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFPD5n4WE06i2MQsSJra6dW1caErt5G4_HK-w_b7iYZCeXLRv4dii1PlKbkWQaYyw8LrmnlPTnNq2nzVkWrt7eBDrR-8BGXKoGEGsTyRSry_7TR9E1MyUi6cwcE3esrV4s_VTMCAh1Ofi6b76a0QXkpuL2ByrdcnzOn2gtQZUeSgZvbNJvrYnmzoD6vuPQzcC6TnylBsVADK1ZgOCJC5bLwnaGzGWIljEA3vrBbVXGrQCM90Rlin2rtd__T1jKkqcn77E-3YDSn6or"
                />
              </div>
              <div className="flex-1 pb-4">
                <div className="mb-1 flex items-center gap-stack-sm">
                  <h1 className="font-headline-xl text-headline-xl text-on-primary">{companyName}</h1>
                  {company.verified && (
                    <Icon
                      name="verified"
                      className="rounded-full bg-on-primary p-0.5 text-[20px] text-secondary"
                      filled
                    />
                  )}
                </div>
                <p className="font-body-lg text-body-lg text-primary-fixed-dim">
                  {company.description?.slice(0, 120) ?? "Leading employer in Sri Lanka."}
                </p>
              </div>
              <div className="flex gap-stack-sm pb-4">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded bg-on-primary px-8 py-3 font-label-bold text-label-bold text-primary transition-all hover:bg-surface-container-high"
                >
                  Follow Company
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-container-max grid-cols-12 gap-gutter px-margin-mobile py-16 md:px-margin-desktop">
          <aside className="col-span-12 space-y-stack-lg lg:col-span-3">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md">
              <nav className="space-y-1">
                {NAV_SECTIONS.map(({ id, icon, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={
                      activeSection === id
                        ? "flex items-center gap-3 rounded-lg bg-secondary px-4 py-3 font-label-bold text-label-bold text-on-secondary transition-all"
                        : "flex items-center gap-3 rounded-lg px-4 py-3 font-label-bold text-label-bold text-on-surface-variant transition-all hover:bg-surface-container-low"
                    }
                  >
                    <Icon name={icon} />
                    {label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md">
              <h3 className="mb-4 font-label-bold text-label-bold uppercase tracking-wider text-on-surface-variant">
                Company Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-0.5 font-label-sm text-label-sm text-outline">Website</p>
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-label-bold text-label-bold text-secondary hover:underline"
                    >
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <p className="font-body-md text-body-md text-on-surface-variant">—</p>
                  )}
                </div>
                <div>
                  <p className="mb-0.5 font-label-sm text-label-sm text-outline">Industry</p>
                  <p className="font-body-md text-body-md text-on-surface">Enterprise Software</p>
                </div>
                <div>
                  <p className="mb-0.5 font-label-sm text-label-sm text-outline">Company size</p>
                  <p className="font-body-md text-body-md text-on-surface">500 - 1,000 employees</p>
                </div>
                <div>
                  <p className="mb-0.5 font-label-sm text-label-sm text-outline">Headquarters</p>
                  <p className="font-body-md text-body-md text-on-surface">Colombo, Sri Lanka</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="col-span-12 space-y-12 lg:col-span-9">
            <section
              id="about"
              className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg"
            >
              <h2 className="mb-stack-md font-headline-md text-headline-md text-primary">
                About {companyName}
              </h2>
              <div className="space-y-4 font-body-md text-body-md leading-relaxed text-on-surface-variant">
                <p>{company.description ?? `${companyName} is a verified employer on JobsFinder.lk.`}</p>
              </div>
            </section>

            <section id="life">
              <h2 className="mb-stack-lg font-headline-md text-headline-md text-primary">
                Life at {companyName}
              </h2>
              <div className="grid h-[500px] grid-cols-1 grid-rows-2 gap-4 md:grid-cols-4">
                <div className="overflow-hidden rounded-xl border border-outline-variant md:col-span-2 md:row-span-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Team collaboration"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5QnpmW-OOkejtbcNnoRRB7fFojUZ2b2ZPCMFo58Af4uofvFrahj9h9C6CCBz_qzyqFRGwYwi3K7Z9FUZO22Vtyaz9Y70cEtU3ixpVNGSrOMsomPmXi8tzX7MYWmH2WVyxGaErR3ppp84FR0xKbDjrq0zJZDgB2GENSSq_hBopPzd1nCpihVoGGWpslk0pbc8Q0eRI7qC7ws5Ex0ZC-RQpEkdOYFMLCoMsOgB6Cu4QTvdwFEisRbJjZZNIQRH6xq_GuTMh_tTLss1O"
                  />
                </div>
                <div className="overflow-hidden rounded-xl border border-outline-variant md:col-span-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Office breakroom"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbkyqCFPPwuOx7IuCzwFX9X53wT8InYkoEOS3Luq8HZHaoNSSy5Q0MFhxpId4l5x1PcKRLW5Pi5k42Hg09oL6Dh3dRoPEc1NJZmTlTDde3A8vrDixr4X2DD9MjHJb3D1pau3FoYwHnASUVS4LdLjyGT2FXXoJUhQpE7VJEsAzMQ3k-IO8MFgDhW5amwIYXisHdAjw_hmhfp_9pWLxNoZ_5O4h0vnFZDm2_3GA672rSMUaRgpQa079SGIIUhHy01x78Bmzv-Ms185Cj"
                  />
                </div>
                <div className="overflow-hidden rounded-xl border border-outline-variant md:col-span-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Tech event"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC22F-g_Tv1WgNWZjuoZFvh5og1lWu4uU7mZaxuXsLoBGJ5uA4nEkjhVNNriNPg7H_Fb1u8KPJsUjx8gtfHtGywjhjIK9OA61mn9bTRC_K9S9BfLDFBChTNhGnwdhn4f0E3cvUNhDKkA5VbIpLq5sq3Bj1X8lr1MV42B0rniIsxi1VFFycPV-X5rVOq-ntAjBuIbgOk2qHHR5JBMyN3sEY76IwplPpU8sFeDVGHvypvSoEJaDeNFyq4gBz-Spm7f-Q-RyyXmhgoC33B"
                  />
                </div>
                <div className="overflow-hidden rounded-xl border border-outline-variant md:col-span-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Brainstorming session"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZADFFgh9pHNvjWRLpwoR651Zk7I5FPAkZBx4SZAnYZHLmoZ34UOdtTCxJCrtDMLh7a_hcoar8oqGQyZFssCPE1wQZwrqHjJA6KMKBsmctoi3HZzwSEMPksMsLqnZlXZwSZTbx46E_8E_jRe_svaQAE-jHCWlOmvZ5jsFQi_Rt7ehnUTiSMM79BKw9Z7FQbzKWRy0OHd-qV8h1IVAiA1Ri3D-hrwtXSQ_fO9WOluBzg6WdJI0jQ7egCP6DYXXe1krVzEWeHoQqoAv0"
                  />
                </div>
              </div>
            </section>

            <section id="openings">
              <div className="mb-stack-lg flex items-center justify-between">
                <h2 className="font-headline-md text-headline-md text-primary">Current Openings</h2>
                <Link href="/jobs" className="flex items-center gap-1 font-label-bold text-label-bold text-secondary hover:underline">
                  View All <Icon name="arrow_forward" />
                </Link>
              </div>
              <div className="space-y-stack-md">
                {company.jobs.length === 0 && (
                  <p className="text-on-surface-variant">No open roles at the moment.</p>
                )}
                {company.jobs.map((job) => (
                  <div
                    key={job.slug}
                    className="group cursor-pointer rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/jobs/${job.slug}`}>
                          <h4 className="mb-1 font-headline-md text-headline-md text-on-surface transition-colors group-hover:text-secondary">
                            {job.title}
                          </h4>
                        </Link>
                        <div className="mb-3 flex gap-4">
                          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                            <Icon name="location_on" className="text-[16px]" />
                            {job.location ?? "Sri Lanka"}
                          </span>
                          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                            <Icon name="schedule" className="text-[16px]" />
                            {job.employmentType ?? "Full-time"}
                          </span>
                          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                            <Icon name="payments" className="text-[16px]" />
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="rounded bg-primary px-6 py-2 font-label-bold text-label-bold text-on-primary transition-all hover:opacity-90"
                      >
                        View Job
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="reviews"
              className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-stack-lg"
            >
              <div className="mb-stack-lg flex items-center justify-between">
                <div>
                  <h2 className="font-headline-md text-headline-md text-primary">Employee Reviews</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex text-secondary">
                      <Icon name="star" className="text-[18px]" filled />
                      <Icon name="star" className="text-[18px]" filled />
                      <Icon name="star" className="text-[18px]" filled />
                      <Icon name="star" className="text-[18px]" filled />
                      <Icon name="star_half" className="text-[18px]" />
                    </div>
                    <span className="font-label-bold text-label-bold">4.6 out of 5</span>
                    <span className="font-body-md text-body-md text-on-surface-variant">(124 reviews)</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded bg-secondary px-8 py-3 font-label-bold text-label-bold text-on-secondary transition-all hover:opacity-90"
                >
                  Write a Review
                </button>
              </div>
              <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
                {[
                  {
                    initials: "JD",
                    role: "Senior Architect",
                    meta: "Current Employee • Colombo",
                    title: "Great culture and engineering excellence",
                    body: "WSO2 offers a unique environment where you can work on core engineering problems. The open source culture is very transparent and promotes innovation at every level.",
                    stars: 5,
                  },
                  {
                    initials: "AS",
                    role: "HR Manager",
                    meta: "Former Employee • 3 years",
                    title: "Inclusive and high energy",
                    body: "The teams are incredibly talented and there's a real sense of camaraderie. While the pace is fast, the professional growth opportunities are unmatched in the region.",
                    stars: 4,
                  },
                ].map((review) => (
                  <div
                    key={review.initials}
                    className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high font-bold text-primary">
                        {review.initials}
                      </div>
                      <div>
                        <p className="font-label-bold text-label-bold text-on-surface">{review.role}</p>
                        <p className="font-label-sm text-label-sm text-outline">{review.meta}</p>
                      </div>
                    </div>
                    <div className="mb-2 flex text-secondary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icon
                          key={i}
                          name="star"
                          className="text-[18px]"
                          filled={i < review.stars}
                        />
                      ))}
                    </div>
                    <h5 className="mb-2 font-label-bold text-label-bold">&ldquo;{review.title}&rdquo;</h5>
                    <p className="line-clamp-2 font-body-md text-body-md text-on-surface-variant">{review.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter variant="dark" />
    </div>
  );
}
