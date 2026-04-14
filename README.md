# tamerm.com

> Personal portfolio of **Tamer Murtazaoğlu** — Software Engineer based in Istanbul.

```bash
~ $ whoami
Tamer Murtazaoğlu — Software Engineer
Java & Spring Boot · Microservices · CI/CD · AI-powered development
Currently @ Inomera — Istanbul, Türkiye.
Open to new opportunities.
```

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| i18n | next-intl (client-side, no page reload) |
| Fonts | JetBrains Mono · Montserrat · Inter |
| Deploy | Vercel |

---

## Features

- **Name scramble** — gradient-clipped hero text with a matrix-style character scramble on load and language switch
- **Typewriter** — cycles through roles with a blinking terminal cursor
- **Interactive terminal** — full in-browser shell with `whoami`, `skills`, `projects`, `contact`, `sudo hire-me` and command history (↑/↓)
- **macOS window animation** — terminal opens/closes with a yellow-button minimize effect
- **CV modal** — inline PDF preview with download, mobile-optimized fallback
- **Visitor card** — live Istanbul clock, real-time weather (open-meteo), visitor timezone diff
- **EN/TR toggle** — instant language switch, no reload, scramble replays on switch
- **Console easter egg** — a little something for devs who open the browser console
- **>_ favicon** — programmatic icon via `ImageResponse`
- **OG image** — auto-generated OpenGraph card for social sharing

---

## Getting Started

```bash
git clone https://github.com/tamermurtazaoglu/tamerm.com.git
cd tamerm.com
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

---

## Terminal Commands

```
help          list available commands
whoami        short bio
skills        tech stack
projects      work experience
contact       links & reach me
sudo hire-me  🎉
clear         clear screen
exit          close terminal
```

---

## Project Structure

```
app/
├── layout.tsx          # Root layout, metadata, fonts
├── page.tsx            # Home page (client, locale-aware)
├── icon.tsx            # >_ favicon (ImageResponse)
├── opengraph-image.tsx # OG card (ImageResponse)
components/
├── hero/               # NameScramble, Typewriter, CvButton, SocialLinks
├── modals/             # TerminalModal, CvModal
├── layout/             # Footer
├── providers/          # LocaleProvider (EN/TR context)
└── ui/                 # VisitorCard, Toast
hooks/                  # useScramble, useTypewriter, useMagnet, useReducedMotion
messages/               # en.json, tr.json
```

---

## License

MIT — do whatever you want, but don't impersonate me. 😄

---

<p align="center">
  Built with obsessive attention to detail.<br/>
  <a href="https://tamerm.com">tamerm.com</a>
</p>
