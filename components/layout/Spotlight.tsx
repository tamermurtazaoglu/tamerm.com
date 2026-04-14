"use client";

import { useEffect, useRef } from "react";

/**
 * Mouse-driven spotlight overlay — a subtle radial gradient that follows
 * the cursor to create a soft directional glow above the canvas.
 */
export default function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isPointer) return;

    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      el.style.background =
        `radial-gradient(620px circle at ${e.clientX}px ${e.clientY}px,` +
        `rgba(99,102,241,0.072), transparent 60%)`;
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 z-[3] pointer-events-none"
    />
  );
}
