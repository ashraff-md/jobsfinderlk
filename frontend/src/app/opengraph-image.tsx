import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "JobsFinder.lk — Find jobs in Sri Lanka";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background: "linear-gradient(135deg, #0a1133 0%, #12193b 50%, #1e3a5f 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          JobsFinder.lk
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "#c8d4f0",
            maxWidth: 800,
            lineHeight: 1.3,
          }}
        >
          Find jobs in Sri Lanka. Apply online. Hire top talent.
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 20,
            color: "#7dd3fc",
            fontWeight: 600,
          }}
        >
          jobsfinder.lk
        </div>
      </div>
    ),
    { ...size },
  );
}
