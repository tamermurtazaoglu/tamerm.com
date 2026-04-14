"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const NAMES = ["Tamer", "Murtazaoğlu"];
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$/<>";
const rand = () => CHARS[Math.floor(Math.random() * CHARS.length)];

function useScramble(target: string, rowDelay: number, reducedMotion: boolean) {
  // Always initialise with the real text so SSR and client render match.
  // The scramble animation kicks in via useEffect after mount.
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (reducedMotion) { setDisplay(target); return; }

    const len = target.length;
    const resolve = Array.from({ length: len }, (_, i) => i * 52 + Math.random() * 85);
    const total = Math.max(...resolve) + 130;
    let raf: number;

    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        let out = "", done = true;
        for (let i = 0; i < len; i++) {
          if (elapsed >= resolve[i]) out += target[i];
          else { done = false; out += Math.random() < 0.25 ? target[i] : rand(); }
        }
        setDisplay(out);
        if (!done && elapsed < total + 200) raf = requestAnimationFrame(tick);
        else setDisplay(target);
      };
      raf = requestAnimationFrame(tick);
    }, rowDelay);

    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [target, rowDelay, reducedMotion]);

  return display;
}

/** Single name row — gradient text with scramble animation */
function NameRow({
  name,
  delay,
  reducedMotion,
  withDot,
}: {
  name: string;
  delay: number;
  reducedMotion: boolean;
  withDot?: boolean;
}) {
  const display = useScramble(name, delay, reducedMotion);

  return (
    // .name-row is here (once) so the CSS glitch animation targets it correctly
    <span
      className="name-row block text-[clamp(2.5rem,9.5vw,7.5rem)]
                 bg-gradient-to-br from-white to-slate-400
                 bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
      style={{ lineHeight: 0.91, paddingBottom: "0.18em" }}
      aria-hidden="true"
    >
      {display}
      {withDot && (
        <span
          className="bg-gradient-to-br from-[#6366f1] to-[#a78bfa]
                     bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
        >
          .
        </span>
      )}
    </span>
  );
}

/** Large gradient heading with scramble-on-load and periodic glitch effect */
export default function NameScramble() {
  const reducedMotion = useReducedMotion();
  const nameRef = useRef<HTMLHeadingElement>(null);

  // Periodic glitch
  useEffect(() => {
    if (reducedMotion) return;
    const el = nameRef.current;
    if (!el) return;
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleGlitch = () => {
      timeout = setTimeout(() => {
        el.classList.add("name-glitching");
        setTimeout(() => el.classList.remove("name-glitching"), 420);
        scheduleGlitch();
      }, 5000 + Math.random() * 6000);
    };

    const initial = setTimeout(scheduleGlitch, 3500);
    return () => { clearTimeout(initial); clearTimeout(timeout); };
  }, [reducedMotion]);

  return (
    <motion.h1
      ref={nameRef}
      aria-label="Tamer Murtazaoğlu"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
      className="font-bold tracking-[-0.03em] mb-4"
      style={{ fontFamily: "var(--font-montserrat)" }}
    >
      {NAMES.map((name, i) => (
        <NameRow
          key={name}
          name={name}
          delay={560 + i * 145}
          reducedMotion={reducedMotion}
          withDot={i === NAMES.length - 1}
        />
      ))}
    </motion.h1>
  );
}
