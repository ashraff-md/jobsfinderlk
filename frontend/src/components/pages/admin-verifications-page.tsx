"use client";

import Link from "next/link";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";

const RECRUITERS = [
  { id: "1", initials: "HS", name: "Harshana Silva", role: "Senior Tech Recruiter", company: "Virtusa (Pvt) Ltd", status: "Under Review", statusClass: "bg-yellow-100 text-yellow-800" },
  { id: "2", name: "Amara Perera", role: "Talent Acquisition Lead", company: "IFS", status: "Documents Missing", statusClass: "bg-error-container text-on-error-container", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpx0jhkrNuOPdsad2M9zWOPH-8rrlfbJtMCqC8WjN9BjM2ndc1UisQCBsA0w_SlyWq7wNmtaaVmHGbASplBlUwz5YRtsBmgZFR-gdtXTbQHOW-O-RFJi7DaASheocaHSpZaFoFrBcJIVYJHSWMGOVCR0nNTq1wgwFL-OSguuvyvslrih-fTOrRafeGAa-mYkBWom29hjmf6B-Uo3r_TG1oD7dNzmhKKTxfAXKRphiLYVU9wxvKhbPgqrWQuGyZ-TiTZlo8DrJH_jYX" },
  { id: "3", initials: "RK", name: "Rohan Kumar", role: "HR Business Partner", company: "John Keells Holdings", status: "Verified", statusClass: "bg-secondary-fixed text-on-secondary-fixed" },
];

export function AdminVerificationsPage() {
  return (
    <RecruiterAdminShell activeNav="verifications">
      <AdminPageCanvas className="md:px-margin-desktop">
        <div className="mb-stack-lg flex items-end justify-between">
          <div>
            <h1 className="text-headline-lg text-on-background">Approval Queue</h1>
            <p className="text-body-md text-on-surface-variant">
              Manage pending recruiter verifications and profile update requests.
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="flex items-center gap-2 rounded-lg bg-surface-container-highest px-4 py-2 font-label-bold">
              <Icon name="filter_list" />
              Filter
            </button>
            <button type="button" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-bold text-on-primary">
              <Icon name="download" />
              Export Log
            </button>
          </div>
        </div>

        <div className="bento-grid mb-stack-lg">
          <section className="col-span-12 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest lg:col-span-8">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low p-stack-md">
              <h2 className="text-headline-md">Recruiter Verification</h2>
              <span className="rounded-full bg-secondary-container/10 px-3 py-1 font-label-bold text-label-sm text-secondary">
                24 Pending
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant bg-surface-container-low">
                  <tr>
                    {["Recruiter", "Company", "Verification", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-stack-md py-4 font-label-bold text-on-surface-variant">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {RECRUITERS.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-surface-container">
                      <td className="px-stack-md py-4">
                        <div className="flex items-center gap-3">
                          {r.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img alt="" className="h-10 w-10 rounded-full object-cover" src={r.avatar} />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed font-bold text-secondary">
                              {r.initials}
                            </div>
                          )}
                          <div>
                            <p className="font-label-bold">{r.name}</p>
                            <p className="text-[12px] text-on-surface-variant">{r.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-stack-md py-4">
                        <div className="flex items-center gap-2">
                          <Icon name="business_center" className="text-[18px] text-on-surface-variant" />
                          <span>{r.company}</span>
                        </div>
                      </td>
                      <td className="px-stack-md py-4">
                        <div className="flex gap-2">
                          <span className="flex items-center gap-1 font-label-bold text-label-sm text-secondary">
                            <Icon name="link" className="text-[14px]" />
                            LinkedIn
                          </span>
                          <span className="flex items-center gap-1 font-label-bold text-label-sm text-secondary">
                            <Icon name="description" className="text-[14px]" />
                            Doc
                          </span>
                        </div>
                      </td>
                      <td className="px-stack-md py-4">
                        <span className={`rounded px-2 py-1 text-[11px] font-extrabold uppercase ${r.statusClass}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-stack-md py-4">
                        <div className="flex gap-2">
                          <Link href={`/admin/verifications/${r.id}`} className="font-label-bold text-secondary hover:underline">
                            Review
                          </Link>
                          <button type="button" className="text-secondary">
                            <Icon name="check_circle" filled />
                          </button>
                          <button type="button" className="text-error">
                            <Icon name="cancel" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="col-span-12 space-y-4 lg:col-span-4">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-label-bold text-primary">Verification SLA</h3>
              <p className="mt-2 text-headline-md text-primary">4.2h</p>
              <p className="text-label-sm text-on-surface-variant">Average review time</p>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
              <h3 className="font-label-bold">Flagged Updates</h3>
              <p className="mt-2 text-label-sm text-on-surface-variant">3 profile changes require tier-2 review</p>
            </div>
          </aside>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
