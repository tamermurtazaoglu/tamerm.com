"use client";

import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$/<>";
const rand = () => CHARS[Math.floor(Math.random() * CHARS.length)];

/**
 * Scramble-then-resolve animation for a single string.
 * Returns the current display value which starts scrambled and resolves to `target`.
 *
 * @param target  - The final string to resolve to.
 * @param delay   - Milliseconds before the animation starts.
 */
export function useScramble(target: string, delay = 560): string {
  const [display, setDisplay] = useState(() =>
    Array.from(target, () => rand()).join("")
  );

  useEffect(() => {
    const len = target.length;
    const resolve = Array.from(
      { length: len },
      (_, i) => i * 52 + Math.random() * 85
    );
    const total = Math.max(...resolve) + 130;

    let raf: number;
    const timeout = setTimeout(() => {
      const start = performance.now();

      const tick = (now: number) => {
        const elapsed = now - start;
        let out = "";
        let done = true;

        for (let i = 0; i < len; i++) {
          if (elapsed >= resolve[i]) {
            out += target[i];
          } else {
            done = false;
            out += Math.random() < 0.25 ? target[i] : rand();
          }
        }

        setDisplay(out);

        if (!done && elapsed < total + 200) {
          raf = requestAnimationFrame(tick);
        } else {
          setDisplay(target);
        }
      };

      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, delay]);

  return display;
}
