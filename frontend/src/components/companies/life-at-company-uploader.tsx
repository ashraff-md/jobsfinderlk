"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  MAX_LIFE_AT_IMAGES,
  type LifeAtImageDraft,
} from "@/lib/companies/life-at-images";
import { cn } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

type LifeAtCompanyUploaderProps = {
  images: LifeAtImageDraft[];
  onAdd: (files: FileList | null) => void | Promise<void>;
  onRemove: (id: string) => void;
  maxImages?: number;
  disabled?: boolean;
};

export function LifeAtCompanyUploader({
  images,
  onAdd,
  onRemove,
  maxImages = MAX_LIFE_AT_IMAGES,
  disabled = false,
}: LifeAtCompanyUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const atLimit = images.length >= maxImages;
  const slotsRemaining = maxImages - images.length;
  const isEmpty = images.length === 0;

  const openPicker = () => {
    if (!atLimit && !disabled) inputRef.current?.click();
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length || atLimit || disabled) return;
      void onAdd(files);
    },
    [atLimit, disabled, onAdd],
  );

  const onDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current += 1;
    if (!atLimit && !disabled) setIsDragging(true);
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

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200",
        "bg-gradient-to-b from-surface-container-low to-surface-container-lowest",
        isDragging
          ? "border-secondary bg-secondary-container/25 shadow-md"
          : "border-outline-variant",
        !atLimit && !disabled && "hover:border-secondary/50",
        disabled && "opacity-50",
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
        multiple
        disabled={atLimit || disabled}
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex items-center justify-between gap-3 border-b border-outline-variant/40 bg-white/50 px-4 py-3 md:px-5">
        <div className="min-w-0">
          <p className="font-label-bold text-on-surface">Life at company photos</p>
          <p className="text-[11px] text-on-surface-variant">
            {atLimit
              ? "Maximum reached — remove a photo to replace"
              : isEmpty
                ? "Drag photos here or click to add"
                : `${slotsRemaining} more allowed · drag anywhere to add`}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
            atLimit
              ? "bg-secondary-container text-on-secondary-container"
              : "bg-surface-container-high text-on-surface-variant",
          )}
        >
          {images.length}/{maxImages}
        </span>
      </div>

      <div className="p-4 md:p-5">
        {isEmpty ? (
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className="flex w-full flex-col items-center rounded-lg px-4 py-12 text-center transition-colors hover:bg-white/40 md:py-16"
          >
            <div
              className={cn(
                "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
                isDragging ? "bg-secondary text-on-secondary" : "bg-primary/8 text-primary",
              )}
            >
              <Icon
                name={isDragging ? "download" : "add_photo_alternate"}
                className="text-[30px]"
              />
            </div>
            <p className="font-label-bold text-on-surface">
              {isDragging ? "Drop to upload" : "Add workplace photos"}
            </p>
            <p className="mt-1 max-w-sm text-label-sm text-on-surface-variant">
              Office, team events, or culture moments — PNG, JPG, WebP, GIF up to 2MB each
            </p>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image, index) => (
              <figure
                key={image.id}
                className="group relative overflow-hidden rounded-lg border border-outline-variant/80 bg-white shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.previewUrl}
                  alt={image.name}
                  className="aspect-[4/3] w-full object-cover"
                />
                <span className="absolute left-1.5 top-1.5 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-bold text-on-primary">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(image.id);
                  }}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-error shadow hover:bg-error hover:text-on-primary"
                  aria-label={`Remove ${image.name}`}
                >
                  <Icon name="close" className="text-[16px]" />
                </button>
              </figure>
            ))}

            {!atLimit &&
              Array.from({ length: Math.min(slotsRemaining, 3) }).map((_, i) => (
                <button
                  key={`slot-${i}`}
                  type="button"
                  onClick={openPicker}
                  disabled={disabled}
                  className={cn(
                    "flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-all",
                    i === 0 && isDragging
                      ? "border-secondary bg-secondary-container/30 text-secondary"
                      : "border-outline-variant/70 bg-white/30 text-on-surface-variant hover:border-secondary hover:bg-white/60 hover:text-secondary",
                  )}
                >
                  <Icon name={i === 0 ? "add_photo_alternate" : "add"} className="text-[28px]" />
                  {i === 0 && (
                    <span className="text-[11px] font-label-bold">
                      {isDragging ? "Drop here" : "Add photo"}
                    </span>
                  )}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
