"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMousePosition } from "@/hooks/useMousePosition";

interface OrbDef {
  cx: number; cy: number; r: number;
  h: number; s: number; l: number;
  a: number; ph: number;
}

const DEFS: OrbDef[] = [
  { cx: 0.18, cy: 0.28, r: 0.46, h: 238, s: 82, l: 64, a: 0.22, ph: 0.00 },
  { cx: 0.78, cy: 0.68, r: 0.42, h: 263, s: 76, l: 68, a: 0.19, ph: 1.40 },
  { cx: 0.50, cy: 0.85, r: 0.36, h: 250, s: 88, l: 60, a: 0.17, ph: 2.80 },
  { cx: 0.88, cy: 0.18, r: 0.34, h: 278, s: 72, l: 70, a: 0.16, ph: 4.20 },
  { cx: 0.28, cy: 0.62, r: 0.38, h: 224, s: 74, l: 72, a: 0.15, ph: 5.60 },
];

interface Impulse { x: number; y: number; age: number; life: number }

/**
 * Full-screen canvas background with 5 luminous orbs that drift in Lissajous
 * patterns, react to mouse movement, and emit light rings on click.
 */
export default function OrbField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const mouse = useMousePosition();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let animId: number;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Orb state
    const orbs = DEFS.map((d) => ({
      ...d,
      x: W * d.cx,
      y: H * d.cy,
      vx: 0,
      vy: 0,
    }));

    const impulses: Impulse[] = [];

    const onClick = (e: MouseEvent) => {
      for (const o of orbs) {
        const dx = o.x - e.clientX;
        const dy = o.y - e.clientY;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = Math.max(0, 1 - d / 700) * 5;
        o.vx += (dx / d) * f;
        o.vy += (dy / d) * f;
      }
      impulses.push({ x: e.clientX, y: e.clientY, age: 0, life: 52 });
    };
    document.addEventListener("click", onClick);

    let t = 0;

    const frame = () => {
      animId = requestAnimationFrame(frame);
      t += 0.007;
      ctx.clearRect(0, 0, W, H);

      // Update & draw orbs
      for (const o of orbs) {
        const hx = W * o.cx;
        const hy = H * o.cy;
        const tx = hx + Math.sin(t * 0.19 + o.ph * 1.6) * W * 0.09;
        const ty = hy + Math.cos(t * 0.14 + o.ph) * H * 0.07;

        let fx = (tx - o.x) * 0.014;
        let fy = (ty - o.y) * 0.014;

        // Mouse repulsion
        const mdx = o.x - mouse.current.x;
        const mdy = o.y - mouse.current.y;
        const md2 = mdx * mdx + mdy * mdy;
        const PR = Math.min(W, H) * 0.38;
        if (md2 < PR * PR && md2 > 0.5) {
          const md = Math.sqrt(md2);
          const f = (1 - md / PR) ** 2 * 2.6;
          fx += (mdx / md) * f;
          fy += (mdy / md) * f;
        }

        // Orb-to-orb repulsion
        for (const q of orbs) {
          if (q === o) continue;
          const odx = o.x - q.x;
          const ody = o.y - q.y;
          const od2 = odx * odx + ody * ody;
          const minD = Math.min(W, H) * (o.r + q.r) * 0.55;
          if (od2 < minD * minD && od2 > 0.5) {
            const od = Math.sqrt(od2);
            const f = (1 - od / minD) * 0.7;
            fx += (odx / od) * f;
            fy += (ody / od) * f;
          }
        }

        o.vx = o.vx * 0.9 + fx;
        o.vy = o.vy * 0.9 + fy;
        o.x += o.vx;
        o.y += o.vy;

        // Draw orb
        const rad = Math.min(W, H) * o.r;
        const alpha = o.a * (0.8 + 0.2 * Math.sin(t * 0.5 + o.ph));
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, rad);
        g.addColorStop(0, `hsla(${o.h},${o.s}%,${o.l}%,${alpha.toFixed(3)})`);
        g.addColorStop(0.42, `hsla(${o.h},${o.s}%,${o.l}%,${(alpha * 0.38).toFixed(3)})`);
        g.addColorStop(1, `hsla(${o.h},${o.s}%,${o.l}%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw click impulse rings
      for (let i = impulses.length - 1; i >= 0; i--) {
        const imp = impulses[i];
        const progress = imp.age / imp.life;
        const r = progress * Math.min(W, H) * 0.28;
        const alpha = (1 - progress) * 0.45;

        if (alpha > 0.005) {
          const g = ctx.createRadialGradient(imp.x, imp.y, r * 0.6, imp.x, imp.y, r);
          g.addColorStop(0, "rgba(139,92,246,0)");
          g.addColorStop(0.7, `rgba(139,92,246,${(alpha * 0.6).toFixed(3)})`);
          g.addColorStop(1, "rgba(99,102,241,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(imp.x, imp.y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        imp.age++;
        if (imp.age >= imp.life) impulses.splice(i, 1);
      }
    };

    frame();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("click", onClick);
    };
  }, [reducedMotion, mouse]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 block w-full h-full"
    />
  );
}
