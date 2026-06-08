export const VACANCY_ARTWORK_MAX_BYTES = 5 * 1024 * 1024;

export const VACANCY_ARTWORK_ACCEPT =
  "image/png,image/jpeg,image/webp,application/pdf";

export type VacancyArtworkFile = {
  name: string;
  dataUrl: string;
  mimeType: string;
};

export function isVacancyArtworkPdf(
  mimeType?: string | null,
  url?: string | null,
): boolean {
  if (mimeType === "application/pdf") return true;
  if (!url) return false;
  return /\.pdf($|\?|#)/i.test(url);
}

export function readVacancyArtworkFile(file: File): Promise<VacancyArtworkFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) {
        reject(new Error("Failed to read file."));
        return;
      }
      resolve({
        name: file.name,
        dataUrl,
        mimeType: file.type,
      });
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export function validateVacancyArtworkFile(file: File): string | null {
  if (file.size > VACANCY_ARTWORK_MAX_BYTES) {
    return `${file.name} exceeds the 5MB limit.`;
  }

  const allowed =
    file.type.startsWith("image/") || file.type === "application/pdf";
  if (!allowed) {
    return "Vacancy artwork must be a PNG, JPG, WebP image, or PDF.";
  }

  return null;
}
