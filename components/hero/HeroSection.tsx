"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import StatusPill from "./StatusPill";
import NameScramble from "./NameScramble";
import Typewriter from "./Typewriter";
import SocialLinks from "./SocialLinks";
import CvButton from "./CvButton";
import { motion } from "framer-motion";

interface Props {
  onOpenTerminal: () => void;
  onOpenCv: () => void;
}

/**
 * Main hero section with 3D tilt + parallax depth effects.
 * Wraps all hero child components and wires up mouse interactions.
 */
export default function HeroSection({ onOpenTerminal, onOpenCv }: Props) {
  const t = useTranslations();
  const reducedMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);

  // 3D tilt effect on the hero content
  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const el = contentRef.current;
    if (!el) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let active = false;
    let animId: number;

    const activateTimer = setTimeout(() => { active = true; }, 1850);

    const onResize = () => { W = window.innerWidth; H = window.innerHeight; };
    const onMove = (e: MouseEvent) => {
      if (!active) return;
      tx = (e.clientX / W - 0.5) * 2;
      ty = (e.clientY / H - 0.5) * 2;
    };

    const tick = () => {
      if (active) {
        cx += (tx - cx) * 0.055;
        cy += (ty - cy) * 0.055;
        el.style.transform = `rotateY(${(cx * 2.8).toFixed(3)}deg) rotateX(${(-cy * 2.0).toFixed(3)}deg)`;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      clearTimeout(activateTimer);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMove);
    };
  }, [reducedMotion]);

  return (
    <main className="relative z-[4] flex items-center min-h-[100dvh] px-[clamp(2rem,12vw,14rem)]"
          style={{ perspective: "1100px" }}>
      <div ref={contentRef} className="flex flex-col items-start">
        <StatusPill />
        <NameScramble />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
          className="text-[clamp(0.875rem,1.8vw,1.05rem)] text-muted font-light mb-[1.1rem]"
        >
          {t("tagline")}
        </motion.p>

        <Typewriter onOpenTerminal={onOpenTerminal} />
        <div className="flex items-center gap-4 mb-6 sm:mb-7">
          <CvButton onOpen={onOpenCv} />
          <SocialLinks />
        </div>
      </div>
    </main>
  );
}
