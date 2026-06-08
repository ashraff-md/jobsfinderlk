"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  isVacancyArtworkPdf,
  readVacancyArtworkFile,
  validateVacancyArtworkFile,
  VACANCY_ARTWORK_ACCEPT,
  type VacancyArtworkFile,
} from "@/lib/jobs/vacancy-artwork";
import { cn } from "@/lib/utils";

type JobListingMediaUploaderProps = {
  artwork: VacancyArtworkFile | null;
  onArtworkChange: (artwork: VacancyArtworkFile | null) => void;
  disabled?: boolean;
};

export function JobListingMediaUploader({
  artwork,
  onArtworkChange,
  disabled = false,
}: JobListingMediaUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isPdf = isVacancyArtworkPdf(artwork?.mimeType, artwork?.dataUrl);

  useEffect(() => {
    if (!artwork || isPdf) {
      setPreviewUrl(null);
      return;
    }
    setPreviewUrl(artwork.dataUrl);
    return () => {};
  }, [artwork, isPdf]);

  const clearFile = () => {
    setError(null);
    onArtworkChange(null);
  };

  const setFile = async (file: File | null) => {
    setError(null);

    if (!file) {
      onArtworkChange(null);
      return;
    }

    const validationError = validateVacancyArtworkFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      onArtworkChange(await readVacancyArtworkFile(file));
    } catch {
      setError("Failed to read the selected file.");
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length || disabled) return;
    void setFile(files[0]);
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

  const hasFile = Boolean(artwork);

  return (
    <div className="space-y-2">
      <div>
        <p className="font-label-bold text-on-surface">Vacancy artwork (optional)</p>
        <p className="text-[11px] text-on-surface-variant">
          PNG, JPG, WebP, or PDF for search and job detail pages
        </p>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-xl border-2 border-dashed border-outline-variant",
          "bg-gradient-to-b from-surface-container-low to-surface-container-lowest",
          isDragging && "border-secondary bg-secondary-container/20",
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
          accept={VACANCY_ARTWORK_ACCEPT}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {error && (
          <p className="border-b border-error/20 bg-error-container/30 px-4 py-2 text-label-sm text-on-error-container">
            {error}
          </p>
        )}

        <div className="p-4 md:p-5">
          {hasFile && artwork ? (
            <div className="relative overflow-hidden rounded-lg border border-outline-variant/80 bg-white shadow-sm">
              {isPdf ? (
                <div className="flex aspect-[16/10] flex-col items-center justify-center gap-3 bg-surface-container-low px-4 text-center">
                  <Icon name="picture_as_pdf" className="text-[48px] text-error" />
                  <p className="line-clamp-2 text-label-sm font-label-bold text-on-surface">
                    {artwork.name}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">PDF artwork attached</p>
                </div>
              ) : previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={artwork.name}
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 bg-surface-container-low px-4 text-center">
                  <Icon name="image" className="text-[40px] text-primary" />
                  <p className="line-clamp-2 text-label-sm font-label-bold text-on-surface">
                    {artwork.name}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={clearFile}
                disabled={disabled}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-error shadow hover:bg-error hover:text-on-primary"
                aria-label="Remove vacancy artwork"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => !disabled && inputRef.current?.click()}
              disabled={disabled}
              className={cn(
                "flex w-full flex-col items-center rounded-lg border-2 border-dashed px-4 py-10 text-center transition-all",
                isDragging
                  ? "border-secondary bg-secondary-container/30"
                  : "border-outline-variant/70 bg-white/30 hover:border-secondary hover:bg-white/50",
                disabled && "opacity-50",
              )}
            >
              <Icon
                name={isDragging ? "download" : "upload_file"}
                className={cn("text-[32px]", isDragging ? "text-secondary" : "text-primary/70")}
              />
              <p className="mt-3 font-label-bold text-on-surface">
                {isDragging ? "Drop file here" : "Add vacancy artwork"}
              </p>
              <p className="mt-1 text-[11px] text-on-surface-variant">
                Image or PDF · 5MB max
              </p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
