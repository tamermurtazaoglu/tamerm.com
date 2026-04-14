"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocaleToggle } from "@/components/providers/LocaleProvider";

interface Props {
  onOpenTerminal: () => void;
}

export default function Footer({ onOpenTerminal }: Props) {
  const t = useTranslations();
  const { locale, toggle } = useLocaleToggle();
  const [pulsing, setPulsing] = useState(false);

  const handleLangToggle = () => {
    toggle();
    setPulsing(true);
  };

  const TerminalBtn = (
    <button
      type="button"
      aria-label="Open terminal"
      onClick={onOpenTerminal}
      className="inline-flex items-center gap-[0.4em]
                 px-3 py-[0.22rem] rounded-full font-mono text-[0.68rem]
                 tracking-[0.04em] font-normal
                 text-[rgba(99,102,241,0.7)] bg-transparent
                 border border-[rgba(99,102,241,0.28)]
                 hover:text-[rgba(129,140,248,0.95)]
                 hover:border-[rgba(99,102,241,0.5)]
                 hover:bg-[rgba(99,102,241,0.08)]
                 hover:shadow-[0_0_12px_rgba(99,102,241,0.18)]
                 transition-[color,border-color,background,box-shadow] duration-200
                 focus-visible:outline-none focus-visible:ring-1
                 focus-visible:ring-[var(--accent)] active:scale-95"
    >
      <span aria-hidden="true">&gt;_</span>
      <span>{t("termTrigger")}</span>
    </button>
  );

  const LangBtn = (
    <button
      type="button"
      aria-label="Switch language / Dil değiştir"
      onClick={handleLangToggle}
      onAnimationEnd={() => setPulsing(false)}
      className={`flex items-center gap-1 text-[0.72rem] text-muted tracking-[0.07em]
                  hover:text-[var(--text)] transition-colors duration-200
                  focus-visible:outline-none focus-visible:ring-1
                  focus-visible:ring-[var(--accent)] rounded select-none
                  ${pulsing ? "lang-pulse" : ""}`}
    >
      <span className="font-medium text-[var(--text)]">{locale.toUpperCase()}</span>
      <span aria-hidden="true" className="opacity-40">/</span>
      <span>{locale === "en" ? "TR" : "EN"}</span>
    </button>
  );

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-[5] pointer-events-none">

      {/* ── Mobile: floating pill ── */}
      <div
        className="sm:hidden pointer-events-auto
                   flex items-center justify-between
                   mx-3 mb-3 px-4 py-2.5
                   rounded-2xl
                   bg-[rgba(8,10,20,0.82)] backdrop-blur-[20px]
                   border border-white/[0.08]
                   shadow-[0_4px_24px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)]
                   text-[0.72rem] text-muted tracking-[0.07em] select-none"
        style={{ marginBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <span className="opacity-40 text-[0.62rem]">© 2026</span>
        {TerminalBtn}
        {LangBtn}
      </div>

      {/* ── Desktop: single row with absolute anchors ── */}
      <div className="hidden sm:flex pointer-events-auto items-center justify-center
                      px-[clamp(2rem,12vw,14rem)] py-[1.1rem]
                      text-[0.72rem] text-muted tracking-[0.07em] select-none">
        <span className="absolute left-[clamp(2rem,12vw,14rem)]">
          © 2026 tamerm.com
        </span>
        {TerminalBtn}
        <div className="absolute right-[clamp(2rem,12vw,14rem)]">
          {LangBtn}
        </div>
      </div>

    </footer>
  );
}
