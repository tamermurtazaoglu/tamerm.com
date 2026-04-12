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
   Language / i18n
   ============================================================ */
let currentLang = 'en';   // set properly by initI18n at bottom
let _setRoles;             // typewriter hook — assigned by initTypewriter

const T = {
    en: {
        status:  'Available for opportunities',
        tagline: 'Crafting things for the web\u00A0& beyond.',
        cvBtn:   'Download CV',
        roles:   ['software developer', 'videographer', 'graphic designer', 'creative problem solver'],
        ctx: {
            night:    '🌙 Probably asleep',
            early:    '🌅 Up early',
            mornWork: '💻 Morning work session',
            mornWknd: '☕ Weekend morning',
            lunch:    '🍽️ Lunch time',
            aftnWork: '💻 Deep in work',
            aftnWknd: '🎬 Weekend vibes',
            evening:  '🌆 Evening hours',
            lateNight:'🌃 Night mode',
            sameZone: 'Same timezone as you 👋',
            ahead:  (h, t) => `Your time <strong>${t}</strong><br><span class="ctx-diff">+${h}h ahead</span>`,
            behind: (h, t) => `Your time <strong>${t}</strong><br><span class="ctx-diff">${h}h behind</span>`,
        },
        toast:        'Thanks! Hope it stands out. 📄',
        termTrigger:  'open terminal',
    },
    tr: {
        status:  'Fırsatlara açık',
        tagline: 'Web ve ötesi için işler üretiyorum.',
        cvBtn:   'CV İndir',
        roles:   ['yazılım geliştirici', 'görüntü yönetmeni', 'grafik tasarımcı', 'yaratıcı problem çözücü'],
        ctx: {
            night:    '🌙 Muhtemelen uyuyor',
            early:    '🌅 Günün erkeninde',
            mornWork: '💻 Sabah çalışmasında',
            mornWknd: '☕ Hafta sonu sabahında',
            lunch:    '🍽️ Öğle saatlerinde',
            aftnWork: '💻 Mesai devam ediyor',
            aftnWknd: '🎬 Hafta sonu keyfinde',
            evening:  '🌆 Akşam saatlerinde',
            lateNight:'🌃 Gece modunda',
            sameZone: 'Aynı saattesiniz 👋',
            ahead:  (h, t) => `Senin saatin <strong>${t}</strong><br><span class="ctx-diff">+${h}h ileride</span>`,
            behind: (h, t) => `Senin saatin <strong>${t}</strong><br><span class="ctx-diff">${h}h geride</span>`,
        },
        toast:        'Teşekkürler! Umarım fark yaratır. 📄',
        termTrigger:  'terminali aç',
    },
};

/* animate = false → instant update (on initial page load)
   animate = true  → scramble transition (user clicks the toggle) */
function setLang(lang, animate = true) {
    currentLang = lang;
    localStorage.setItem('tamerm-lang', lang);
    document.documentElement.lang = lang;
    const t = T[lang];

    /* Toggle button labels — always instant */
    const elCur = document.getElementById('lang-current');
    const elOth = document.getElementById('lang-other');
    if (elCur) elCur.textContent = lang.toUpperCase();
    if (elOth) elOth.textContent = lang === 'en' ? 'TR' : 'EN';

    if (!animate) {
        /* Initial load: no animation, apply immediately */
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const v = t[el.dataset.i18n];
            if (v !== undefined) el.textContent = v;
        });
        if (typeof _setRoles === 'function') _setRoles(t.roles);
        return;
    }

    /* ── Button pulse ── */
    const btn = document.getElementById('lang-toggle');
    if (btn) {
        btn.classList.remove('lang-pulse');
        void btn.offsetWidth;           // force reflow to restart animation
        btn.classList.add('lang-pulse');
        btn.addEventListener('animationend', () => btn.classList.remove('lang-pulse'), { once: true });
    }

    /* ── Scramble transition: each element resolves in sequence ── */
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const rand  = () => CHARS[Math.floor(Math.random() * CHARS.length)];

    document.querySelectorAll('[data-i18n]').forEach((el, idx) => {
        const final = t[el.dataset.i18n];
        if (final === undefined) return;

        /* Each element starts 80 ms after the previous one */
        setTimeout(() => {
            const DUR       = 340;
            const resolveAt = Array.from({ length: final.length }, (_, i) =>
                (i / final.length) * DUR * 0.72 + Math.random() * 65
            );
            const t0 = performance.now();

            (function tick(now) {
                const elapsed = now - t0;
                let out = '', done = true;

                for (let i = 0; i < final.length; i++) {
                    if (elapsed >= resolveAt[i]) {
                        out += final[i];
                    } else {
                        done = false;
                        /* 30% chance to show the correct char early — "almost there" feel */
                        out += Math.random() < 0.30 ? final[i] : rand();
                    }
                }

                el.textContent = out;
                if (!done) requestAnimationFrame(tick);
                else el.textContent = final;
            }(performance.now()));
        }, idx * 80);
    });

    /* Typewriter: swap roles shortly after scramble starts */
    setTimeout(() => {
        if (typeof _setRoles === 'function') _setRoles(t.roles);
    }, 60);
}


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

    let roles   = [];      // filled by initI18n → setLang → _setRoles
    let ri = 0, ci = 0, del = false;
    let timer = null;
    let started = false;

    function tick() {
        if (!roles.length) return;
        const cur = roles[ri % roles.length];
        if (!del) {
            ci++;
            el.textContent = cur.slice(0, ci);
            if (ci === cur.length) { del = true; timer = setTimeout(tick, 1950); return; }
        } else {
            ci--;
            el.textContent = cur.slice(0, ci);
            if (ci === 0) { del = false; ri = (ri + 1) % roles.length; }
        }
        timer = setTimeout(tick, del ? 38 : 76);
    }

    /* exposed globally so setLang() can swap roles mid-flight */
    _setRoles = (newRoles) => {
        clearTimeout(timer);
        roles = newRoles;
        ri = 0; ci = 0; del = false;
        el.textContent = '';
        if (started) tick();   // restart only after initial delay has passed
    };

    setTimeout(() => { started = true; if (roles.length) tick(); }, 1550);
}());


/* ============================================================
   10. Visitor context card
   ─────────────────────────────────────────────────────────────
   Bottom-right floating card: Istanbul time (live), weather
   (Open-Meteo, no API key required), visitor's local time
   and UTC offset difference from Istanbul.
   ============================================================ */
(function initContextCard() {
    const card      = document.getElementById('ctx-card');
    const elTime    = document.getElementById('ctx-ist-time');
    const elStatus  = document.getElementById('ctx-status');
    const elWeather = document.getElementById('ctx-weather');
    const elVisitor = document.getElementById('ctx-visitor');
    if (!card) return;

    const IST = 'Europe/Istanbul';

    /* --- WMO weather code → emoji --- */
    function wmo(code) {
        if (code === 0)             return '☀️';
        if (code <= 3)              return '⛅';
        if (code <= 48)             return '🌫️';
        if (code <= 57)             return '🌦️';
        if (code <= 67)             return '🌧️';
        if (code <= 77)             return '❄️';
        if (code <= 82)             return '🌧️';
        return '⛈️';
    }

    /* --- Get UTC offset in hours (DST-aware) --- */
    function utcOffset(tz) {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz, timeZoneName: 'shortOffset',
        }).formatToParts(new Date());
        const tzName = (parts.find(p => p.type === 'timeZoneName') || {}).value || '';
        const m = tzName.match(/GMT([+-])(\d+)(?::(\d+))?/);
        if (!m) return 0;
        return (m[1] === '+' ? 1 : -1) * (parseInt(m[2]) + (parseInt(m[3] || 0) / 60));
    }

    /* --- Status text based on day and hour (language-agnostic, pulls from T) --- */
    function statusText(hour, isWeekend) {
        const c = T[currentLang].ctx;
        if (hour < 6)  return c.night;
        if (hour < 9)  return c.early;
        if (hour < 12) return isWeekend ? c.mornWknd : c.mornWork;
        if (hour < 14) return c.lunch;
        if (hour < 18) return isWeekend ? c.aftnWknd : c.aftnWork;
        if (hour < 21) return c.evening;
        return c.lateNight;
    }

    /* --- Fetch weather data (Open-Meteo, free, no key) --- */
    fetch('https://api.open-meteo.com/v1/forecast' +
          '?latitude=41.0082&longitude=28.9784' +
          '&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul')
        .then(r => r.json())
        .then(d => {
            const t    = Math.round(d.current.temperature_2m);
            const icon = wmo(d.current.weather_code);
            elWeather.textContent = `${icon} ${t}°`;
        })
        .catch(() => { /* fail silently */ });

    /* --- Live clock (updates every second) --- */
    function tick() {
        const now = new Date();

        /* Istanbul time */
        const istTime = now.toLocaleTimeString('tr-TR', {
            hour: '2-digit', minute: '2-digit', timeZone: IST,
        });
        elTime.textContent = istTime;

        /* Istanbul day of week + hour */
        const istHour = parseInt(
            new Intl.DateTimeFormat('en-US', {
                hour: 'numeric', hour12: false, timeZone: IST,
            }).format(now)
        );
        const istDay = new Intl.DateTimeFormat('en-US', {
            weekday: 'long', timeZone: IST,
        }).format(now);
        const isWeekend = istDay === 'Saturday' || istDay === 'Sunday';
        elStatus.textContent = statusText(istHour, isWeekend);

        /* Visitor local time + offset diff */
        const visitorTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const locTime   = now.toLocaleTimeString('tr-TR', {
            hour: '2-digit', minute: '2-digit',
        });
        const diff = utcOffset(IST) - utcOffset(visitorTZ);

        const c = T[currentLang].ctx;
        if (diff === 0) {
            elVisitor.innerHTML = c.sameZone;
        } else if (diff > 0) {
            elVisitor.innerHTML = c.ahead(diff, locTime);
        } else {
            elVisitor.innerHTML = c.behind(Math.abs(diff), locTime);
        }
    }

    tick();
    setInterval(tick, 1000);

    /* Show after entrance animations finish */
    setTimeout(() => card.classList.add('visible'), 2800);
}());


/* ============================================================
   11. CV modal + toast
   ============================================================ */
(function initCvModal() {
    const openBtn   = document.getElementById('cv-btn');
    const modal     = document.getElementById('cv-modal');
    const backdrop  = document.getElementById('cv-modal-backdrop');
    const closeBtn  = document.getElementById('cv-modal-close');
    const frame     = document.getElementById('cv-modal-frame');
    const dlBtn     = document.getElementById('cv-modal-dl');
    const toast     = document.getElementById('toast');
    if (!openBtn || !modal) return;

    let toastTimer  = null;
    let frameLoaded = false;

    function showToast() {
        if (!toast) return;
        toast.textContent = T[currentLang].toast;
        toast.classList.remove('toast-visible', 'toast-hiding');
        void toast.offsetWidth;
        toast.classList.add('toast-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.add('toast-hiding');
            toast.addEventListener('animationend', () => {
                toast.classList.remove('toast-visible', 'toast-hiding');
            }, { once: true });
        }, 3800);
    }

    function openModal() {
        modal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
        if (!frameLoaded) {
            frame.src = 'cv.pdf';
            frameLoaded = true;
        }
        /* Trap focus inside modal on next frame */
        requestAnimationFrame(() => closeBtn.focus());
    }

    function closeModal() {
        /* Skip animation for reduced-motion — animationend would never fire */
        if (REDUCED_MOT) {
            modal.setAttribute('hidden', '');
            document.body.style.overflow = '';
            return;
        }
        modal.classList.add('closing');
        modal.addEventListener('animationend', () => {
            modal.classList.remove('closing');
            modal.setAttribute('hidden', '');
            document.body.style.overflow = '';
        }, { once: true });
    }

    function downloadCV() {
        fetch('cv.pdf')
            .then(r => r.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const a   = document.createElement('a');
                a.href     = url;
                a.download = 'TamerMurtazaoglu_CV.pdf';
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            })
            .catch(() => {
                /* Fallback: let the browser handle it natively */
                const a = document.createElement('a');
                a.href     = 'cv.pdf';
                a.download = 'TamerMurtazaoglu_CV.pdf';
                a.click();
            });
        showToast();
    }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    dlBtn.addEventListener('click', downloadCV);

    /* ESC to close */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
    });
}());


/* ============================================================
   12. Language toggle (i18n)
   ─────────────────────────────────────────────────────────────
   Priority: localStorage → browser language → 'en'
   Every setLang() call updates data-i18n elements, typewriter
   roles, and context card messages.
   ============================================================ */
(function initI18n() {
    const saved   = localStorage.getItem('tamerm-lang');
    const browser = navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
    setLang(saved || browser, false);   // initial load: no animation

    const btn = document.getElementById('lang-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
        setLang(currentLang === 'en' ? 'tr' : 'en');
    });
}());


/* ============================================================
   12. Random glitch on name
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


/* ============================================================
   13. Secret Terminal
   ─────────────────────────────────────────────────────────────
   Press / or ` anywhere to open. Commands: whoami · skills ·
   projects · contact · sudo hire-me · help · clear · exit
   ============================================================ */
(function initTerminal() {
    const modal     = document.getElementById('term-modal');
    const backdrop  = document.getElementById('term-backdrop');
    const termBody  = document.getElementById('term-body');
    const termInput = document.getElementById('term-input');
    const closeBtn  = document.getElementById('term-close');
    if (!modal || !termBody || !termInput) return;

    let cmdHistory = [];
    let histCursor = -1;
    let busy       = false;
    let firstOpen  = true;

    /* ── Per-language content ── */
    const TT = {
        en: {
            welcome: [
                { cls: 'term-out term-dim', parts: [
                    { text: 'tamerm.com — interactive shell  (type ' },
                    { text: 'help', cls: 'term-welcome-cmd' },
                    { text: ' to get started)' },
                ]},
                { text: '', cls: '' },
            ],
            help: [
                { text: 'Commands:', cls: 'term-key' },
                { text: '', cls: '' },
                { text: '  whoami        short bio', cls: 'term-out' },
                { text: '  skills        tech stack', cls: 'term-out' },
                { text: '  projects      things I\'ve built', cls: 'term-out' },
                { text: '  contact       links & reach me', cls: 'term-out' },
                { text: '  sudo hire-me  🎉', cls: 'term-out' },
                { text: '  clear         clear screen', cls: 'term-out' },
                { text: '  exit          close terminal', cls: 'term-out' },
                { text: '', cls: '' },
            ],
            whoami: [
                { text: 'Tamer Murtazaoğlu', cls: 'term-key' },
                { text: 'Software Engineer', cls: 'term-out' },
                { text: 'Java & Spring Boot · Microservices · CI/CD · AI-powered development', cls: 'term-out' },
                { text: 'Currently @ Inomera — Istanbul, Türkiye.', cls: 'term-out' },
                { text: 'Open to new opportunities.', cls: 'term-success' },
                { text: '', cls: '' },
            ],
            skills: [
                { text: 'Skills & Technologies:', cls: 'term-key' },
                { text: '', cls: '' },
                { text: '  Backend     Java · Spring Boot · JPA · Hibernate · JWT · Spring Security', cls: 'term-out', delay: 80 },
                { text: '  Databases   MongoDB · MySQL · MariaDB · PostgreSQL · Oracle · H2 · Flyway', cls: 'term-out', delay: 80 },
                { text: '  DevOps      Docker · Kubernetes · Kafka · RabbitMQ · ElasticSearch',        cls: 'term-out', delay: 80 },
                { text: '  Testing     JUnit · TestContainers · SonarQube · Jenkins · GitLab · Gitea', cls: 'term-out', delay: 80 },
                { text: '  Frontend    Angular.js · HTML · CSS · React Native',                        cls: 'term-out', delay: 80 },
                { text: '  Practices   OOP · SOLID · Design Patterns · Clean Code · Agile',            cls: 'term-out', delay: 80 },
                { text: '', cls: '' },
                { text: '  ⚡ AI-powered development — Cursor · GitHub Copilot · Claude', cls: 'term-ai', delay: 120 },
                { text: '', cls: '' },
            ],
            projects: [
                { text: 'Work Experience:', cls: 'term-key' },
                { text: '', cls: '' },
                { cls: 'term-out', parts: [
                    { text: '  Inomera      ' },
                    { text: 'Mobile payment platform — Java, Spring Boot, Kafka, K8s  (2025 →)', href: 'https://www.inomera.com' },
                ]},
                { cls: 'term-out', parts: [
                    { text: '  Scalefocus   ' },
                    { text: '1K+ user platform — Java, Spring, Docker, CI/CD  (2024)', href: 'https://scalefocus.com' },
                ]},
                { cls: 'term-out', parts: [
                    { text: '  tamerm.com   ' },
                    { text: 'Personal portfolio — vanilla JS, no frameworks', href: 'https://tamerm.com' },
                ]},
                { text: '', cls: '' },
                { cls: 'term-dim', parts: [
                    { text: '  More on GitHub → ', href: 'https://github.com/tamermurtazaoglu' },
                ]},
                { text: '', cls: '' },
            ],
            contact: [
                { text: 'Get in touch:', cls: 'term-key' },
                { text: '', cls: '' },
                { cls: 'term-out', parts: [{ text: '  Email      ' }, { text: 'tamermurtazaoglu@gmail.com',       href: 'mailto:tamermurtazaoglu@gmail.com' }] },
                { cls: 'term-out', parts: [{ text: '  LinkedIn   ' }, { text: 'linkedin.com/in/tamermurtazaoglu', href: 'https://www.linkedin.com/in/tamermurtazaoglu' }] },
                { cls: 'term-out', parts: [{ text: '  GitHub     ' }, { text: 'github.com/tamermurtazaoglu',      href: 'https://github.com/tamermurtazaoglu' }] },
                { cls: 'term-out', parts: [{ text: '  Instagram  ' }, { text: 'instagram.com/mr.tamerm',          href: 'https://www.instagram.com/mr.tamerm' }] },
                { text: '', cls: '' },
            ],
            hireMe: [
                { text: '⠿  Authenticating...',             cls: 'term-out', delay: 200 },
                { text: '⠿  Preparing hire request...',     cls: 'term-out', delay: 820 },
                { text: '✓  Request sent! You\'ll hear back soon. 🎉', cls: 'term-success', delay: 680 },
                { text: '', cls: '' },
            ],
            hireMeNoSudo: [
                { text: 'Permission denied.', cls: 'term-error' },
                { text: 'Hint: sudo hire-me', cls: 'term-dim' },
                { text: '', cls: '' },
            ],
            notFound: cmd => [
                { text: `${cmd}: command not found`, cls: 'term-error' },
                { text: 'Type \'help\' for available commands.', cls: 'term-dim' },
                { text: '', cls: '' },
            ],
        },
        tr: {
            welcome: [
                { cls: 'term-out term-dim', parts: [
                    { text: 'tamerm.com — interaktif shell  (başlamak için ' },
                    { text: 'help', cls: 'term-welcome-cmd' },
                    { text: ' yazın)' },
                ]},
                { text: '', cls: '' },
            ],
            help: [
                { text: 'Komutlar:', cls: 'term-key' },
                { text: '', cls: '' },
                { text: '  whoami        kısa biyografi', cls: 'term-out' },
                { text: '  skills        teknoloji yığını', cls: 'term-out' },
                { text: '  projects      projelerim', cls: 'term-out' },
                { text: '  contact       iletişim', cls: 'term-out' },
                { text: '  sudo hire-me  🎉', cls: 'term-out' },
                { text: '  clear         ekranı temizle', cls: 'term-out' },
                { text: '  exit          terminali kapat', cls: 'term-out' },
                { text: '', cls: '' },
            ],
            whoami: [
                { text: 'Tamer Murtazaoğlu', cls: 'term-key' },
                { text: 'Yazılım Mühendisi', cls: 'term-out' },
                { text: 'Java & Spring Boot · Mikroservisler · CI/CD · AI destekli geliştirme', cls: 'term-out' },
                { text: 'Şu an Inomera\'da — İstanbul, Türkiye.', cls: 'term-out' },
                { text: 'Yeni fırsatlara açık.', cls: 'term-success' },
                { text: '', cls: '' },
            ],
            skills: [
                { text: 'Beceriler & Teknolojiler:', cls: 'term-key' },
                { text: '', cls: '' },
                { text: '  Backend      Java · Spring Boot · JPA · Hibernate · JWT · Spring Security', cls: 'term-out', delay: 80 },
                { text: '  Veritabanı   MongoDB · MySQL · MariaDB · PostgreSQL · Oracle · H2 · Flyway', cls: 'term-out', delay: 80 },
                { text: '  DevOps       Docker · Kubernetes · Kafka · RabbitMQ · ElasticSearch',        cls: 'term-out', delay: 80 },
                { text: '  Test         JUnit · TestContainers · SonarQube · Jenkins · GitLab · Gitea', cls: 'term-out', delay: 80 },
                { text: '  Frontend     Angular.js · HTML · CSS · React Native',                        cls: 'term-out', delay: 80 },
                { text: '  Pratikler    OOP · SOLID · Design Patterns · Clean Code · Agile',            cls: 'term-out', delay: 80 },
                { text: '', cls: '' },
                { text: '  ⚡ AI destekli geliştirme — Cursor · GitHub Copilot · Claude', cls: 'term-ai', delay: 120 },
                { text: '', cls: '' },
            ],
            projects: [
                { text: 'İş Deneyimi:', cls: 'term-key' },
                { text: '', cls: '' },
                { cls: 'term-out', parts: [
                    { text: '  Inomera      ' },
                    { text: 'Mobil ödeme platformu — Java, Spring Boot, Kafka, K8s  (2025 →)', href: 'https://www.inomera.com' },
                ]},
                { cls: 'term-out', parts: [
                    { text: '  Scalefocus   ' },
                    { text: '1B+ kullanıcı platformu — Java, Spring, Docker, CI/CD  (2024)', href: 'https://scalefocus.com' },
                ]},
                { cls: 'term-out', parts: [
                    { text: '  tamerm.com   ' },
                    { text: 'Kişisel portföy — vanilla JS, framework yok', href: 'https://tamerm.com' },
                ]},
                { text: '', cls: '' },
                { cls: 'term-dim', parts: [
                    { text: '  GitHub\'da daha fazlası → ', href: 'https://github.com/tamermurtazaoglu' },
                ]},
                { text: '', cls: '' },
            ],
            contact: [
                { text: 'İletişim:', cls: 'term-key' },
                { text: '', cls: '' },
                { cls: 'term-out', parts: [{ text: '  E-posta     ' }, { text: 'tamermurtazaoglu@gmail.com',       href: 'mailto:tamermurtazaoglu@gmail.com' }] },
                { cls: 'term-out', parts: [{ text: '  LinkedIn    ' }, { text: 'linkedin.com/in/tamermurtazaoglu', href: 'https://www.linkedin.com/in/tamermurtazaoglu' }] },
                { cls: 'term-out', parts: [{ text: '  GitHub      ' }, { text: 'github.com/tamermurtazaoglu',      href: 'https://github.com/tamermurtazaoglu' }] },
                { cls: 'term-out', parts: [{ text: '  Instagram   ' }, { text: 'instagram.com/mr.tamerm',          href: 'https://www.instagram.com/mr.tamerm' }] },
                { text: '', cls: '' },
            ],
            hireMe: [
                { text: '⠿  Kimlik doğrulanıyor...',                      cls: 'term-out', delay: 200 },
                { text: '⠿  İşe alım talebi hazırlanıyor...',             cls: 'term-out', delay: 820 },
                { text: '✓  Talep gönderildi! Yakında dönüş yapılacak. 🎉', cls: 'term-success', delay: 680 },
                { text: '', cls: '' },
            ],
            hireMeNoSudo: [
                { text: 'İzin reddedildi.', cls: 'term-error' },
                { text: 'İpucu: sudo hire-me', cls: 'term-dim' },
                { text: '', cls: '' },
            ],
            notFound: cmd => [
                { text: `${cmd}: komut bulunamadı`, cls: 'term-error' },
                { text: '\'help\' yazarak mevcut komutları görebilirsin.', cls: 'term-dim' },
                { text: '', cls: '' },
            ],
        },
    };

    function tt() { return TT[currentLang] || TT.en; }

    function scrollBottom() {
        termBody.scrollTop = termBody.scrollHeight;
    }

    function addLine(line) {
        const div = document.createElement('div');
        div.className = 'term-line ' + (line.cls || '');
        if (line.parts) {
            for (const part of line.parts) {
                if (part.href) {
                    const a = document.createElement('a');
                    a.href = part.href;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.className = 'term-link';
                    a.textContent = part.text;
                    div.appendChild(a);
                } else if (part.cls) {
                    const span = document.createElement('span');
                    span.className = part.cls;
                    span.textContent = part.text;
                    div.appendChild(span);
                } else {
                    div.appendChild(document.createTextNode(part.text));
                }
            }
        } else {
            div.textContent = line.text || '';
        }
        termBody.appendChild(div);
        scrollBottom();
        return div;
    }

    function addCmdEcho(cmd) {
        const div = document.createElement('div');
        div.className = 'term-line term-cmd';
        div.textContent = cmd;   // textContent — safe from XSS
        termBody.appendChild(div);
        scrollBottom();
    }

    function printLines(lines, onDone) {
        busy = true;
        let i = 0;
        function next() {
            if (i >= lines.length) { busy = false; if (onDone) onDone(); return; }
            const line  = lines[i++];
            const delay = line.delay || 0;
            setTimeout(() => { addLine(line); next(); }, delay);
        }
        next();
    }

    /* ── Canvas confetti burst ── */
    function launchConfetti() {
        if (REDUCED_MOT) return;
        const c = document.createElement('canvas');
        c.style.cssText = 'position:fixed;inset:0;z-index:9996;pointer-events:none;';
        c.width  = window.innerWidth;
        c.height = window.innerHeight;
        document.body.appendChild(c);

        const ctx2 = c.getContext('2d');
        const COLS = ['#6366f1','#a78bfa','#f59e0b','#34d399','#f472b6','#60a5fa','#e2e8f0'];

        const parts = Array.from({ length: 120 }, () => ({
            x:     c.width  * 0.5 + (Math.random() - 0.5) * 360,
            y:     c.height * 0.44,
            vx:    (Math.random() - 0.5) * 20,
            vy:    Math.random() * -24 - 4,
            w:     5 + Math.random() * 9,
            h:     3 + Math.random() * 5,
            color: COLS[Math.floor(Math.random() * COLS.length)],
            rot:   Math.random() * Math.PI * 2,
            rv:    (Math.random() - 0.5) * 0.30,
            g:     0.45 + Math.random() * 0.35,
            life:  1,
            decay: 0.007 + Math.random() * 0.007,
        }));

        (function animate() {
            ctx2.clearRect(0, 0, c.width, c.height);
            let any = false;
            for (const p of parts) {
                p.vy += p.g; p.x += p.vx; p.y += p.vy;
                p.rot += p.rv; p.life -= p.decay;
                if (p.life <= 0 || p.y > c.height + 20) continue;
                any = true;
                ctx2.save();
                ctx2.translate(p.x, p.y); ctx2.rotate(p.rot);
                ctx2.globalAlpha = Math.max(0, p.life);
                ctx2.fillStyle = p.color;
                ctx2.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx2.restore();
            }
            if (any) requestAnimationFrame(animate); else c.remove();
        }());
    }

    /* ── Command execution ── */
    function run(raw) {
        const cmd = raw.trim().replace(/\s+/g, ' ').toLowerCase();
        if (!cmd) return;

        /* Meta-commands always run regardless of busy */
        if (cmd === 'clear') { termBody.innerHTML = ''; busy = false; return; }
        if (cmd === 'exit')  { closeTerm(); return; }

        if (busy) return;

        cmdHistory.unshift(raw);
        histCursor = -1;
        addCmdEcho(raw);

        const tl = tt();

        if (cmd === 'help')         { printLines(tl.help);         return; }
        if (cmd === 'whoami')       { printLines(tl.whoami);       return; }
        if (cmd === 'skills')       { printLines(tl.skills);       return; }
        if (cmd === 'projects')     { printLines(tl.projects);     return; }
        if (cmd === 'contact')      { printLines(tl.contact);      return; }
        if (cmd === 'hire-me')      { printLines(tl.hireMeNoSudo); return; }
        if (cmd === 'sudo hire-me') { printLines(tl.hireMe, launchConfetti); return; }

        printLines(tl.notFound(raw.trim()));
    }

    /* ── Open / Close ── */
    function openTerm() {
        if (!modal.hasAttribute('hidden')) return;
        modal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
        if (firstOpen) {
            firstOpen = false;
            printLines(tt().welcome, () => requestAnimationFrame(() => termInput.focus()));
        } else {
            requestAnimationFrame(() => termInput.focus());
        }
    }

    function closeTerm() {
        if (modal.hasAttribute('hidden')) return;
        if (REDUCED_MOT) {
            modal.setAttribute('hidden', '');
            document.body.style.overflow = '';
            return;
        }
        modal.classList.add('closing');
        modal.addEventListener('animationend', () => {
            modal.classList.remove('closing');
            modal.setAttribute('hidden', '');
            document.body.style.overflow = '';
        }, { once: true });
    }

    /* Expose for console access on any device */
    window.openTerminal = openTerm;

    /* ── Global keydown: open on / or ` ── */
    document.addEventListener('keydown', e => {
        if (!modal.hasAttribute('hidden')) {
            if (e.key === 'Escape') { e.preventDefault(); closeTerm(); }
            return;
        }
        const cvModal = document.getElementById('cv-modal');
        if (cvModal && !cvModal.hasAttribute('hidden')) return;
        const tg = e.target;
        if (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable) return;
        if (e.key === '/' || e.key === '`') { e.preventDefault(); openTerm(); }
    });

    /* ── Terminal input events ── */
    termInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const val = termInput.value;
            termInput.value = '';
            run(val);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (histCursor < cmdHistory.length - 1) {
                histCursor++;
                termInput.value = cmdHistory[histCursor];
                requestAnimationFrame(() => termInput.setSelectionRange(termInput.value.length, termInput.value.length));
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histCursor > 0) { histCursor--; termInput.value = cmdHistory[histCursor]; }
            else { histCursor = -1; termInput.value = ''; }
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            termBody.innerHTML = '';
        }
    });

    closeBtn.addEventListener('click', closeTerm);
    backdrop.addEventListener('click', closeTerm);

    /* ── Footer >_ button ── */
    const triggerBtn = document.getElementById('term-trigger');
    if (triggerBtn) triggerBtn.addEventListener('click', openTerm);

    /* ── ~/$ terminal line on hero (click or Enter/Space) ── */
    const termLine = document.getElementById('terminal-line');
    if (termLine) {
        termLine.addEventListener('click', openTerm);
        termLine.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTerm(); }
        });
        /* Activate custom cursor ring on hover */
        if (IS_POINTER) {
            const dot  = document.getElementById('cursor-dot');
            const ring = document.getElementById('cursor-ring');
            const aura = document.getElementById('cursor-aura');
            termLine.addEventListener('mouseenter', () => {
                dot  && dot.classList.add('active');
                ring && ring.classList.add('active');
                aura && aura.classList.add('active');
            });
            termLine.addEventListener('mouseleave', () => {
                dot  && dot.classList.remove('active');
                ring && ring.classList.remove('active');
                aura && aura.classList.remove('active');
            });
        }
    }

    /* ── Custom cursor hover for dynamically created links ── */
    if (IS_POINTER) {
        const dot  = document.getElementById('cursor-dot');
        const ring = document.getElementById('cursor-ring');
        const aura = document.getElementById('cursor-aura');
        termBody.addEventListener('mouseover', e => {
            if (e.target.closest('a')) {
                dot  && dot.classList.add('active');
                ring && ring.classList.add('active');
                aura && aura.classList.add('active');
            }
        });
        termBody.addEventListener('mouseout', e => {
            if (e.target.closest('a')) {
                dot  && dot.classList.remove('active');
                ring && ring.classList.remove('active');
                aura && aura.classList.remove('active');
            }
        });
    }
}());


/* ============================================================
   14. Console easter egg
   ============================================================ */
(function initConsoleEasterEgg() {
    const ascii = [
        '  ████████╗ █████╗ ███╗   ███╗███████╗██████╗ ',
        '  ╚══██╔══╝██╔══██╗████╗ ████║██╔════╝██╔══██╗',
        '     ██║   ███████║██╔████╔██║█████╗  ██████╔╝',
        '     ██║   ██╔══██║██║╚██╔╝██║██╔══╝  ██╔══██╗',
        '     ██║   ██║  ██║██║ ╚═╝ ██║███████╗██║  ██║',
        '     ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝',
    ].join('\n');

    console.log(
        '%c' + ascii,
        'color:#6366f1; font-family: monospace; font-size: 11px; line-height: 1.4;'
    );
    console.log(
        '%c👋 Hey, you found this!',
        'color:#4f46e5; font-family: sans-serif; font-size: 14px; font-weight: 700;'
    );
    console.log(
        '%cBuilt with vanilla JS · No frameworks · No build tools',
        'color:#64748b; font-family: sans-serif; font-size: 12px;'
    );
    console.log(
        '%c⭐ github.com/tamermurtazaoglu/tamerm.com',
        'color:#a78bfa; font-family: monospace; font-size: 12px;'
    );
    console.log(
        '%c📟 Press / or ` anywhere to open the secret terminal',
        'color:#6366f1; font-family: monospace; font-size: 12px; font-weight: 600;'
    );
    console.log(
        '%cor run: window.openTerminal()',
        'color:#64748b; font-family: monospace; font-size: 11px;'
    );
}());
