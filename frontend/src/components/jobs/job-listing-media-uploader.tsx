"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

type JobListingMediaUploaderProps = {
  vacancyArtworkName: string;
  onVacancyArtworkChange: (fileName: string) => void;
  disabled?: boolean;
};

export function JobListingMediaUploader({
  vacancyArtworkName,
  onVacancyArtworkChange,
  disabled = false,
}: JobListingMediaUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearFile = () => {
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onVacancyArtworkChange("");
  };

  const setFile = (file: File | null) => {
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    if (!file) {
      onVacancyArtworkChange("");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setError(`${file.name} exceeds the 5MB limit.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Vacancy artwork must be a PNG, JPG, or WebP image.");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    onVacancyArtworkChange(file.name);
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

  const hasFile = Boolean(vacancyArtworkName);

  return (
    <div className="space-y-2">
      <div>
        <p className="font-label-bold text-on-surface">Vacancy artwork (optional)</p>
        <p className="text-[11px] text-on-surface-variant">
          PNG, JPG, or WebP banner for search and job detail pages
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
          accept="image/png,image/jpeg,image/webp"
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
          {hasFile ? (
            <div className="relative overflow-hidden rounded-lg border border-outline-variant/80 bg-white shadow-sm">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={vacancyArtworkName}
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 bg-surface-container-low px-4 text-center">
                  <Icon name="image" className="text-[40px] text-primary" />
                  <p className="line-clamp-2 text-label-sm font-label-bold text-on-surface">
                    {vacancyArtworkName}
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
                {isDragging ? "Drop image here" : "Add vacancy artwork"}
              </p>
              <p className="mt-1 text-[11px] text-on-surface-variant">or click to browse · 5MB max</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
