"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Three-layer custom cursor:
 *   dot  → instant follow
 *   ring → lerp at 0.14
 *   aura → lerp at 0.055
 *
 * Enlarges on hover over interactive elements.
 * Hidden on touch/coarse-pointer devices.
 */
export default function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const [isPointer, setIsPointer] = useState(false);
  const [active, setActive] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsPointer(mq.matches);
  }, []);

  useEffect(() => {
    if (!isPointer || reducedMotion) return;

    let mx = -300, my = -300;
    let r1x = -300, r1y = -300;
    let r2x = -300, r2y = -300;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px,${my}px)`;
      }
    };

    const tick = () => {
      r1x += (mx - r1x) * 0.14;
      r1y += (my - r1y) * 0.14;
      r2x += (mx - r2x) * 0.055;
      r2y += (my - r2y) * 0.055;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${r1x}px,${r1y}px)`;
      }
      if (auraRef.current) {
        auraRef.current.style.transform = `translate(${r2x}px,${r2y}px)`;
      }

      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    const onEnter = (e: Event) => {
      if ((e.target as Element).closest("a, button")) setActive(true);
    };
    const onLeave = (e: Event) => {
      if ((e.target as Element).closest("a, button")) setActive(false);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onEnter, { passive: true });
    document.addEventListener("mouseout", onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [isPointer, reducedMotion]);

  if (!isPointer || reducedMotion) return null;

  const dot = [
    "fixed top-0 left-0 rounded-full pointer-events-none z-[9999] will-change-transform",
    "transition-[width,height,margin,background] duration-200",
    active
      ? "w-2 h-2 -ml-1 -mt-1 bg-white"
      : "w-[5px] h-[5px] -ml-[2.5px] -mt-[2.5px] bg-white/95",
  ].join(" ");

  const ring = [
    "fixed top-0 left-0 rounded-full pointer-events-none z-[9998] will-change-transform",
    "transition-[width,height,margin,border-color,opacity] duration-[350ms]",
    "border border-[rgba(99,102,241,0.55)]",
    active
      ? "w-14 h-14 -ml-7 -mt-7 border-[rgba(99,102,241,0.9)]"
      : "w-9 h-9 -ml-[18px] -mt-[18px]",
  ].join(" ");

  const aura = [
    "fixed top-0 left-0 rounded-full pointer-events-none z-[9997] will-change-transform",
    "transition-[width,height,margin] duration-[550ms]",
    active
      ? "w-[190px] h-[190px] -ml-[95px] -mt-[95px]"
      : "w-[120px] h-[120px] -ml-[60px] -mt-[60px]",
  ].join(" ");

  return (
    <>
      <div ref={dotRef} className={dot} aria-hidden="true" />
      <div
        ref={ringRef}
        className={ring}
        aria-hidden="true"
        style={{ borderWidth: "1.5px" }}
      />
      <div
        ref={auraRef}
        className={aura}
        aria-hidden="true"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 72%)",
        }}
      />
    </>
  );
}
