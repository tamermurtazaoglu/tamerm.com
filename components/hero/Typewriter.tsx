"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useTypewriter } from "@/hooks/useTypewriter";

interface Props {
  onOpenTerminal: () => void;
}

/** Terminal-style typewriter that cycles through role strings */
export default function Typewriter({ onOpenTerminal }: Props) {
  const t = useTranslations();
  const roles = t.raw("roles") as string[];
  const display = useTypewriter(roles);

  return (
    <motion.p
      role="button"
      tabIndex={0}
      aria-label="Open terminal"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.85 }}
      onClick={onOpenTerminal}
      onKeyDown={(e) => e.key === "Enter" && onOpenTerminal()}
      className="font-mono text-[clamp(0.8rem,1.6vw,1rem)] text-muted flex items-center
                 mb-5 sm:mb-7 cursor-pointer select-none"
    >
      <span aria-hidden="true" className="text-[rgba(99,102,241,0.55)] select-none flex-shrink-0 mr-1">
        ~/$
      </span>
      <span className="text-[var(--text)]" aria-live="polite">{display}</span>
      <span aria-hidden="true" className="text-[var(--accent)] ml-[1px] animate-blink">_</span>
    </motion.p>
  );
}
