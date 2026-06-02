export const MAX_LIFE_AT_IMAGES = 6;
export const MAX_LIFE_AT_IMAGE_BYTES = 2 * 1024 * 1024;

export type LifeAtImageDraft = {
  id: string;
  name: string;
  previewUrl: string;
  dataUrl: string;
};

export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read image file."));
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

export async function buildLifeAtImageDrafts(files: FileList | File[]) {
  const list = Array.from(files);
  const drafts: LifeAtImageDraft[] = [];

  for (const file of list) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`${file.name} is not an image file.`);
    }
    if (file.size > MAX_LIFE_AT_IMAGE_BYTES) {
      throw new Error(`${file.name} exceeds the 2MB size limit.`);
    }
    const dataUrl = await readImageAsDataUrl(file);
    drafts.push({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      dataUrl,
    });
  }

  return drafts;
}
