"use client";

import { useEffect, useRef } from "react";

const SPRING = "transform .55s cubic-bezier(0.16,1,0.3,1)";
const HOVER_TRANSITION =
  "color .25s, background .25s, border-color .25s, box-shadow .25s, opacity .2s";

/**
 * Attaches a magnetic pull effect to an element.
 * The element drifts toward the cursor and springs back on mouseleave.
 *
 * @param strength - How strongly the element is pulled (0–1). Default 0.35.
 */
export function useMagnet<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Disable on touch devices
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width * 0.5)) * strength;
      const dy = (e.clientY - (r.top + r.height * 0.5)) * strength;
      el.style.transition = HOVER_TRANSITION;
      el.style.transform = `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px)`;
    };

    const onLeave = () => {
      el.style.transition = `${SPRING}, ${HOVER_TRANSITION}`;
      el.style.transform = "";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return ref;
}
