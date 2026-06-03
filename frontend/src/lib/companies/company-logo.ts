export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export type CompanyLogoDraft = {
  name: string;
  previewUrl: string;
  dataUrl: string;
};

export async function buildCompanyLogoDraft(file: File): Promise<CompanyLogoDraft> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not an image file.`);
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error(`${file.name} exceeds the 2MB size limit.`);
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read image file."));
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });

  return {
    name: file.name,
    previewUrl: URL.createObjectURL(file),
    dataUrl,
  };
}
