import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#080a14",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 100px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle gradient glow */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          }}
        />

        {/* >_ badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.35)",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 20,
              fontFamily: "monospace",
              color: "#818cf8",
              fontWeight: 700,
            }}
          >
            {">"}_
          </div>
          <div style={{ display: "flex", fontSize: 18, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
            tamerm.com
          </div>
        </div>

        {/* Name */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "#f1f5f9",
            lineHeight: 1.05,
            letterSpacing: "-1px",
            marginBottom: 20,
          }}
        >
          Tamer Murtazaoğlu
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#818cf8",
            fontWeight: 500,
            marginBottom: 32,
          }}
        >
          Software Engineer
        </div>

        {/* Stack pills */}
        <div style={{ display: "flex", gap: 12 }}>
          {["Java & Spring Boot", "Backend", "CI/CD", "Istanbul"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                padding: "6px 16px",
                fontSize: 16,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #6366f1 0%, rgba(167,139,250,0.6) 50%, transparent 100%)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
