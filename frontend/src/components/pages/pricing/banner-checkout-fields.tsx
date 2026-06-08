"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { buildBannerArtworkDraft } from "@/lib/platform-ads/banner-artwork";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-bright p-stack-md font-body-md text-body-md outline-none focus:border-primary focus:shadow-[0_0_0_1px_#0d1c2e]";

type BannerCheckoutFieldsProps = {
  aspect: "wide" | "tall";
  campaignName: string;
  onCampaignNameChange: (value: string) => void;
  destinationPath: string;
  onDestinationPathChange: (value: string) => void;
  artworkPreview: string | null;
  onArtworkChange: (dataUrl: string | null, previewUrl: string | null) => void;
  error: string | null;
  onError: (message: string | null) => void;
};

export function BannerCheckoutFields({
  aspect,
  campaignName,
  onCampaignNameChange,
  destinationPath,
  onDestinationPathChange,
  artworkPreview,
  onArtworkChange,
  error,
  onError,
}: BannerCheckoutFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const onArtworkFile = async (file: File) => {
    onError(null);
    try {
      const draft = await buildBannerArtworkDraft(file, aspect);
      onArtworkChange(draft.dataUrl, draft.previewUrl);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not process banner image.");
    }
  };

  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg">
      <div className="mb-stack-lg flex items-center gap-stack-md">
        <Icon name="image" className="text-secondary" />
        <h2 className="font-headline-md text-headline-md">Banner Creative</h2>
      </div>

      {error && (
        <p className="mb-stack-md rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-body-sm text-error">
          {error}
        </p>
      )}

      <div className="space-y-stack-md">
        <label className="block space-y-2">
          <span className="font-label-bold text-label-bold">Campaign name</span>
          <input
            className={inputClass}
            placeholder="e.g., Q2 Graduate Recruitment"
            type="text"
            value={campaignName}
            onChange={(e) => onCampaignNameChange(e.target.value)}
          />
        </label>

        <div>
          <span className="mb-2 block font-label-bold text-label-bold">Banner artwork</span>
          <div
            role="button"
            tabIndex={0}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) void onArtworkFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant p-8 transition-colors hover:bg-surface-container-low",
              dragOver && "border-secondary bg-secondary/5",
            )}
          >
            <Icon name="cloud_upload" className="mb-3 text-4xl text-outline" />
            <p className="font-label-bold text-label-bold">Upload your banner image</p>
            <p className="mt-1 text-center text-label-sm text-on-surface-variant">
              {aspect === "wide"
                ? "3×2 ratio recommended (e.g. 1200×800px). JPEG, PNG, or WebP up to 5MB."
                : "2×5 ratio recommended. JPEG, PNG, or WebP up to 5MB."}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onArtworkFile(file);
              }}
            />
          </div>
          {artworkPreview && (
            <div
              className={cn(
                "relative mt-4 max-w-md overflow-hidden rounded-lg border border-outline-variant",
                aspect === "wide" ? "aspect-[3/2]" : "aspect-[2/5]",
              )}
            >
              <Image src={artworkPreview} alt="Banner preview" fill className="object-cover" unoptimized />
            </div>
          )}
        </div>

        <label className="block space-y-2">
          <span className="font-label-bold text-label-bold">Destination URL</span>
          <input
            className={inputClass}
            placeholder="https://yourcompany.com/careers or /jobs"
            type="text"
            value={destinationPath}
            onChange={(e) => onDestinationPathChange(e.target.value)}
          />
          <p className="text-label-sm text-on-surface-variant">
            Internal pages (e.g. /jobs) or external HTTPS links are supported.
          </p>
        </label>
      </div>
    </section>
  );
}

type GuestContactFieldsProps = {
  fullName: string;
  onFullNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  company: string;
  onCompanyChange: (value: string) => void;
  address: string;
  onAddressChange: (value: string) => void;
};

export function GuestContactFields({
  fullName,
  onFullNameChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  company,
  onCompanyChange,
  address,
  onAddressChange,
}: GuestContactFieldsProps) {
  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-stack-lg">
      <div className="mb-stack-lg flex items-center gap-stack-md">
        <Icon name="person" className="text-secondary" />
        <div>
          <h2 className="font-headline-md text-headline-md">Your Contact Details</h2>
          <p className="text-label-sm text-on-surface-variant">
            No account required. We&apos;ll use these details to confirm your banner placement.
          </p>
        </div>
      </div>
      <form className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="block font-label-bold text-label-bold">Full name</label>
          <input
            className={inputClass}
            placeholder="Alex Silva"
            type="text"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block font-label-bold text-label-bold">Email address</label>
          <input
            className={inputClass}
            placeholder="alex@company.lk"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block font-label-bold text-label-bold">Phone number</label>
          <input
            className={inputClass}
            placeholder="+94 77 123 4567"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block font-label-bold text-label-bold">
            Company / Organization{" "}
            <span className="font-normal text-on-surface-variant">(Optional)</span>
          </label>
          <input
            className={inputClass}
            placeholder="Acme Corp"
            type="text"
            value={company}
            onChange={(e) => onCompanyChange(e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block font-label-bold text-label-bold">Address</label>
          <input
            className={inputClass}
            placeholder="Street, Building, City"
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
          />
        </div>
      </form>
    </section>
  );
}
