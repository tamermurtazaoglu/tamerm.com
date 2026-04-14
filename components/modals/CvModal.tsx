"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Props {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
}

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/** CV preview modal with PDF iframe and download action */
export default function CvModal({ open, onClose, onDownload }: Props) {
  const t = useTranslations();
  const reducedMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const loadedRef = useRef(false);

  // Trap focus / ESC
  useEffect(() => {
    if (!open) return;

    // Lazy-load PDF
    if (!loadedRef.current && frameRef.current) {
      frameRef.current.src = "/cv.pdf";
      loadedRef.current = true;
    }

    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const handleDownload = useCallback(() => {
    fetch("/cv.pdf")
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "TamerMurtazaoglu_CV.pdf";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      })
      .catch(() => {
        const a = document.createElement("a");
        a.href = "/cv.pdf";
        a.download = "TamerMurtazaoglu_CV.pdf";
        a.click();
      });
    onDownload();
  }, [onDownload]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-modal-title"
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4
                  ${!reducedMotion ? "animate-[modal-in_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]" : ""}`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 flex flex-col w-full max-w-4xl h-[92dvh] sm:h-[90dvh]
                      rounded-2xl bg-[rgba(10,12,24,0.95)] border border-white/[0.08]
                      overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.7)]">
        {/* Bar */}
        <div className="flex items-center justify-between px-4 py-3
                        border-b border-white/[0.06] flex-shrink-0">
          <span id="cv-modal-title" className="text-sm font-medium text-[var(--text)]">
            Tamer Murtazaoğlu — CV
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         text-[var(--text)] bg-[var(--accent-dim)] border border-[var(--accent-border)]
                         hover:bg-[rgba(99,102,241,0.2)] hover:border-[var(--accent)]
                         transition-[background,border-color] duration-200
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                         active:scale-95"
            >
              <DownloadIcon />
              {t("cvBtn")}
            </button>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex items-center justify-center w-7 h-7 rounded-lg
                         text-muted hover:text-[var(--text)] hover:bg-white/[0.06]
                         transition-[color,background] duration-200
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                   strokeLinecap="round" width="16" height="16" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF frame — desktop */}
        <iframe
          ref={frameRef}
          title="CV Preview"
          className="hidden sm:block flex-1 w-full border-0 bg-[#1a1a2e]"
        />

        {/* Mobile fallback — PDF iframes are broken on iOS Safari */}
        <div className="sm:hidden flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
          <div
            aria-hidden="true"
            className="w-16 h-16 rounded-2xl flex items-center justify-center
                       bg-[var(--accent-dim)] border border-[var(--accent-border)]
                       text-[var(--accent)]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                 strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <p className="text-[var(--text)] font-medium text-sm mb-1">
              Tamer Murtazaoğlu
            </p>
            <p className="text-muted text-xs leading-relaxed">
              {t("cvMobileHint")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                       text-[var(--text)] bg-[var(--accent-dim)] border border-[var(--accent-border)]
                       hover:bg-[rgba(99,102,241,0.2)] hover:border-[var(--accent)]
                       hover:shadow-[0_0_20px_var(--accent-glow)]
                       transition-[background,border-color,box-shadow] duration-200
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                       active:scale-95"
          >
            <DownloadIcon />
            {t("cvBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
