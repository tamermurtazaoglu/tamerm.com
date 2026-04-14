"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const IST_TZ = "Europe/Istanbul";

function getUtcOffset(tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
  }).formatToParts(new Date());
  const tzName = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  const m = tzName.match(/GMT([+-])(\d+)(?::(\d+))?/);
  if (!m) return 0;
  return (m[1] === "+" ? 1 : -1) * (parseInt(m[2]) + parseInt(m[3] ?? "0") / 60);
}

function wmoEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  return "⛈️";
}

type StatusKey =
  | "night" | "early" | "mornWork" | "mornWknd"
  | "lunch" | "aftnWork" | "aftnWknd" | "evening" | "lateNight";

const STATUS_EMOJI: Record<StatusKey, string> = {
  night: "🌙", early: "🌅",
  mornWork: "💻", mornWknd: "🌿",
  lunch: "🍽️",
  aftnWork: "💻", aftnWknd: "🌿",
  evening: "🌆", lateNight: "🌃",
};

function getStatusKey(hour: number, isWeekend: boolean): StatusKey {
  if (hour < 6)  return "night";
  if (hour < 9)  return "early";
  if (hour < 12) return isWeekend ? "mornWknd" : "mornWork";
  if (hour < 14) return "lunch";
  if (hour < 18) return isWeekend ? "aftnWknd" : "aftnWork";
  if (hour < 21) return "evening";
  return "lateNight";
}

/** Top-right pinned HUD card — Istanbul live clock, weather & visitor timezone */
export default function VisitorCard() {
  const t = useTranslations("ctx");
  const [ready, setReady] = useState(false);
  const [istTime, setIstTime] = useState("──:──");
  const [statusKey, setStatusKey] = useState<StatusKey>("night");
  const [weather, setWeather] = useState<string | null>(null);
  const [visitorHtml, setVisitorHtml] = useState("");

  // Delayed entrance — let the hero animate first
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 2800);
    return () => clearTimeout(id);
  }, []);

  // Fetch weather once
  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast" +
        "?latitude=41.0082&longitude=28.9784" +
        "&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul"
    )
      .then((r) => r.json())
      .then((d) => {
        const temp  = Math.round(d.current.temperature_2m as number);
        const emoji = wmoEmoji(d.current.weather_code as number);
        setWeather(`${emoji} ${temp}°`);
      })
      .catch(() => {});
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();

      setIstTime(
        now.toLocaleTimeString("tr-TR", {
          hour: "2-digit", minute: "2-digit", timeZone: IST_TZ,
        })
      );

      const hour = parseInt(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric", hour12: false, timeZone: IST_TZ,
        }).format(now)
      );
      const day = new Intl.DateTimeFormat("en-US", {
        weekday: "long", timeZone: IST_TZ,
      }).format(now);
      setStatusKey(getStatusKey(hour, day === "Saturday" || day === "Sunday"));

      const visitorTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const locTime   = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      const diff      = getUtcOffset(IST_TZ) - getUtcOffset(visitorTZ);

      if (diff === 0) {
        setVisitorHtml(`${t("sameZone")} 👋`);
      } else {
        const sign  = diff > 0 ? "+" : "";
        const label = diff > 0 ? t("aheadLabel") : t("behindLabel");
        setVisitorHtml(
          `${label} <strong style="color:var(--text)">${locTime}</strong>` +
          `<span style="display:block;margin-top:1px;font-size:0.67rem;opacity:.55">${sign}${diff}h from Istanbul</span>`
        );
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [t]);

  return (
    <>
      {/* ── Mobile: compact pill ── */}
      <motion.aside
        aria-label="Istanbul timezone info"
        initial={{ opacity: 0, x: 12, y: -4 }}
        animate={ready ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 12, y: -4 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="block sm:hidden fixed top-4 right-4 z-[6]
                   flex items-center gap-2
                   px-3 py-[0.35rem] rounded-full
                   bg-[rgba(8,10,20,0.78)] border border-white/[0.08]
                   backdrop-blur-[20px]
                   shadow-[0_4px_16px_rgba(0,0,0,0.35)]"
      >
        <span aria-hidden="true" className="text-[0.82rem] leading-none">
          {STATUS_EMOJI[statusKey]}
        </span>
        <span
          className="font-mono text-[0.72rem] font-semibold text-[var(--text)] tracking-[0.04em] leading-none"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          {istTime}
        </span>
        <span
          aria-label="Live"
          className="w-[5px] h-[5px] rounded-full bg-[#22c55e] flex-shrink-0
                     shadow-[0_0_5px_#22c55e] animate-pulse-dot"
        />
      </motion.aside>

      {/* ── Desktop: full card ── */}
    <motion.aside
      aria-label="Istanbul timezone info"
      initial={{ opacity: 0, x: 20, y: -6 }}
      animate={ready ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 20, y: -6 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="hidden sm:block fixed top-5 right-5 z-[6] w-[11.5rem]
                 rounded-2xl overflow-hidden
                 bg-[rgba(8,10,20,0.68)] border border-white/[0.07]
                 backdrop-blur-[20px]
                 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
    >
      {/* Accent gradient bar */}
      <div
        aria-hidden="true"
        className="h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, var(--accent) 0%, rgba(167,139,250,0.7) 55%, transparent 100%)",
        }}
      />

      <div className="px-3.5 pt-3 pb-3.5 space-y-2.5">

        {/* Row 1 — location + weather */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[0.7rem] font-medium text-[var(--text)] tracking-wide">
            <span aria-hidden="true">📍</span>
            İstanbul
          </span>
          <span className="text-[0.68rem] text-muted">
            {weather ?? "···"}
          </span>
        </div>

        {/* Row 2 — large time + live dot */}
        <div className="flex items-center gap-2">
          <span
            className="text-[1.55rem] font-mono font-semibold text-[var(--text)] tracking-[0.06em] leading-none"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {istTime}
          </span>
          <span
            aria-label="Live"
            className="w-[6px] h-[6px] rounded-full bg-[#22c55e] flex-shrink-0
                       shadow-[0_0_6px_#22c55e] animate-pulse-dot"
          />
        </div>

        {/* Row 3 — status */}
        <p className="text-[0.68rem] text-muted leading-none">
          {STATUS_EMOJI[statusKey]}&nbsp;{t(statusKey)}
        </p>

        {/* Divider */}
        <div className="h-px bg-white/[0.06]" />

        {/* Row 4 — visitor timezone */}
        <p
          className="text-[0.68rem] text-muted leading-snug"
          dangerouslySetInnerHTML={{ __html: visitorHtml }}
        />

      </div>
    </motion.aside>
    </>
  );
}
