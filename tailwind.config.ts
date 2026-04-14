import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#030712",
        accent: "#6366f1",
        "accent-dim": "rgba(99,102,241,0.12)",
        "accent-border": "rgba(99,102,241,0.28)",
        "accent-glow": "rgba(99,102,241,0.45)",
        surface: "rgba(255,255,255,0.03)",
        "surface-border": "rgba(255,255,255,0.08)",
        muted: "#64748b",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-montserrat)", "var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "'Fira Code'", "monospace"],
      },
      animation: {
        "pulse-dot": "pulse-dot 2.2s ease-in-out infinite",
        blink: "blink 1.1s step-end infinite",
        grain: "grain 7s steps(8) infinite",
        "amb-drift-a": "amb-drift-a 20s ease-in-out infinite alternate",
        "amb-drift-b": "amb-drift-b 26s ease-in-out infinite alternate",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 7px #22c55e" },
          "50%": { opacity: "0.55", boxShadow: "0 0 3px #22c55e" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        grain: {
          "0%":   { transform: "translate(0, 0)" },
          "14%":  { transform: "translate(-2%, 3%)" },
          "28%":  { transform: "translate(3%, -2%)" },
          "42%":  { transform: "translate(-1%, 4%)" },
          "57%":  { transform: "translate(4%, -1%)" },
          "71%":  { transform: "translate(-3%, 2%)" },
          "85%":  { transform: "translate(2%, -4%)" },
          "100%": { transform: "translate(0, 0)" },
        },
        "amb-drift-a": {
          "0%":   { transform: "translate(0, 0) scale(1)" },
          "50%":  { transform: "translate(5%, 7%) scale(1.12)" },
          "100%": { transform: "translate(9%, 3%) scale(1.22)" },
        },
        "amb-drift-b": {
          "0%":   { transform: "translate(0, 0) scale(1)" },
          "50%":  { transform: "translate(-6%, -4%) scale(1.10)" },
          "100%": { transform: "translate(-4%, -10%) scale(1.18)" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
