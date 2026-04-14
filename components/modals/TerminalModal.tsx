"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { launchConfetti } from "@/lib/confetti";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TermLine {
  text?: string;
  cls: string;
  parts?: Array<{ text: string; cls?: string; href?: string }>;
  delay?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const WELCOME_CMD = "help";

export default function TerminalModal({ open, onClose }: Props) {
  const t = useTranslations("terminal");
  const reducedMotion = useReducedMotion();
  const [lines, setLines] = useState<TermLine[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histCursor, setHistCursor] = useState(-1);
  const [busy, setBusy] = useState(false);
  const firstOpen = useRef(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect breakpoint for choosing the right animation style
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Restore focus whenever the terminal finishes printing (busy → false)
  useEffect(() => {
    if (!busy && open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [busy, open]);

  const scrollBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    });
  }, []);

  /**
   * Prints lines sequentially — each line waits for the previous one's
   * delay before appearing, exactly like the original vanilla JS version.
   * Optional onDone callback fires after the last line.
   */
  const printLines = useCallback(
    (newLines: TermLine[], onDone?: () => void) => {
      let i = 0;
      const next = () => {
        if (i >= newLines.length) {
          setBusy(false);
          onDone?.();
          return;
        }
        const line = newLines[i++];
        const delay = line.delay ?? 0;
        setTimeout(() => {
          setLines((prev) => [...prev, line]);
          scrollBottom();
          next();
        }, delay);
      };
      setBusy(true);
      next();
    },
    [scrollBottom]
  );

  /** Welcome hint shown on open and after clear */
  const welcomeLines = useCallback((): TermLine[] => [
    {
      cls: "text-muted",
      parts: [
        { text: t("welcome1") },
        {
          text: WELCOME_CMD,
          cls: "text-[var(--accent)] bg-[var(--accent-dim)] border border-[var(--accent-border)] rounded px-[5px] text-[0.78rem]",
        },
        { text: t("welcome2") },
      ],
    },
    { text: "", cls: "" },
  ], [t]);

  const runCommand = useCallback(
    (cmd: string) => {
      if (!cmd.trim() || busy) return;

      const trimmed = cmd.trim().replace(/\s+/g, " ").toLowerCase();

      // Meta-commands — clear input first, then act
      if (trimmed === "clear") {
        setInputVal("");
        setHistCursor(-1);
        setLines(welcomeLines());
        return;
      }
      if (trimmed === "exit") {
        setInputVal("");
        onClose();
        return;
      }

      // Echo the typed command
      setLines((prev) => [
        ...prev,
        {
          cls: "text-muted",
          parts: [
            { text: "~/$ ", cls: "text-[rgba(99,102,241,0.55)]" },
            { text: cmd },
          ],
        },
      ]);
      setHistory((h) => [cmd, ...h]);
      setHistCursor(-1);
      setInputVal("");
      scrollBottom();

      // Resolve output lines
      const getLines = (): { lines: TermLine[]; onDone?: () => void } => {
        switch (trimmed) {
          case "help":
            return { lines: [
              { text: t("helpTitle"), cls: "text-[var(--accent)] font-medium" },
              { text: "", cls: "" },
              { text: t("helpWhoami"),   cls: "text-[var(--text)] opacity-80" },
              { text: t("helpSkills"),   cls: "text-[var(--text)] opacity-80" },
              { text: t("helpProjects"), cls: "text-[var(--text)] opacity-80" },
              { text: t("helpContact"),  cls: "text-[var(--text)] opacity-80" },
              { text: t("helpHireMe"),   cls: "text-[var(--text)] opacity-80" },
              { text: t("helpClear"),    cls: "text-[var(--text)] opacity-80" },
              { text: t("helpExit"),     cls: "text-[var(--text)] opacity-80" },
              { text: "", cls: "" },
            ]};

          case "whoami":
            return { lines: [
              { text: t("whoamiName"),     cls: "text-[var(--accent)] font-medium" },
              { text: t("whoamiTitle"),    cls: "text-[var(--text)] opacity-80" },
              { text: t("whoamiStack"),    cls: "text-[var(--text)] opacity-80" },
              { text: t("whoamiLocation"), cls: "text-[var(--text)] opacity-80" },
              { text: t("whoamiStatus"),   cls: "text-[#22c55e]" },
              { text: "", cls: "" },
            ]};

          case "skills":
            return { lines: [
              { text: t("skillsTitle"),     cls: "text-[var(--accent)] font-medium" },
              { text: "", cls: "" },
              { text: t("skillsBackend"),   cls: "text-[var(--text)] opacity-80", delay: 80 },
              { text: t("skillsDatabases"), cls: "text-[var(--text)] opacity-80", delay: 80 },
              { text: t("skillsDevops"),    cls: "text-[var(--text)] opacity-80", delay: 80 },
              { text: t("skillsTesting"),   cls: "text-[var(--text)] opacity-80", delay: 80 },
              { text: t("skillsFrontend"),  cls: "text-[var(--text)] opacity-80", delay: 80 },
              { text: t("skillsPractices"), cls: "text-[var(--text)] opacity-80", delay: 80 },
              { text: "", cls: "" },
              { text: t("skillsAi"), cls: "text-purple-400", delay: 120 },
              { text: "", cls: "" },
            ]};

          case "projects":
            return { lines: [
              { text: t("projectsTitle"), cls: "text-[var(--accent)] font-medium" },
              { text: "", cls: "" },

              // Inomera (current)
              { cls: "font-medium", parts: [
                { text: "  Inomera", cls: "text-[var(--accent)]" },
                { text: "  ·  Software Engineer  ·  Oct 2025 → present", cls: "text-muted" },
              ]},
              { cls: "text-[var(--text)] opacity-70", parts: [
                { text: "  Microservices mobile payment platform for a leading telecom. ", href: "https://www.inomera.com" },
              ]},
              { text: "  Java · Spring Boot · Kafka · Oracle · MongoDB · Cassandra · Docker · K8s", cls: "text-purple-400 opacity-80", delay: 40 },
              { text: "", cls: "" },

              // Scalefocus
              { cls: "font-medium", parts: [
                { text: "  Scalefocus", cls: "text-[var(--accent)]" },
                { text: "  ·  Software Engineer  ·  Jul 2024 – Aug 2025", cls: "text-muted" },
              ]},
              { cls: "text-[var(--text)] opacity-70", parts: [
                { text: "  1,000+ user platform; CI/CD pipelines, international remote team. ", href: "https://scalefocus.com" },
              ]},
              { text: "  Java · Spring · RabbitMQ · ElasticSearch · MySQL · TestContainers · Docker", cls: "text-purple-400 opacity-80", delay: 40 },
              { text: "", cls: "" },

              // Inomera Intern
              { cls: "font-medium", parts: [
                { text: "  Inomera", cls: "text-[var(--accent)]" },
                { text: "  ·  Software Engineer Intern  ·  Apr 2024 – Jun 2024", cls: "text-muted" },
              ]},
              { cls: "text-[var(--text)] opacity-70", parts: [
                { text: "  Full-stack features for an internal test management platform. ", href: "https://www.inomera.com" },
              ]},
              { text: "  Java · Spring · Hibernate · MongoDB · Angular.js", cls: "text-purple-400 opacity-80", delay: 40 },
              { text: "", cls: "" },

              { cls: "text-muted", parts: [
                { text: "  github.com/tamermurtazaoglu", href: "https://github.com/tamermurtazaoglu" },
              ]},
              { text: "", cls: "" },
            ]};

          case "contact":
            return { lines: [
              { text: t("contactTitle"), cls: "text-[var(--accent)] font-medium" },
              { text: "", cls: "" },
              { cls: "text-[var(--text)] opacity-80", parts: [{ text: "  Email      " }, { text: "tamermurtazaoglu@gmail.com", href: "mailto:tamermurtazaoglu@gmail.com" }] },
              { cls: "text-[var(--text)] opacity-80", parts: [{ text: "  LinkedIn   " }, { text: "linkedin.com/in/tamermurtazaoglu", href: "https://www.linkedin.com/in/tamermurtazaoglu" }] },
              { cls: "text-[var(--text)] opacity-80", parts: [{ text: "  GitHub     " }, { text: "github.com/tamermurtazaoglu", href: "https://github.com/tamermurtazaoglu" }] },
              { cls: "text-[var(--text)] opacity-80", parts: [{ text: "  Instagram  " }, { text: "instagram.com/mr.tamerm", href: "https://www.instagram.com/mr.tamerm" }] },
              { text: "", cls: "" },
            ]};

          case "sudo hire-me":
            return {
              lines: [
                { text: t("hireMeAuth"),    cls: "text-[var(--text)] opacity-80", delay: 200 },
                { text: t("hireMePrepare"), cls: "text-[var(--text)] opacity-80", delay: 820 },
                { text: t("hireMeSuccess"), cls: "text-[#22c55e]",                delay: 680 },
                { text: "", cls: "" },
              ],
              // Confetti fires after the last line appears
              onDone: () => launchConfetti(reducedMotion),
            };

          case "hire-me":
            return { lines: [
              { text: t("hireMeNoSudo"), cls: "text-red-400" },
              { text: t("hireMeHint"),   cls: "text-muted" },
              { text: "", cls: "" },
            ]};

          default:
            return { lines: [
              { text: `${t("notFound")}: ${cmd}`, cls: "text-red-400" },
              { text: t("unknownHint"), cls: "text-muted" },
              { text: "", cls: "" },
            ]};
        }
      };

      const { lines: out, onDone } = getLines();
      if (out.length > 0) printLines(out, onDone);
    },
    [busy, onClose, t, scrollBottom, printLines, reducedMotion, welcomeLines]
  );

  // Open / close
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    if (firstOpen.current) {
      firstOpen.current = false;
      setLines(welcomeLines());
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, welcomeLines]);

  // Global keyboard shortcut to open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "/" || e.key === "`") && !open) {
        const active = document.activeElement;
        if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA") return;
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand(inputVal);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histCursor + 1, history.length - 1);
      setHistCursor(next);
      setInputVal(history[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histCursor - 1, -1);
      setHistCursor(next);
      setInputVal(next === -1 ? "" : history[next] ?? "");
    }
  };

  // Desktop: macOS yellow-button minimize — shrinks toward bottom, springs back up.
  // Mobile: slide up/down from bottom edge.
  const panelVariants = reducedMotion
    ? {}
    : isDesktop
    ? {
        initial: { opacity: 0, scale: 0.08, y: "40vh" },
        animate: {
          opacity: 1, scale: 1, y: 0,
          transition: {
            type: "spring" as const,
            stiffness: 260,
            damping: 22,
            opacity: { duration: 0.18, ease: "easeOut" },
          },
        },
        exit: {
          opacity: 0, scale: 0.08, y: "40vh",
          transition: {
            duration: 0.32,
            ease: [0.4, 0, 0.9, 0.6] as const,
            opacity: { duration: 0.22, ease: "easeIn" },
          },
        },
      }
    : {
        initial: { opacity: 0, y: "100%" },
        animate: {
          opacity: 1, y: 0,
          transition: { type: "spring" as const, stiffness: 340, damping: 30 },
        },
        exit: {
          opacity: 0, y: "100%",
          transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as const },
        },
      };

  return (
    <AnimatePresence>
      {open && (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Terminal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.18 } }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Terminal panel */}
      <motion.div
        {...panelVariants}
        className="relative z-10 flex flex-col w-full sm:max-w-2xl
                      h-[82dvh] sm:h-[70dvh] min-h-[360px]
                      rounded-t-2xl sm:rounded-2xl overflow-hidden
                      bg-[rgba(8,10,20,0.98)] sm:bg-[rgba(8,10,20,0.96)]
                      border border-white/[0.08]
                      shadow-[0_-8px_40px_rgba(0,0,0,0.6)] sm:shadow-[0_25px_80px_rgba(0,0,0,0.8)]
                      font-mono text-sm">
        {/* Title bar — on mobile the drag handle lives inside here */}
        <div className="flex-shrink-0 border-b border-white/[0.06] bg-[rgba(255,255,255,0.02)]">
          <div className="sm:hidden flex justify-center pt-2.5 pb-0.5" aria-hidden="true">
            <div className="w-8 h-[3px] rounded-full bg-white/[0.18]" />
          </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex gap-[6px]" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-muted text-xs">tamer@tamerm.com — bash</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terminal"
            className="flex items-center justify-center w-6 h-6 rounded-md
                       text-muted hover:text-[var(--text)] hover:bg-white/[0.06]
                       transition-[color,background] duration-200
                       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" width="14" height="14" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        </div>

        {/* Output */}
        <div
          ref={bodyRef}
          aria-live="polite"
          aria-atomic="false"
          className="flex-1 overflow-y-auto px-4 py-3 space-y-[2px] text-[0.8rem] leading-relaxed"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, i) =>
            line.text === "" && !line.parts ? (
              /* blank spacer — fixed height instead of full leading-relaxed */
              <div key={i} className="h-[0.55rem]" aria-hidden="true" />
            ) : (
              <div key={i} className={`whitespace-pre ${line.cls}`}>
                {line.parts ? (
                  line.parts.map((p, j) =>
                    p.href ? (
                      <a
                        key={j}
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline underline-offset-2 text-[var(--accent)] hover:opacity-80 ${p.cls ?? ""}`}
                      >
                        {p.text}
                      </a>
                    ) : (
                      <span key={j} className={p.cls}>{p.text}</span>
                    )
                  )
                ) : (
                  line.text
                )}
              </div>
            )
          )}
        </div>

        {/* Input row */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.06] flex-shrink-0"
             style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <span className="text-[rgba(99,102,241,0.55)] select-none flex-shrink-0">~/$ </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={busy}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal command input"
            className="flex-1 bg-transparent border-none outline-none text-[var(--text)]
                       text-[0.8rem] caret-[var(--accent)] disabled:opacity-50"
          />
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
}
