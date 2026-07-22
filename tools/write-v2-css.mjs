import { writeFileSync } from 'fs';

const css = `@import url("../fonts/fonts.css");

/* ══════════════════════════════════════════════════════
   DESIGN TOKENS — Dark Adventure Editorial (v2)
   Inspired by Mapi Adventures visual language
══════════════════════════════════════════════════════ */
:root {
  --bg:         #070d0b;
  --surface:    #0e1a16;
  --surface-2:  #142319;
  --surface-3:  #1a2e22;
  --card:       #0f1f1a;
  --white:      #ffffff;
  --ivory:      #f0e8d8;
  --muted:      rgba(240,232,216,0.62);
  --dim:        rgba(240,232,216,0.38);
  --gold:       #d4a843;
  --gold-lt:    #f0c96a;
  --terra:      #b85030;
  --terra-lt:   #d46540;
  --green:      #1f7a5e;
  --border:     rgba(255,255,255,0.08);
  --border-2:   rgba(255,255,255,0.13);
  --sh:         0 24px 64px rgba(0,0,0,0.52);
  --sh-lg:      0 40px 96px rgba(0,0,0,0.68);
  --r:          8px;
  --r-lg:       16px;
  --shell:      1240px;
  --ch-pad:     clamp(72px, 10vw, 128px);
}

/* ══════════════════════════════════════════════════════
   RESET
══════════════════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; }
html { scroll-behavior: smooth; font-size: 16px; }

body {
  color: var(--ivory);
  background: var(--bg);
  font-family: "Inter", Arial, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
}
body.nav-open { overflow: hidden; }

img    { display: block; max-width: 100%; height: auto; }
figure { margin: 0; }
a      { color: inherit; text-decoration: none; }
button { font: inherit; cursor: pointer; border: 0; background: none; padding: 0; }
ul, ol { list-style: none; padding: 0; }

/* ══════════════════════════════════════════════════════
   ACCESSIBILITY
══════════════════════════════════════════════════════ */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* ══════════════════════════════════════════════════════
   TYPOGRAPHY SCALE
══════════════════════════════════════════════════════ */
h1, h2, h3 {
  font-family: "Brygada 1918", Georgia, serif;
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.015em;
}
h1 {
  font-size: clamp(3.8rem, 9vw, 8.5rem);
  font-style: italic;
  color: var(--white);
}
h2 {
  font-size: clamp(2.4rem, 4.5vw, 4.2rem);
  color: var(--ivory);
}
h3 {
  font-size: clamp(1.15rem, 1.8vw, 1.35rem);
  line-height: 1.3;
  color: var(--ivory);
}

.section-label {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 12px;
}

.ch-num {
  font-family: "Brygada 1918", Georgia, serif;
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 700;
  font-style: italic;
  line-height: 1;
  color: var(--gold);
  opacity: 0.15;
  flex-shrink: 0;
}
.ch-hd {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 16px;
}
.ch-deck {
  font-family: "Brygada 1918", Georgia, serif;
  font-size: clamp(1rem, 1.8vw, 1.25rem);
  font-style: italic;
  color: var(--muted);
  margin-top: 10px;
  line-height: 1.5;
}
.body-copy p {
  color: var(--muted);
  max-width: 66ch;
  margin-bottom: 18px;
  line-height: 1.82;
}
.body-copy p:last-child { margin-bottom: 0; }

/* ══════════════════════════════════════════════════════
   KEYFRAMES
══════════════════════════════════════════════════════ */
@keyframes heroZoom {
  0%   { transform: scale(1.0); }
  100% { transform: scale(1.06); }
}
@keyframes scrollPulse {
  0%, 100% { opacity: 0.3; transform: translateX(-50%) translateY(0); }
  50%       { opacity: 0.8; transform: translateX(-50%) translateY(8px); }
}
@keyframes marqueeLeft {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ══════════════════════════════════════════════════════
   REVEAL ANIMATIONS
══════════════════════════════════════════════════════ */
[data-reveal],
[data-reveal-group] > * {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 700ms cubic-bezier(0.22,1,0.36,1),
    transform 700ms cubic-bezier(0.22,1,0.36,1);
  transition-delay: var(--reveal-delay, 0ms);
}
[data-reveal].is-visible,
[data-reveal-group] > *.is-visible {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal], [data-reveal-group] > * {
    opacity: 1; transform: none; transition: none;
  }
}

/* ══════════════════════════════════════════════════════
   HEADER
══════════════════════════════════════════════════════ */
.site-header {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  width: min(calc(100% - 32px), var(--shell));
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 12px 22px;
  background: rgba(7,13,11,0.72);
  border: 1px solid var(--border-2);
  border-radius: var(--r);
  backdrop-filter: blur(24px) saturate(1.3);
  color: var(--ivory);
  transition: background 360ms ease, border-color 360ms ease;
}
.site-header.is-scrolled {
  background: rgba(7,13,11,0.95);
  border-color: rgba(255,255,255,0.14);
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-decoration: none;
  color: inherit;
}
.brand-kicker {
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
  opacity: 0.9;
}
.brand-name {
  font-family: "Brygada 1918", Georgia, serif;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1;
  color: var(--white);
}

.site-nav { display: flex; align-items: center; gap: 2px; }
.site-nav a {
  padding: 7px 14px;
  border-radius: 5px;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(240,232,216,0.78);
  transition: background 180ms, color 180ms;
  min-height: 36px;
  display: flex;
  align-items: center;
}
.site-nav a:hover    { background: rgba(255,255,255,0.10); color: var(--white); }
.site-nav a.is-active { color: var(--gold); }

.nav-cta {
  margin-left: 10px;
  padding: 8px 20px;
  background: var(--gold);
  color: var(--bg) !important;
  border-radius: var(--r);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  transition: background 200ms, transform 200ms !important;
}
.nav-cta:hover {
  background: var(--gold-lt) !important;
  transform: translateY(-1px);
  color: var(--bg) !important;
}

.nav-toggle {
  display: none;
  width: 40px; height: 40px;
  align-items: center; justify-content: center;
  border-radius: 5px;
  color: var(--ivory);
  background: rgba(255,255,255,0.08);
}
.nav-toggle span,
.nav-toggle span::before,
.nav-toggle span::after {
  display: block;
  width: 18px; height: 1.5px;
  background: currentColor;
  border-radius: 2px;
}
.nav-toggle span { position: relative; }
.nav-toggle span::before,
.nav-toggle span::after { content: ""; position: absolute; left: 0; }
.nav-toggle span::before { top: -6px; }
.nav-toggle span::after  { top: 6px; }

/* ══════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════ */
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  background: var(--bg);
  color: var(--white);
}
.hero-visual {
  position: absolute;
  inset: 0;
}
.hero-img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center 30%;
  animation: heroZoom 24s ease-in-out infinite alternate;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(175deg, rgba(7,13,11,0.25) 0%, rgba(7,13,11,0.88) 100%),
    linear-gradient(90deg, rgba(7,13,11,0.95) 0%, rgba(7,13,11,0.20) 55%, transparent 100%);
}

.hero-body {
  position: relative;
  z-index: 1;
  padding: 0 clamp(24px, 6vw, 96px) clamp(80px, 10vw, 130px);
  max-width: min(900px, 75vw);
  width: 100%;
}
.hero-dateline {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.hero-dateline::before {
  content: "";
  display: block;
  width: 32px; height: 1.5px;
  background: var(--gold);
  opacity: 0.7;
}
.hero h1 {
  margin-bottom: 20px;
  text-shadow: 0 4px 48px rgba(0,0,0,0.5);
}
.hero-deck {
  font-family: "Brygada 1918", Georgia, serif;
  font-size: clamp(1.1rem, 2.2vw, 1.5rem);
  font-style: italic;
  color: rgba(240,232,216,0.78);
  margin-bottom: 36px;
  line-height: 1.5;
}
.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  background: var(--gold);
  color: var(--bg);
  border-radius: var(--r);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  transition: background 220ms, transform 220ms;
}
.btn-primary:hover { background: var(--gold-lt); transform: translateY(-2px); }
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border: 1.5px solid rgba(240,232,216,0.32);
  color: var(--ivory);
  border-radius: var(--r);
  font-size: 0.9rem;
  font-weight: 600;
  transition: border-color 220ms, background 220ms;
}
.btn-outline:hover { border-color: var(--ivory); background: rgba(240,232,216,0.08); }

.hero-scroll-cue {
  position: absolute;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: rgba(255,255,255,0.35);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  animation: scrollPulse 2.6s ease-in-out infinite;
  z-index: 2;
}

/* ══════════════════════════════════════════════════════
   FEATURES STRIP  (Mapi "Our Unique Point" style)
══════════════════════════════════════════════════════ */
.features-strip {
  background: var(--surface);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.features-inner {
  width: min(100%, var(--shell));
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 26px clamp(16px, 3vw, 36px);
  border-right: 1px solid var(--border);
  transition: background 220ms;
}
.feature-item:last-child { border-right: 0; }
.feature-item:hover { background: rgba(255,255,255,0.04); }
.feature-icon {
  width: 42px; height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212,168,67,0.12);
  border-radius: 50%;
  font-size: 1.15rem;
  flex-shrink: 0;
}
.feature-text strong {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ivory);
  margin-bottom: 2px;
}
.feature-text span {
  font-size: 0.72rem;
  color: var(--muted);
}

/* ══════════════════════════════════════════════════════
   MARQUEE STRIP
══════════════════════════════════════════════════════ */
.marquee-band {
  overflow: hidden;
  background: var(--gold);
  padding: 14px 0;
}
.marquee-band.band-dark {
  background: var(--surface-2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.marquee-inner {
  display: flex;
  gap: 0;
  width: max-content;
  animation: marqueeLeft 30s linear infinite;
}
.marquee-band.slow .marquee-inner { animation-duration: 44s; }
.marquee-item {
  white-space: nowrap;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--bg);
  padding: 0 30px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.marquee-band.band-dark .marquee-item { color: var(--muted); }
.marquee-item::after {
  content: "✦";
  font-size: 0.55rem;
  opacity: 0.55;
  flex-shrink: 0;
}
@media (prefers-reduced-motion: reduce) {
  .marquee-inner { animation: none; }
}

/* ══════════════════════════════════════════════════════
   INTRO SECTION  (large pull quote)
══════════════════════════════════════════════════════ */
.intro-section {
  background: var(--surface);
  padding: clamp(88px, 13vw, 148px) 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.intro-section::before {
  content: "";
  position: absolute;
  top: -40%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px; height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 70%);
  pointer-events: none;
}
.intro-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.intro-label::before,
.intro-label::after {
  content: "";
  display: block;
  width: 48px; height: 1px;
  background: var(--gold);
  opacity: 0.45;
}
.intro-pull {
  font-family: "Brygada 1918", Georgia, serif;
  font-size: clamp(1.6rem, 3.5vw, 2.8rem);
  font-style: italic;
  line-height: 1.42;
  color: var(--ivory);
  max-width: 840px;
  margin: 0 auto;
}

/* ══════════════════════════════════════════════════════
   CHAPTER BASE
══════════════════════════════════════════════════════ */
.chapter {
  padding: var(--ch-pad) 0;
  background: var(--bg);
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.chapter-alt  { background: var(--surface); }
.chapter-dark { background: var(--surface-2); }
.chapter-feature {
  min-height: 100svh;
  padding: clamp(92px, 10vw, 142px) 0;
  background: #08120e;
  color: var(--white);
}

/* ══════════════════════════════════════════════════════
   EDITORIAL SPLIT  (Ch 01 & 05)
══════════════════════════════════════════════════════ */
.editorial-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 620px;
  max-width: var(--shell);
  margin: 0 auto;
}
.editorial-flip { direction: rtl; }
.editorial-flip > * { direction: ltr; }

.ed-photo {
  overflow: hidden;
  min-height: 580px;
  position: relative;
}
.fill-fig {
  height: 100%;
  position: relative;
  overflow: hidden;
}
.fill-fig img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 800ms cubic-bezier(0.2,0,0,1);
}
.fill-fig:hover img { transform: scale(1.04); }
.fill-fig::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(7,13,11,0.35) 100%);
  pointer-events: none;
}

.ed-text {
  padding: var(--ch-pad) clamp(36px, 5.5vw, 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--bg);
}
.chapter-alt .ed-text  { background: var(--surface); }
.chapter-dark .ed-text { background: var(--surface-2); }

.inline-pq {
  margin-top: 28px;
  padding: 0 0 0 20px;
  border-left: 3px solid var(--gold);
}
.inline-pq p {
  font-family: "Brygada 1918", Georgia, serif;
  font-size: 1.08rem;
  font-style: italic;
  color: var(--ivory);
  line-height: 1.55;
}

/* Triptych */
.gamma-triptych {
  width: min(calc(100% - 48px), var(--shell));
  margin: 40px auto 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.gamma-triptych figure {
  position: relative;
  overflow: hidden;
  border-radius: var(--r);
  background: var(--card);
  box-shadow: var(--sh);
  aspect-ratio: 4/3;
}
.gamma-triptych img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 700ms cubic-bezier(0.2,0,0,1);
}
.gamma-triptych figure:hover img { transform: scale(1.06); }

/* ══════════════════════════════════════════════════════
   FEATURE SECTION  (Ch 02 — Thap Cham)
══════════════════════════════════════════════════════ */
.feature-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  overflow: hidden;
}
.feature-bg img {
  width: 100%; height: 100%;
  object-fit: cover;
  filter: blur(28px) saturate(0.85);
  opacity: 0.20;
  transform: scale(1.12);
}
.chapter-feature::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, rgba(7,13,11,0.80), rgba(7,13,11,0.94)),
    radial-gradient(circle at 8% 18%, rgba(212,168,67,0.12), transparent 38%),
    radial-gradient(circle at 90% 82%, rgba(184,80,48,0.09), transparent 34%);
}
.feature-shell {
  position: relative;
  width: min(calc(100% - 48px), var(--shell));
  margin: 0 auto;
}
.feature-copy {
  max-width: 1060px;
  margin-bottom: clamp(40px, 5vw, 68px);
}
.feature-copy h2 {
  color: var(--ivory);
  max-width: 14ch;
  text-shadow: 0 8px 40px rgba(0,0,0,0.45);
}
.feature-copy .section-label { color: var(--gold); }
.feature-copy .ch-num        { color: var(--gold-lt); opacity: 0.12; }
.feature-copy .ch-deck       { color: rgba(240,232,216,0.65); }
.feature-copy .body-copy p {
  color: rgba(240,232,216,0.78);
  max-width: 88ch;
  font-size: clamp(1rem, 1.25vw, 1.13rem);
  line-height: 1.86;
}
.feature-copy .two-col {
  columns: 2;
  gap: 40px;
}
.feature-copy .two-col p { max-width: none; }

.chapter-collage {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.chapter-collage figure {
  position: relative;
  overflow: hidden;
  border-radius: var(--r);
  background: var(--card);
  box-shadow: var(--sh-lg);
  aspect-ratio: 4/3;
}
.collage-wide { grid-column: 1 / -1; aspect-ratio: 16/6; }
.chapter-collage img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 700ms cubic-bezier(0.2,0,0,1), filter 500ms;
}
.chapter-collage figure:hover img { transform: scale(1.05); filter: brightness(1.08); }

/* Wide chapter intro */
.ch-intro-wide {
  width: min(calc(100% - 48px), var(--shell));
  margin: 0 auto 56px;
}

/* ══════════════════════════════════════════════════════
   ESSAY SECTION  (Ch 03 — Di san phi vat the)
══════════════════════════════════════════════════════ */
.essay-body {
  width: min(calc(100% - 48px), var(--shell));
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(32px, 5vw, 72px);
  align-items: start;
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 36px;
}
.tag-grid li {
  padding: 8px 18px;
  background: rgba(212,168,67,0.10);
  border: 1px solid rgba(212,168,67,0.24);
  border-radius: 100px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--gold-lt);
  transition: background 200ms;
}
.tag-grid li:hover { background: rgba(212,168,67,0.18); }

/* ══════════════════════════════════════════════════════
   CINEMATIC SPLIT  (Ch 04 — Du lich)
══════════════════════════════════════════════════════ */
.cine-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: var(--shell);
  margin: 0 auto;
  align-items: center;
}
.cine-text {
  padding: var(--ch-pad) clamp(36px, 5.5vw, 80px);
}
.cine-mosaic {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 0 24px 0 8px;
}
.cine-mosaic figure {
  position: relative;
  overflow: hidden;
  border-radius: var(--r);
  background: var(--card);
}
.cine-mosaic img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 700ms cubic-bezier(0.2,0,0,1);
}
.cine-mosaic figure:hover img { transform: scale(1.06); }
.cm-tall { grid-row: span 2; aspect-ratio: 3/4; }
.cm-sm   { aspect-ratio: 4/3; }

/* ══════════════════════════════════════════════════════
   QUOTE BREAK
══════════════════════════════════════════════════════ */
.quote-break {
  background: var(--surface-3);
  padding: clamp(72px, 10vw, 112px) 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.quote-break::before {
  content: "\\201C";
  position: absolute;
  top: -0.15em;
  left: 50%;
  transform: translateX(-50%);
  font-family: "Brygada 1918", Georgia, serif;
  font-size: clamp(10rem, 22vw, 20rem);
  font-style: italic;
  line-height: 1;
  color: var(--gold);
  opacity: 0.06;
  pointer-events: none;
  z-index: 0;
}
.qb-inner {
  position: relative;
  z-index: 1;
  max-width: 860px;
  margin: 0 auto;
}
.qb-inner blockquote p {
  font-family: "Brygada 1918", Georgia, serif;
  font-size: clamp(1.3rem, 2.5vw, 2rem);
  font-style: italic;
  line-height: 1.52;
  color: var(--ivory);
}

/* ══════════════════════════════════════════════════════
   JOURNEY GRID  (Ch 06)
══════════════════════════════════════════════════════ */
.journey-grid {
  width: min(calc(100% - 48px), var(--shell));
  margin: 0 auto 56px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.jcard {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  transition: transform 280ms cubic-bezier(0.2,0,0,1), box-shadow 280ms;
  position: relative;
}
.jcard::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--gold), var(--terra));
  opacity: 0;
  transition: opacity 280ms;
}
.jcard:hover { transform: translateY(-6px); box-shadow: var(--sh); }
.jcard:hover::before { opacity: 1; }
.jcard-body { padding: 36px 32px; }
.jcard-num {
  display: block;
  font-family: "Brygada 1918", Georgia, serif;
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  font-style: italic;
  font-weight: 700;
  color: var(--gold);
  opacity: 0.18;
  line-height: 1;
  margin-bottom: 16px;
}
.jcard h3 {
  font-size: 1.18rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--ivory);
}
.jcard p {
  font-size: 0.9rem;
  color: var(--muted);
  line-height: 1.72;
}

.journey-story {
  width: min(calc(100% - 48px), var(--shell));
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: clamp(32px, 5vw, 56px);
}
.journey-story p {
  font-family: "Brygada 1918", Georgia, serif;
  font-size: clamp(1.05rem, 1.6vw, 1.3rem);
  font-style: italic;
  line-height: 1.76;
  color: var(--muted);
  max-width: 900px;
}

/* ══════════════════════════════════════════════════════
   VIDEO GRID
══════════════════════════════════════════════════════ */
.video-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  width: min(calc(100% - 48px), var(--shell));
  margin: 0 auto;
}
.vcard {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  transition: transform 280ms, box-shadow 280ms;
}
.vcard:hover { transform: translateY(-5px); box-shadow: var(--sh); }

.video-embed-wrap {
  position: relative;
  aspect-ratio: 16/9;
  background: #000;
  overflow: hidden;
}
.video-trigger {
  display: block;
  width: 100%; height: 100%;
  position: relative;
  cursor: pointer;
}
.video-trigger img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 600ms cubic-bezier(0.2,0,0,1), filter 400ms;
  filter: brightness(0.80);
}
.video-trigger:hover img { transform: scale(1.04); filter: brightness(0.65); }
.video-play {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 58px; height: 58px;
  background: rgba(212,168,67,0.90);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: var(--bg);
  padding-left: 3px;
  transition: background 220ms, transform 220ms;
}
.video-trigger:hover .video-play {
  background: var(--gold);
  transform: translate(-50%, -50%) scale(1.10);
}
.vcard-info { padding: 22px 24px; }
.vcard-tag {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--terra-lt);
  background: rgba(184,80,48,0.13);
  padding: 4px 10px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 10px;
}
.vcard-info h3 {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.42;
  color: var(--ivory);
  margin-bottom: 8px;
}
.vcard-sub {
  font-size: 0.83rem;
  color: var(--muted);
  line-height: 1.6;
}

/* ══════════════════════════════════════════════════════
   CLOSING SECTION
══════════════════════════════════════════════════════ */
.closing-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: var(--shell);
  margin: 0 auto;
  align-items: center;
}
.closing-text {
  padding: var(--ch-pad) clamp(36px, 5.5vw, 80px);
}
.closing-gallery {
  position: relative;
  overflow: hidden;
  min-height: 560px;
}
.closing-hero-image {
  height: 100%;
  position: relative;
  overflow: hidden;
}
.closing-hero-image img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 800ms;
}
.closing-hero-image:hover img { transform: scale(1.04); }
.closing-hero-image::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(7,13,11,0.6) 0%, transparent 50%);
  pointer-events: none;
}
.closing-sig {
  font-family: "Brygada 1918", Georgia, serif;
  font-size: 1rem;
  font-style: italic;
  color: var(--gold);
  margin-top: 28px;
}

/* ══════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════ */
.site-footer {
  background: var(--bg);
  border-top: 1px solid var(--border);
  padding: clamp(40px, 6vw, 72px) 0 clamp(28px, 4vw, 40px);
}
.footer-inner {
  width: min(calc(100% - 48px), var(--shell));
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: end;
}
.foot-brand {
  font-family: "Brygada 1918", Georgia, serif;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-style: italic;
  color: var(--ivory);
  margin-bottom: 6px;
}
.foot-tagline {
  font-size: 0.82rem;
  color: var(--muted);
  margin-bottom: 0;
}
.foot-nav {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 18px;
}
.foot-nav a {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  padding: 6px 10px;
  border-radius: 5px;
  transition: color 180ms, background 180ms;
}
.foot-nav a:hover { color: var(--ivory); background: rgba(255,255,255,0.06); }
.foot-credit {
  font-size: 0.72rem;
  color: var(--dim);
  text-align: right;
}

/* ══════════════════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════════════════ */
.media-lightbox {
  margin: 0; padding: 0; border: 0;
  background: transparent;
  width: 100%; height: 100%;
  max-width: 100vw; max-height: 100vh;
  position: fixed;
  inset: 0;
  z-index: 1000;
}
.media-lightbox:not([open]) { display: none; }
.lightbox-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(4,8,7,0.95);
  cursor: zoom-out;
  width: 100%; height: 100%;
  z-index: 0;
}
.lightbox-stage {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  max-width: 90vw;
  max-height: 88vh;
  display: flex;
  align-items: center;
  gap: 12px;
}
.lightbox-stage [data-lightbox-img] {
  max-width: 80vw;
  max-height: 82vh;
  object-fit: contain;
  border-radius: var(--r);
  box-shadow: 0 32px 96px rgba(0,0,0,0.7);
}
.lightbox-close {
  position: fixed;
  top: 20px; right: 20px;
  width: 44px; height: 44px;
  background: rgba(255,255,255,0.10);
  color: var(--ivory);
  border-radius: 50%;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 200ms;
  z-index: 2;
}
.lightbox-close:hover { background: rgba(255,255,255,0.20); }
.lightbox-nav {
  width: 48px; height: 48px;
  background: rgba(255,255,255,0.10);
  color: var(--ivory);
  border-radius: 50%;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 200ms;
  flex-shrink: 0;
}
.lightbox-nav:hover { background: rgba(255,255,255,0.20); }
.video-lightbox-stage {
  max-width: min(900px, 92vw);
  width: min(900px, 92vw);
  aspect-ratio: 16/9;
}
.video-lightbox-frame { width: 100%; height: 100%; }
.video-lightbox-frame iframe {
  width: 100%; height: 100%;
  border: 0;
  border-radius: var(--r);
}

/* ══════════════════════════════════════════════════════
   PARALLAX
══════════════════════════════════════════════════════ */
.is-parallax-frame { will-change: transform; }

/* ══════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .essay-body { grid-template-columns: 1fr; }
  .features-inner { grid-template-columns: repeat(2, 1fr); }
  .feature-item { border-bottom: 1px solid var(--border); }
  .feature-item:nth-child(2) { border-right: 0; }
  .feature-item:nth-child(3) { border-bottom: 0; }
  .feature-item:nth-child(4) { border-right: 0; border-bottom: 0; }
}
@media (max-width: 860px) {
  .editorial-split,
  .cine-split,
  .closing-layout { grid-template-columns: 1fr; }
  .editorial-flip  { direction: ltr; }
  .ed-photo,
  .closing-gallery { min-height: 340px; }
  .chapter-collage { grid-template-columns: 1fr; }
  .collage-wide    { grid-column: 1; }
  .gamma-triptych  { grid-template-columns: 1fr; gap: 8px; }
  .video-grid      { grid-template-columns: 1fr; }
  .journey-grid    { grid-template-columns: 1fr; }
  .feature-copy .two-col { columns: 1; }
  .footer-inner    { grid-template-columns: 1fr; }
  .foot-credit     { text-align: left; }
}
@media (max-width: 640px) {
  .site-nav        { display: none; }
  .nav-toggle      { display: flex; }
  .features-inner  { grid-template-columns: 1fr; }
  .feature-item    { border-right: 0; border-bottom: 1px solid var(--border); }
  .feature-item:last-child { border-bottom: 0; }
  .hero-body       { max-width: 100%; }
  .cine-mosaic     { grid-template-columns: 1fr; }
  .cm-tall         { grid-row: span 1; aspect-ratio: 4/3; }
}

/* Mobile nav overlay */
body.nav-open .site-nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: fixed;
  inset: 0;
  background: var(--bg);
  z-index: 190;
  padding: 100px 28px 40px;
  gap: 4px;
  overflow-y: auto;
}
body.nav-open .site-nav a {
  width: 100%;
  font-size: 1.2rem;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  border-radius: 0;
}
body.nav-open .nav-cta {
  margin-left: 0;
  margin-top: 16px;
  width: 100%;
  justify-content: center;
  border-radius: var(--r);
  font-size: 1rem;
}

@media print {
  .site-header, .hero-scroll-cue, .media-lightbox { display: none; }
  body { background: white; color: #111; }
}
`;

writeFileSync('g:/Khanh Hoa/assets/css/styles-v2.css', css, 'utf8');
console.log('CSS written:', css.length, 'chars');
