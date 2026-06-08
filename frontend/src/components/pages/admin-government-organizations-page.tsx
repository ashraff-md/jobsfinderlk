"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { GovernmentOrganizationForm } from "@/components/government-organizations/government-organization-form";
import { Icon } from "@/components/ui/icon";
import { getGovernmentOrganizations } from "@/lib/api/government-organizations";
import type { GovernmentOrganization } from "@/lib/api/types";

export function AdminGovernmentOrganizationsPage() {
  const [items, setItems] = useState<GovernmentOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getGovernmentOrganizations(search)
      .then((results) => {
        if (!cancelled) setItems(results);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search]);

  return (
    <RecruiterAdminShell activeNav="government-organizations">
      <AdminPageCanvas>
        <div className="mb-stack-lg flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label-sm text-on-surface-variant">
              <Link href="/admin/jobs/government" className="hover:text-primary">
                Government Postings
              </Link>
              <span className="mx-2">/</span>
              <span className="text-secondary">Organizations</span>
            </p>
            <h1 className="text-headline-lg text-on-background">Government Organizations</h1>
            <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">
              Central registry for ministries, departments, and public sector bodies. Prevents
              duplicate names and groups vacancies under one entity.
            </p>
          </div>
          <Link
            href="/admin/government-organizations/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-label-bold text-on-primary"
          >
            <Icon name="add" />
            Register Organization
          </Link>
        </div>

        <div className="mb-stack-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations…"
            className="w-full max-w-md rounded-lg border border-outline-variant px-4 py-3 font-body-md outline-none focus:border-primary"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 font-label-bold text-on-surface-variant">Organization</th>
                <th className="px-4 py-3 font-label-bold text-on-surface-variant">Type</th>
                <th className="px-4 py-3 font-label-bold text-on-surface-variant">Parent</th>
                <th className="px-4 py-3 font-label-bold text-on-surface-variant">Vacancies</th>
                <th className="px-4 py-3 font-label-bold text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">
                    Loading registry…
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">
                    No organizations registered yet.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((item) => (
                  <tr key={item.id} className="border-b border-outline-variant/40 last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="font-label-bold text-on-surface">{item.name}</div>
                      {item.shortName && (
                        <div className="text-label-sm text-on-surface-variant">{item.shortName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-label-sm text-on-surface-variant">
                      {item.organizationType}
                    </td>
                    <td className="px-4 py-3 text-label-sm text-on-surface-variant">
                      {item.parent?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-label-sm text-on-surface-variant">
                      {item._count?.jobs ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/government-organizations/${item.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 font-label-bold text-primary transition-colors hover:bg-surface-container-low"
                      >
                        <Icon name="edit" className="text-[16px]" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}

export function AdminGovernmentOrganizationNewPage() {
  return (
    <RecruiterAdminShell activeNav="government-organizations">
      <AdminPageCanvas>
        <div className="mb-stack-lg">
          <p className="text-label-sm text-on-surface-variant">
            <Link href="/admin/government-organizations" className="hover:text-primary">
              Government Organizations
            </Link>
            <span className="mx-2">/</span>
            <span className="text-secondary">Register</span>
          </p>
          <h1 className="text-headline-lg text-on-background">Register Government Organization</h1>
          <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">
            Add an official ministry, department, or public sector body to the centralized registry.
          </p>
        </div>
        <GovernmentOrganizationForm />
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}

type AdminGovernmentOrganizationEditPageProps = {
  organizationId: string;
};

export function AdminGovernmentOrganizationEditPage({
  organizationId,
}: AdminGovernmentOrganizationEditPageProps) {
  return (
    <RecruiterAdminShell activeNav="government-organizations">
      <AdminPageCanvas>
        <div className="mb-stack-lg">
          <p className="text-label-sm text-on-surface-variant">
            <Link href="/admin/government-organizations" className="hover:text-primary">
              Government Organizations
            </Link>
            <span className="mx-2">/</span>
            <span className="text-secondary">Edit</span>
          </p>
          <h1 className="text-headline-lg text-on-background">Edit Government Organization</h1>
          <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">
            Update official details for this ministry, department, or public sector body.
          </p>
        </div>
        <GovernmentOrganizationForm organizationId={organizationId} />
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
