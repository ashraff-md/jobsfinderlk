"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

type MediaSlotKey = "jobDocument" | "vacancyArtwork";

type SlotConfig = {
  key: MediaSlotKey;
  label: string;
  hint: string;
  accept: string;
  icon: string;
  emptyTitle: string;
};

const SLOTS: SlotConfig[] = [
  {
    key: "jobDocument",
    label: "Job document",
    hint: "PDF, DOC, DOCX, or image",
    accept: ".pdf,.doc,.docx,application/pdf,image/png,image/jpeg,image/webp",
    icon: "description",
    emptyTitle: "Add job pack",
  },
  {
    key: "vacancyArtwork",
    label: "Vacancy artwork",
    hint: "PNG, JPG, or WebP banner",
    accept: "image/png,image/jpeg,image/webp",
    icon: "image",
    emptyTitle: "Add artwork",
  },
];

type SlotPreview = {
  name: string;
  previewUrl: string | null;
};

type JobListingMediaUploaderProps = {
  jobDocumentName: string;
  vacancyArtworkName: string;
  onJobDocumentChange: (fileName: string) => void;
  onVacancyArtworkChange: (fileName: string) => void;
  disabled?: boolean;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function fileIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "picture_as_pdf";
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "article";
  return "description";
}

export function JobListingMediaUploader({
  jobDocumentName,
  vacancyArtworkName,
  onJobDocumentChange,
  onVacancyArtworkChange,
  disabled = false,
}: JobListingMediaUploaderProps) {
  const frameId = useId();
  const [activeDragSlot, setActiveDragSlot] = useState<MediaSlotKey | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Partial<Record<MediaSlotKey, SlotPreview>>>({});
  const previewsRef = useRef(previews);
  previewsRef.current = previews;

  const names: Record<MediaSlotKey, string> = {
    jobDocument: jobDocumentName,
    vacancyArtwork: vacancyArtworkName,
  };

  const onChange: Record<MediaSlotKey, (fileName: string) => void> = {
    jobDocument: onJobDocumentChange,
    vacancyArtwork: onVacancyArtworkChange,
  };

  const filledCount = SLOTS.filter((slot) => names[slot.key]).length;

  useEffect(() => {
    return () => {
      Object.values(previewsRef.current).forEach((preview) => {
        if (preview?.previewUrl) URL.revokeObjectURL(preview.previewUrl);
      });
    };
  }, []);

  const revokePreview = (key: MediaSlotKey) => {
    const existing = previews[key];
    if (existing?.previewUrl) URL.revokeObjectURL(existing.previewUrl);
  };

  const setFile = (key: MediaSlotKey, file: File | null) => {
    setSlotError(null);
    revokePreview(key);

    if (!file) {
      setPreviews((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      onChange[key]("");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setSlotError(`${file.name} exceeds the 5MB limit.`);
      return;
    }

    const preview: SlotPreview = {
      name: file.name,
      previewUrl: isImageFile(file) ? URL.createObjectURL(file) : null,
    };

    setPreviews((prev) => ({ ...prev, [key]: preview }));
    onChange[key](file.name);
  };

  const handleSlotFile = (key: MediaSlotKey, files: FileList | null) => {
    if (!files?.length || disabled) return;
    setFile(key, files[0]);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-2 border-dashed border-outline-variant",
        "bg-gradient-to-b from-surface-container-low to-surface-container-lowest",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant/40 bg-white/50 px-4 py-3 md:px-5">
        <div className="min-w-0">
          <p className="font-label-bold text-on-surface">Listing media</p>
          <p className="text-[11px] text-on-surface-variant">
            Optional files for your vacancy · cloud storage connects soon
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-surface-container-high px-2.5 py-1 text-[11px] font-bold text-on-surface-variant">
          {filledCount}/2
        </span>
      </div>

      {slotError && (
        <p className="border-b border-error/20 bg-error-container/30 px-4 py-2 text-label-sm text-on-error-container md:px-5">
          {slotError}
        </p>
      )}

      <div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-outline-variant/40">
        {SLOTS.map((slot) => (
          <MediaSlotCell
            key={slot.key}
            slot={slot}
            inputId={`${frameId}-${slot.key}`}
            fileName={names[slot.key]}
            preview={previews[slot.key]}
            isDragging={activeDragSlot === slot.key}
            disabled={disabled}
            onRemove={() => setFile(slot.key, null)}
            onDragActiveChange={(active) =>
              setActiveDragSlot(active ? slot.key : null)
            }
            onFiles={(files) => handleSlotFile(slot.key, files)}
          />
        ))}
      </div>
    </div>
  );
}

function MediaSlotCell({
  slot,
  inputId,
  fileName,
  preview,
  isDragging,
  disabled,
  onRemove,
  onDragActiveChange,
  onFiles,
}: {
  slot: SlotConfig;
  inputId: string;
  fileName: string;
  preview?: SlotPreview;
  isDragging: boolean;
  disabled?: boolean;
  onRemove: () => void;
  onDragActiveChange: (active: boolean) => void;
  onFiles: (files: FileList | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const hasFile = Boolean(fileName);

  const onDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current += 1;
    if (!disabled) onDragActiveChange(true);
  };

  const onDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      onDragActiveChange(false);
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
    onDragActiveChange(false);
    onFiles(event.dataTransfer.files);
  };

  return (
    <div
      className={cn(
        "relative p-4 md:p-5",
        isDragging && "bg-secondary-container/20",
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
        accept={slot.accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-label-bold text-on-surface">{slot.label}</p>
          <p className="text-[11px] text-on-surface-variant">{slot.hint}</p>
        </div>
        <Icon name={slot.icon} className="shrink-0 text-[22px] text-primary/70" />
      </div>

      {hasFile ? (
        <div className="relative overflow-hidden rounded-lg border border-outline-variant/80 bg-white shadow-sm">
          {preview?.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.previewUrl}
              alt={fileName}
              className="aspect-[16/10] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 bg-surface-container-low px-4 text-center">
              <Icon name={fileIcon(fileName)} className="text-[40px] text-primary" />
              <p className="line-clamp-2 text-label-sm font-label-bold text-on-surface">
                {fileName}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            disabled={disabled}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-error shadow hover:bg-error hover:text-on-primary"
            aria-label={`Remove ${slot.label}`}
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
            {isDragging ? "Drop file here" : slot.emptyTitle}
          </p>
          <p className="mt-1 text-[11px] text-on-surface-variant">or click to browse · 5MB max</p>
        </button>
      )}
    </div>
  );
}
