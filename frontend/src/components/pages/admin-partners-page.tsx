"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { PartnerFormModal } from "@/components/admin/partner-form-modal";
import { AdminPageCanvas, RecruiterAdminShell } from "@/components/layout/recruiter-admin-shell";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { getAdminPartners } from "@/lib/api/admin";
import { signInPath } from "@/lib/auth/portal";
import type { PlatformPartner } from "@/lib/api/types";

function formatWebsiteLabel(website: string) {
  return website.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function AdminPartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<PlatformPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PlatformPartner | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPartners = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter((partner) => {
      const screenText = partner.screenText?.trim() ?? "";
      return (
        partner.name.toLowerCase().includes(q) ||
        screenText.toLowerCase().includes(q) ||
        (partner.website ?? "").toLowerCase().includes(q)
      );
    });
  }, [partners, searchQuery]);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      router.push(signInPath("admin"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setPartners(await getAdminPartners());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(signInPath("admin"));
        return;
      }
      setPartners([]);
      setError(err instanceof ApiError ? err.message : "Failed to load partners.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreateModal = () => {
    setEditingPartner(null);
    setModalOpen(true);
  };

  const openEditModal = (partner: PlatformPartner) => {
    setEditingPartner(partner);
    setModalOpen(true);
  };

  return (
    <RecruiterAdminShell activeNav="partners">
      <AdminPageCanvas className="md:px-margin-desktop">
        <div className="mb-stack-lg flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-headline-lg tracking-tight text-primary">Partners</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Onboard and manage partner organizations shown across the platform.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 font-label-bold text-on-primary shadow-lg shadow-primary/10 transition-opacity hover:opacity-90"
          >
            <Icon name="domain_add" filled />
            Onboard New Partner
          </button>
        </div>

        {error && (
          <p className="mb-6 rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-label-sm text-error">
            {error}
          </p>
        )}

        <AdminFilterBar
          className="mb-6"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search partners…"
          showClear={searchQuery.trim().length > 0}
          onClear={() => setSearchQuery("")}
        />

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-bright px-6 py-5">
            <h2 className="font-label-bold uppercase tracking-wider text-on-surface">
              Partner directory
            </h2>
            <span className="rounded-full bg-secondary-container/20 px-3 py-1 text-label-sm font-label-bold text-secondary">
              {loading ? "…" : `${filteredPartners.length} shown`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="px-6 py-4 text-label-sm uppercase tracking-widest text-on-surface-variant">
                    Company name
                  </th>
                  <th className="px-6 py-4 text-label-sm uppercase tracking-widest text-on-surface-variant">
                    Screen text
                  </th>
                  <th className="px-6 py-4 text-label-sm uppercase tracking-widest text-on-surface-variant">
                    Website
                  </th>
                  <th className="w-[80px] px-3 py-4 text-right text-label-sm uppercase tracking-widest text-on-surface-variant">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">
                      Loading partners…
                    </td>
                  </tr>
                ) : filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">
                      {partners.length === 0
                        ? 'No partners yet. Click "Onboard New Partner" to add one.'
                        : "No partners match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((partner) => (
                    <tr key={partner.id} className="transition-colors hover:bg-surface-container-low">
                      <td className="px-6 py-5">
                        <p className="font-label-bold text-primary">{partner.name}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-label-bold tracking-wide text-on-surface">
                          {partner.screenText?.trim() || partner.name}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        {partner.website ? (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-label-bold text-secondary hover:underline"
                          >
                            {formatWebsiteLabel(partner.website)}
                          </a>
                        ) : (
                          <span className="text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="w-[80px] px-3 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(partner)}
                          aria-label={`Edit ${partner.name}`}
                          title="Edit"
                          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-outline-variant/20 hover:text-secondary"
                        >
                          <Icon name="edit" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <PartnerFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingPartner(null);
          }}
          onSaved={() => void load()}
          partner={editingPartner}
        />
      </AdminPageCanvas>
    </RecruiterAdminShell>
  );
}
