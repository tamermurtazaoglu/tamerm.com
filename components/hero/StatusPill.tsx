"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

/** Animated "Available for opportunities" badge */
export default function StatusPill() {
  const t = useTranslations();

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      className="inline-flex items-center gap-2 px-[0.9rem] py-[0.32rem] rounded-full mb-7
                 bg-[rgba(34,197,94,0.07)] border border-[rgba(34,197,94,0.22)]
                 text-[0.72rem] font-medium text-muted uppercase tracking-[0.07em] select-none"
    >
      <span
        aria-hidden="true"
        className="w-[7px] h-[7px] rounded-full bg-[#22c55e] flex-shrink-0
                   shadow-[0_0_7px_#22c55e] animate-pulse-dot"
      />
      {t("status")}
    </motion.div>
  );
}
