"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  buildCompanyLogoDraft,
  type CompanyLogoDraft,
} from "@/lib/companies/company-logo";
import { cn } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,image/webp";

const labelClass = "font-label-bold text-on-surface-variant";

type CompanyLogoUploaderProps = {
  logo: CompanyLogoDraft | null;
  onChange: (logo: CompanyLogoDraft | null) => void;
  disabled?: boolean;
  variant?: "default" | "compact" | "brand";
  className?: string;
};

export function CompanyLogoUploader({
  logo,
  onChange,
  disabled = false,
  variant = "default",
  className,
}: CompanyLogoUploaderProps) {
  const compact = variant === "compact";
  const brand = variant === "brand";
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (logo?.previewUrl) URL.revokeObjectURL(logo.previewUrl);
    };
  }, [logo?.previewUrl]);

  const clearLogo = () => {
    setError(null);
    if (logo?.previewUrl) URL.revokeObjectURL(logo.previewUrl);
    onChange(null);
  };

  const setFile = (file: File | null) => {
    setError(null);
    if (!file) {
      clearLogo();
      return;
    }

    void buildCompanyLogoDraft(file)
      .then((draft) => {
        if (logo?.previewUrl) URL.revokeObjectURL(logo.previewUrl);
        onChange(draft);
      })
      .catch((err: Error) => setError(err.message));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length || disabled) return;
    setFile(files[0]);
  };

  const onDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current += 1;
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = 0;
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const dropZone = (
    <div
      className={cn(
        "overflow-hidden rounded-lg border-2 border-dashed border-outline-variant",
        "bg-gradient-to-b from-surface-container-low to-surface-container-lowest",
        isDragging && "border-secondary bg-secondary-container/20",
        compact ? "size-full min-h-0" : "rounded-xl",
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {logo ? (
        <div className="relative size-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.previewUrl}
            alt={logo.name}
            className="size-full object-cover"
          />
          <button
            type="button"
            onClick={clearLogo}
            disabled={disabled}
            className={cn(
              "absolute flex items-center justify-center rounded-full bg-white/95 text-error shadow hover:bg-error hover:text-on-primary",
              compact ? "right-0.5 top-0.5 h-5 w-5" : "right-2 top-2 h-7 w-7",
            )}
            aria-label="Remove company logo"
          >
            <Icon name="close" className={compact ? "text-[12px]" : "text-[16px]"} />
          </button>
          {compact ? (
            <button
              type="button"
              onClick={() => !disabled && inputRef.current?.click()}
              disabled={disabled}
              className="absolute inset-0 cursor-pointer opacity-0 focus:opacity-100"
              aria-label="Replace company logo"
            />
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled}
          title="Upload company logo (optional)"
          className={cn(
            "flex size-full flex-col items-center justify-center text-center transition-all",
            isDragging
              ? "border-secondary bg-secondary-container/30"
              : "hover:border-secondary hover:bg-white/50",
            disabled && "opacity-50",
            !compact && "rounded-lg border-2 border-dashed border-outline-variant/70 bg-white/30 px-4 py-10",
          )}
        >
          <Icon
            name={compact ? "add_photo_alternate" : isDragging ? "download" : "upload_file"}
            className={cn(
              compact ? "text-[28px] text-primary/70" : "text-[32px]",
              isDragging && !compact && "text-secondary",
            )}
          />
          {!compact && (
            <>
              <p className="mt-3 font-label-bold text-on-surface">
                {isDragging ? "Drop logo here" : "Upload company logo"}
              </p>
              <p className="mt-1 text-[11px] text-on-surface-variant">or click to browse</p>
            </>
          )}
        </button>
      )}
    </div>
  );

  if (brand) {
    return (
      <div
        className={cn(
          "flex w-full min-w-0 flex-col items-start gap-stack-lg md:flex-row md:items-center",
          className,
        )}
      >
        <div className="group relative h-32 w-32 shrink-0">
          <div
            className={cn(
              "flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-outline-variant bg-surface-container transition-all",
              "group-hover:border-secondary",
              logo && "border-solid",
              isDragging && "border-secondary bg-secondary-container/30",
            )}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            {logo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.previewUrl}
                  alt={logo.name}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearLogo();
                  }}
                  disabled={disabled}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-error shadow hover:bg-error hover:text-on-primary"
                  aria-label="Remove company logo"
                >
                  <Icon name="close" className="text-[14px]" />
                </button>
              </>
            ) : (
              <>
                <Icon name="add_photo_alternate" className="mb-1 text-4xl text-outline" />
                <span className="text-[10px] font-bold uppercase text-outline">
                  Upload Logo
                </span>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPT}
            disabled={disabled}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 font-label-bold text-label-bold text-on-surface">Company Logo</h3>
          <p className="mb-stack-md font-label-sm text-label-sm text-on-surface-variant">
            Recommended size: 400×400px. PNG, JPG, or WebP for sharp display on job listings.
          </p>
          <button
            type="button"
            onClick={() => !disabled && inputRef.current?.click()}
            disabled={disabled}
            className="rounded border border-primary px-4 py-2 font-label-bold text-label-sm text-primary transition-colors hover:bg-surface-container-low"
          >
            Choose File
          </button>
          {error && <p className="mt-2 font-label-sm text-error">{error}</p>}
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          "flex h-full min-h-0 w-full shrink-0 flex-col gap-2",
          className,
        )}
      >
        <label className={labelClass} htmlFor={inputId}>
          Logo <span className="font-normal">(optional)</span>
        </label>
        <div className="flex min-h-0 flex-1 items-stretch justify-end">
          <div className="aspect-square h-full min-h-0 max-h-full w-auto">{dropZone}</div>
        </div>
        {error && (
          <p className="text-right text-[10px] leading-tight text-error">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="font-label-bold text-on-surface">Company logo</p>
        <p className="text-[11px] text-on-surface-variant">
          Optional · PNG, JPG, or WebP · square image works best · 2MB max
        </p>
      </div>
      {error && (
        <p className="rounded-lg border border-error/20 bg-error-container/30 px-4 py-2 text-label-sm text-on-error-container">
          {error}
        </p>
      )}
      {dropZone}
      {logo && !compact && (
        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled}
          className="text-label-sm font-label-bold text-primary hover:underline disabled:opacity-50"
        >
          Replace logo
        </button>
      )}
    </div>
  );
}
