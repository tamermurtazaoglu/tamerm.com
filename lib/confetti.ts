/**
 * Canvas confetti burst — 120 coloured particles fired from screen centre.
 * Self-cleaning: the canvas element is removed once all particles have faded.
 */
export function launchConfetti(reducedMotion: boolean): void {
  if (reducedMotion) return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;z-index:9996;pointer-events:none;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }

  const COLS = [
    "#6366f1", "#a78bfa", "#f59e0b",
    "#34d399", "#f472b6", "#60a5fa", "#e2e8f0",
  ];

  const particles = Array.from({ length: 120 }, () => ({
    x:     canvas.width  * 0.5 + (Math.random() - 0.5) * 360,
    y:     canvas.height * 0.44,
    vx:    (Math.random() - 0.5) * 20,
    vy:    Math.random() * -24 - 4,
    w:     5 + Math.random() * 9,
    h:     3 + Math.random() * 5,
    color: COLS[Math.floor(Math.random() * COLS.length)],
    rot:   Math.random() * Math.PI * 2,
    rv:    (Math.random() - 0.5) * 0.3,
    g:     0.45 + Math.random() * 0.35,
    life:  1,
    decay: 0.007 + Math.random() * 0.007,
  }));

  let animId: number;

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let any = false;

    for (const p of particles) {
      p.vy += p.g;
      p.x  += p.vx;
      p.y  += p.vy;
      p.rot += p.rv;
      p.life -= p.decay;
      if (p.life <= 0 || p.y > canvas.height + 20) continue;
      any = true;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (any) {
      animId = requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  };

  animId = requestAnimationFrame(animate);

  // Safety cleanup after 6 s
  setTimeout(() => {
    cancelAnimationFrame(animId);
    canvas.remove();
  }, 6000);
}
