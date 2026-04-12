/* ============================================================
   Global flags & shared state
   ============================================================ */
const IS_POINTER  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const REDUCED_MOT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const mouse = { x: -9999, y: -9999, down: false };
document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
document.addEventListener('mousedown', () => { mouse.down = true; });
document.addEventListener('mouseup',   () => { mouse.down = false; });


/* ============================================================
   1. Gradient orb field
   ─────────────────────────────────────────────────────────────
   5 large luminous orbs drift slowly in Lissajous patterns.
   Mouse pushes them away; clicks send an expanding light ring
   and jolt the orbs outward.  No particles, no noise — just
   pure, breathing light.
   ============================================================ */
(function initOrbs() {
    const canvas = document.getElementById('canvas');
    if (!canvas || REDUCED_MOT) return;

    const ctx = canvas.getContext('2d');
    let W, H;

    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* Orb definitions — home position (cx/cy as viewport fraction),
       base radius (r as fraction of min(W,H)), hue, and phase offset */
    const DEFS = [
        { cx: 0.18, cy: 0.28, r: 0.46, h: 238, s: 82, l: 64, a: 0.22, ph: 0.00 },
        { cx: 0.78, cy: 0.68, r: 0.42, h: 263, s: 76, l: 68, a: 0.19, ph: 1.40 },
        { cx: 0.50, cy: 0.85, r: 0.36, h: 250, s: 88, l: 60, a: 0.17, ph: 2.80 },
        { cx: 0.88, cy: 0.18, r: 0.34, h: 278, s: 72, l: 70, a: 0.16, ph: 4.20 },
        { cx: 0.28, cy: 0.62, r: 0.38, h: 224, s: 74, l: 72, a: 0.15, ph: 5.60 },
    ];

    class Orb {
        constructor(d) {
            Object.assign(this, d);
            this.x  = W * d.cx;
            this.y  = H * d.cy;
            this.vx = 0;
            this.vy = 0;
        }

        update(t, peers) {
            const hx = W * this.cx;
            const hy = H * this.cy;

            // Lissajous home drift
            const tx = hx + Math.sin(t * 0.19 + this.ph * 1.6) * W * 0.09;
            const ty = hy + Math.cos(t * 0.14 + this.ph)        * H * 0.07;

            let fx = (tx - this.x) * 0.014;
            let fy = (ty - this.y) * 0.014;

            // Mouse push
            const mdx = this.x - mouse.x;
            const mdy = this.y - mouse.y;
            const md2 = mdx * mdx + mdy * mdy;
            const PR  = Math.min(W, H) * 0.38;
            if (md2 < PR * PR && md2 > 0.5) {
                const md = Math.sqrt(md2);
                const f  = (1 - md / PR) * (1 - md / PR) * 2.6;
                fx += (mdx / md) * f;
                fy += (mdy / md) * f;
            }

            // Orb-to-orb gentle repulsion (keeps them naturally spaced)
            for (const q of peers) {
                if (q === this) continue;
                const odx = this.x - q.x;
                const ody = this.y - q.y;
                const od2 = odx * odx + ody * ody;
                const minD = Math.min(W, H) * (this.r + q.r) * 0.55;
                if (od2 < minD * minD && od2 > 0.5) {
                    const od = Math.sqrt(od2);
                    const f  = (1 - od / minD) * 0.7;
                    fx += (odx / od) * f;
                    fy += (ody / od) * f;
                }
            }

            this.vx = this.vx * 0.90 + fx;
            this.vy = this.vy * 0.90 + fy;
            this.x += this.vx;
            this.y += this.vy;
        }

        draw(t) {
            const rad   = Math.min(W, H) * this.r;
            const alpha = this.a * (0.80 + 0.20 * Math.sin(t * 0.50 + this.ph));

            const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, rad);
            g.addColorStop(0,    `hsla(${this.h},${this.s}%,${this.l}%,${alpha.toFixed(3)})`);
            g.addColorStop(0.42, `hsla(${this.h},${this.s}%,${this.l}%,${(alpha * 0.38).toFixed(3)})`);
            g.addColorStop(1,    `hsla(${this.h},${this.s}%,${this.l}%,0)`);

            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(this.x, this.y, rad, 0, 6.2832);
            ctx.fill();
        }
    }

    const orbs     = DEFS.map(d => new Orb(d));
    const impulses = [];   // click light rings

    document.addEventListener('click', e => {
        if (REDUCED_MOT) return;

        // Push all orbs away from click
        for (const o of orbs) {
            const dx = o.x - e.clientX;
            const dy = o.y - e.clientY;
            const d  = Math.sqrt(dx * dx + dy * dy) || 1;
            const f  = Math.max(0, 1 - d / 700) * 5;
            o.vx += (dx / d) * f;
            o.vy += (dy / d) * f;
        }

        // Queue expanding light ring
        impulses.push({ x: e.clientX, y: e.clientY, age: 0, life: 52 });
    });

    let t = 0;

    (function frame() {
        requestAnimationFrame(frame);
        t += 0.007;

        ctx.clearRect(0, 0, W, H);

        // Draw orbs
        for (const o of orbs) { o.update(t, orbs); o.draw(t); }

        // Draw click rings
        for (let i = impulses.length - 1; i >= 0; i--) {
            const imp      = impulses[i];
            const progress = imp.age / imp.life;
            const r        = progress * Math.min(W, H) * 0.28;
            const alpha    = (1 - progress) * 0.45;

            if (alpha > 0.005) {
                const g = ctx.createRadialGradient(imp.x, imp.y, r * 0.6, imp.x, imp.y, r);
                g.addColorStop(0,   `rgba(139,92,246,0)`);
                g.addColorStop(0.7, `rgba(139,92,246,${(alpha * 0.6).toFixed(3)})`);
                g.addColorStop(1,   `rgba(99,102,241,0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(imp.x, imp.y, r, 0, 6.2832);
                ctx.fill();
            }

            imp.age++;
            if (imp.age >= imp.life) impulses.splice(i, 1);
        }
    }());
}());


/* ============================================================
   2. Multi-layer cursor
   ─────────────────────────────────────────────────────────────
   dot (instant) › ring (lerp 0.14) › aura (lerp 0.055)
   ============================================================ */
(function initCursor() {
    if (!IS_POINTER || REDUCED_MOT) return;

    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const aura = document.getElementById('cursor-aura');
    if (!dot) return;

    let mx = -300, my = -300;
    let r1x = -300, r1y = -300;
    let r2x = -300, r2y = -300;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px,${my}px)`;
    });

    (function tick() {
        r1x += (mx - r1x) * 0.14;
        r1y += (my - r1y) * 0.14;
        r2x += (mx - r2x) * 0.055;
        r2y += (my - r2y) * 0.055;
        if (ring) ring.style.transform = `translate(${r1x}px,${r1y}px)`;
        if (aura) aura.style.transform = `translate(${r2x}px,${r2y}px)`;
        requestAnimationFrame(tick);
    }());

    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.classList.add('active');
            ring && ring.classList.add('active');
            aura && aura.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            dot.classList.remove('active');
            ring && ring.classList.remove('active');
            aura && aura.classList.remove('active');
        });
    });
}());


/* ============================================================
   3. Cursor spotlight
   ============================================================ */
(function initSpotlight() {
    if (!IS_POINTER) return;
    const el = document.getElementById('spotlight');
    if (!el) return;

    document.addEventListener('mousemove', e => {
        el.style.background =
            `radial-gradient(620px circle at ${e.clientX}px ${e.clientY}px,` +
            `rgba(99,102,241,0.072), transparent 60%)`;
    });
}());


/* ============================================================
   4. 3-D Hero tilt
   ─────────────────────────────────────────────────────────────
   hero-content rotates gently in 3-D with mouse.
   Starts after entrance animations complete (~1 850 ms).
   ============================================================ */
(function initTilt() {
    if (!IS_POINTER || REDUCED_MOT) return;

    const content = document.querySelector('.hero-content');
    if (!content) return;

    let W = window.innerWidth, H = window.innerHeight;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let active = false;

    setTimeout(() => { active = true; }, 1850);
    window.addEventListener('resize', () => { W = window.innerWidth; H = window.innerHeight; }, { passive: true });
    document.addEventListener('mousemove', e => {
        if (!active) return;
        tx = (e.clientX / W - 0.5) * 2;
        ty = (e.clientY / H - 0.5) * 2;
    });

    (function tick() {
        if (active) {
            cx += (tx - cx) * 0.055;
            cy += (ty - cy) * 0.055;
            content.style.transform = `rotateY(${(cx * 2.8).toFixed(3)}deg) rotateX(${(-cy * 2.0).toFixed(3)}deg)`;
        }
        requestAnimationFrame(tick);
    }());
}());


/* ============================================================
   5. Parallax depth layers
   ============================================================ */
(function initParallax() {
    if (!IS_POINTER || REDUCED_MOT) return;

    const els = document.querySelectorAll('[data-depth]');
    if (!els.length) return;

    let W = window.innerWidth, H = window.innerHeight;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let active = false;

    setTimeout(() => { active = true; }, 1600);
    window.addEventListener('resize', () => { W = window.innerWidth; H = window.innerHeight; }, { passive: true });
    window.addEventListener('mousemove', e => {
        if (!active) return;
        tx = (e.clientX / W - 0.5);
        ty = (e.clientY / H - 0.5);
    });

    (function tick() {
        if (active) {
            cx += (tx - cx) * 0.06;
            cy += (ty - cy) * 0.06;
            els.forEach(el => {
                const d = parseFloat(el.dataset.depth);
                el.style.transform = `translate(${cx * d * 10}px,${cy * d * 7}px)`;
            });
        }
        requestAnimationFrame(tick);
    }());
}());


/* ============================================================
   6. Magnetic elements
   ============================================================ */
(function initMagnetic() {
    if (!IS_POINTER) return;

    const SPRING = 'transform .55s cubic-bezier(0.16,1,0.3,1)';

    function magnetize(el, strength) {
        el.addEventListener('mousemove', e => {
            const r  = el.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width  * 0.5)) * strength;
            const dy = (e.clientY - (r.top  + r.height * 0.5)) * strength;
            el.style.transition = 'color .25s, background .25s, border-color .25s, box-shadow .25s, opacity .2s';
            el.style.transform  = `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transition = SPRING + ', color .25s, background .25s, border-color .25s, box-shadow .25s, opacity .2s';
            el.style.transform  = '';
        });
    }

    document.querySelectorAll('.social-link').forEach(el => magnetize(el, 0.35));
    const cv = document.getElementById('cv-btn');
    if (cv) magnetize(cv, 0.2);
}());


/* ============================================================
   7. CV button — ripple on click
   ============================================================ */
(function initRipple() {
    const btn = document.getElementById('cv-btn');
    if (!btn) return;

    btn.addEventListener('click', e => {
        const rect   = btn.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height) * 2.6;
        const ripple = document.createElement('span');
        ripple.className    = 'ripple';
        ripple.style.width  = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left   = `${e.clientX - rect.left}px`;
        ripple.style.top    = `${e.clientY - rect.top}px`;
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
}());


/* ============================================================
   8. Name scramble
   ============================================================ */
(function initScramble() {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$/<>';
    const rand  = () => CHARS[Math.floor(Math.random() * CHARS.length)];
    const els   = document.querySelectorAll('.name-text[data-final]');
    if (!els.length) return;

    els.forEach(el => { el.textContent = Array.from(el.dataset.final, () => rand()).join(''); });

    setTimeout(() => {
        els.forEach((el, row) => {
            const final   = el.dataset.final;
            const len     = final.length;
            const resolve = Array.from({ length: len }, (_, i) => i * 52 + Math.random() * 85);
            const total   = Math.max(...resolve) + 130;
            const start   = performance.now() + row * 145;

            function tick(now) {
                const elapsed = now - start;
                if (elapsed < 0) { requestAnimationFrame(tick); return; }
                let out = '', done = true;
                for (let i = 0; i < len; i++) {
                    if (elapsed >= resolve[i]) { out += final[i]; }
                    else { done = false; out += Math.random() < 0.25 ? final[i] : rand(); }
                }
                el.textContent = out;
                if (!done && elapsed < total + 200) requestAnimationFrame(tick);
                else el.textContent = final;
            }
            requestAnimationFrame(tick);
        });
    }, 560);
}());


/* ============================================================
   9. Typewriter
   ============================================================ */
(function initTypewriter() {
    const el = document.getElementById('role-text');
    if (!el) return;

    const roles = ['software developer', 'videographer', 'graphic designer', 'creative problem solver'];
    let ri = 0, ci = 0, del = false;

    function tick() {
        const cur = roles[ri];
        if (!del) {
            ci++;
            el.textContent = cur.slice(0, ci);
            if (ci === cur.length) { del = true; setTimeout(tick, 1950); return; }
        } else {
            ci--;
            el.textContent = cur.slice(0, ci);
            if (ci === 0) { del = false; ri = (ri + 1) % roles.length; }
        }
        setTimeout(tick, del ? 38 : 76);
    }
    setTimeout(tick, 1550);
}());


/* ============================================================
   10. Random glitch on name
   ============================================================ */
(function initGlitch() {
    if (REDUCED_MOT) return;
    const name = document.querySelector('.name');
    if (!name) return;

    function glitch() {
        setTimeout(() => {
            name.classList.add('glitching');
            setTimeout(() => name.classList.remove('glitching'), 420);
            glitch();
        }, 5000 + Math.random() * 6000);
    }
    setTimeout(glitch, 3500);
}());
