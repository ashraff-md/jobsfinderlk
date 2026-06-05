export const MAX_BANNER_BYTES = 5 * 1024 * 1024;

export type BannerArtworkDraft = {
  name: string;
  previewUrl: string;
  dataUrl: string;
};

type BannerArtworkOptions = {
  maxWidth: number;
  maxHeight: number;
};

const WIDE_BANNER_BOUNDS = { maxWidth: 1200, maxHeight: 800 };
const TALL_BANNER_BOUNDS = { maxWidth: 480, maxHeight: 1200 };

export function bannerArtworkBounds(
  variant: "wide" | "tall",
): BannerArtworkOptions {
  return variant === "wide" ? WIDE_BANNER_BOUNDS : TALL_BANNER_BOUNDS;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image file."));
    };
    img.src = url;
  });
}

async function optimizeBannerImage(
  file: File,
  bounds: BannerArtworkOptions,
): Promise<{ dataUrl: string; previewUrl: string }> {
  const img = await loadImageFromFile(file);
  const scale = Math.min(
    1,
    bounds.maxWidth / img.width,
    bounds.maxHeight / img.height,
  );
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image file.");

  ctx.drawImage(img, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
  const blob = await fetch(dataUrl).then((res) => res.blob());
  return {
    dataUrl,
    previewUrl: URL.createObjectURL(blob),
  };
}

export async function buildBannerArtworkDraft(
  file: File,
  variant: "wide" | "tall",
): Promise<BannerArtworkDraft> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not an image file.`);
  }
  if (file.size > MAX_BANNER_BYTES) {
    throw new Error(`${file.name} exceeds the 5MB size limit.`);
  }

  const optimized = await optimizeBannerImage(file, bannerArtworkBounds(variant));
  return {
    name: file.name,
    previewUrl: optimized.previewUrl,
    dataUrl: optimized.dataUrl,
  };
}
