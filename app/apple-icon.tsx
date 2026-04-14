import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #0d0f1e 0%, #111327 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid rgba(99,102,241,0.4)",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 72,
            fontWeight: 700,
            color: "#818cf8",
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          {">"}_
        </span>
      </div>
    ),
    { ...size }
  );
}
