import { LOGO_URL } from "@/lib/assets";

const LOGO_FILL = "#0c1538";

function normalizeLogoSvg(svgText: string) {
  return svgText
    .replace(/<style>[\s\S]*?<\/style>/i, "")
    .replace(/\sclass="st0"/g, "")
    .replace(/\sclass="st1"/g, ` fill="${LOGO_FILL}"`)
    .replace(/\sclass="st2"/g, ' style="display:none"');
}

function svgToDataUrl(svgText: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

function rasterizeImage(src: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to rasterize logo"));
    img.src = src;
  });
}

/** Loads logo.svg and returns a PNG data URL for reliable PDF/html2canvas rendering. */
export async function loadLogoDataUrl(size = 120): Promise<string> {
  const path = LOGO_URL.startsWith("/") ? LOGO_URL : `/${LOGO_URL}`;
  const url = `${window.location.origin}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to load logo");
  }

  const svgText = normalizeLogoSvg(await response.text());
  return rasterizeImage(svgToDataUrl(svgText), size);
}
