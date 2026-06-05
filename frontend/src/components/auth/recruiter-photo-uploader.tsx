"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  buildCompanyLogoDraft,
  type CompanyLogoDraft,
} from "@/lib/companies/company-logo";
import { cn } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,image/webp";

export type RecruiterPhotoDraft = CompanyLogoDraft;

export async function buildRecruiterPhotoDraft(file: File): Promise<RecruiterPhotoDraft> {
  return buildCompanyLogoDraft(file);
}

type RecruiterPhotoUploaderProps = {
  photo: RecruiterPhotoDraft | null;
  onChange: (photo: RecruiterPhotoDraft | null) => void;
  fallbackInitial?: string;
  disabled?: boolean;
  className?: string;
};

export function RecruiterPhotoUploader({
  photo,
  onChange,
  fallbackInitial = "R",
  disabled = false,
  className,
}: RecruiterPhotoUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (photo?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    };
  }, [photo?.previewUrl]);

  const clearPhoto = () => {
    setError(null);
    if (photo?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(photo.previewUrl);
    }
    onChange(null);
  };

  const setFile = (file: File | null) => {
    setError(null);
    if (!file) {
      clearPhoto();
      return;
    }

    void buildRecruiterPhotoDraft(file)
      .then((draft) => {
        if (photo?.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(photo.previewUrl);
        }
        onChange(draft);
      })
      .catch((err: Error) => setError(err.message));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length || disabled) return;
    setFile(files[0]);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-outline-variant bg-surface-container-high",
          isDragging && "border-secondary bg-secondary-container/20",
          photo && "border-solid border-secondary/40",
        )}
        onDragEnter={(e) => {
          e.preventDefault();
          dragDepth.current += 1;
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) {
            dragDepth.current = 0;
            setIsDragging(false);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          dragDepth.current = 0;
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
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

        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.previewUrl}
              alt="Profile photo"
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={clearPhoto}
              disabled={disabled}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-error shadow hover:bg-error hover:text-on-primary"
              aria-label="Remove profile photo"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </>
        ) : (
          <span className="text-4xl font-bold text-primary-container">{fallbackInitial}</span>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 font-label-bold text-primary transition-colors hover:bg-surface-container-low disabled:opacity-60"
        >
          <Icon name="add_a_photo" className="text-[18px]" />
          {photo ? "Change photo" : "Upload photo"}
        </button>
        <p className="text-label-sm text-on-surface-variant">
          PNG, JPG, or WebP · square image · 2MB max
        </p>
        {error ? <p className="text-label-sm text-error">{error}</p> : null}
      </div>
    </div>
  );
}
