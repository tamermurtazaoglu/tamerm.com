import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#0d0f1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(99,102,241,0.35)",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: 700,
            color: "#818cf8",
            letterSpacing: "-0.5px",
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
