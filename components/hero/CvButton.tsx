"use client";

import { useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

interface Props {
  onOpen: () => void;
}

const SPRING = "transform .55s cubic-bezier(0.16,1,0.3,1)";
const HOVER_T = "color .25s, background .25s, border-color .25s, box-shadow .25s, opacity .2s";

/** Download CV button with magnetic pull effect and click ripple */
export default function CvButton({ onOpen }: Props) {
  const t = useTranslations();
  const btnRef = useRef<HTMLButtonElement>(null);

  // Magnetic effect
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width * 0.5)) * 0.2;
    const dy = (e.clientY - (r.top + r.height * 0.5)) * 0.2;
    el.style.transition = HOVER_T;
    el.style.transform = `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    el.style.transition = `${SPRING}, ${HOVER_T}`;
    el.style.transform = "";
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.6;
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    }
    onOpen();
  }, [onOpen]);

  return (
    <motion.button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.15 }}
      className="relative overflow-hidden inline-flex items-center gap-2
                 px-5 py-[0.6rem] rounded-xl text-sm font-medium
                 text-[var(--text)] bg-[var(--accent-dim)] border border-[var(--accent-border)]
                 hover:bg-[rgba(99,102,241,0.2)] hover:border-[var(--accent)]
                 hover:shadow-[0_0_20px_var(--accent-glow)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {t("cvBtn")}
    </motion.button>
  );
}
