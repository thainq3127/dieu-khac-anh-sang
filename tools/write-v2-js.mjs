import { writeFileSync } from 'fs';

const js = `/* main-v2.js — Mapi-inspired animations */

// ── Header scroll state ──────────────────────────────
const header = document.querySelector('[data-header]');
const toggle  = document.querySelector('.nav-toggle');
const nav     = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];

function syncHeader() {
  if (header) header.classList.toggle('is-scrolled', globalThis.scrollY > 80);
}
globalThis.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

// ── Mobile nav toggle ────────────────────────────────
if (toggle) {
  toggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });
});
if (nav) {
  nav.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.body.classList.remove('nav-open');
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
  });
}

// ── Scroll reveal ────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

document.querySelectorAll('[data-reveal-group]').forEach((group) => {
  [...group.children].forEach((child, i) => {
    child.style.setProperty('--reveal-delay', \`\${Math.min(i * 90, 420)}ms\`);
    revealObserver.observe(child);
  });
});

// ── Active nav link ──────────────────────────────────
const sections = [...document.querySelectorAll('main section[id]')];
const activeObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((e) => e.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === \`#\${visible.target.id}\`);
  });
}, { threshold: [0.2, 0.45, 0.7] });
sections.forEach((s) => activeObserver.observe(s));

// ── Parallax ─────────────────────────────────────────
const reduceMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
const parallaxItems = [...document.querySelectorAll('[data-parallax]')].map((item) => {
  const target = item.closest('figure') || item;
  target.classList.add('is-parallax-frame');
  return { item, target };
});
let parallaxFrame = null;

function syncParallax() {
  parallaxFrame = null;
  if (reduceMotion.matches) {
    parallaxItems.forEach(({ item, target }) => {
      item.style.transform = '';
      target.style.transform = '';
    });
    return;
  }
  const vh = globalThis.innerHeight || 1;
  parallaxItems.forEach(({ item, target }) => {
    const rect = item.getBoundingClientRect();
    if (rect.bottom < -120 || rect.top > vh + 120) return;
    const strength = Number(item.dataset.parallax || 14);
    const progress = ((rect.top + rect.height / 2) - vh / 2) / (vh / 2 + rect.height / 2);
    const offset = Math.max(-1, Math.min(1, progress)) * strength;
    item.style.transform = '';
    target.style.transform = \`translate3d(0, \${offset.toFixed(1)}px, 0)\`;
  });
}
function reqParallax() {
  if (parallaxFrame !== null) return;
  parallaxFrame = globalThis.requestAnimationFrame(syncParallax);
}
globalThis.addEventListener('scroll', reqParallax, { passive: true });
globalThis.addEventListener('resize', reqParallax);
syncParallax();

// ── Marquee pause-on-hover ────────────────────────────
document.querySelectorAll('.marquee-band').forEach((band) => {
  const inner = band.querySelector('.marquee-inner');
  if (!inner) return;
  band.addEventListener('mouseenter', () => { inner.style.animationPlayState = 'paused'; });
  band.addEventListener('mouseleave', () => { inner.style.animationPlayState = 'running'; });
});

// ── Image lightbox ────────────────────────────────────
const lightbox        = document.querySelector('[data-lightbox]');
const lightboxImg     = document.querySelector('[data-lightbox-img]');
const lightboxCloseBtns = [...document.querySelectorAll('[data-lightbox-close]')];
const lightboxPrev    = document.querySelector('[data-lightbox-prev]');
const lightboxNext    = document.querySelector('[data-lightbox-next]');
const lbImages        = [...document.querySelectorAll('main figure img')]
  .filter((img) => !img.closest('.feature-bg') && !img.closest('.video-embed-wrap'));
let activeLbIdx = -1;
let lbReturn    = null;

function syncLbImg() {
  const img = lbImages[activeLbIdx];
  if (!img || !lightboxImg) return;
  lightboxImg.src = img.currentSrc || img.src;
  lightboxImg.alt = img.alt || '';
}
function openLb(idx) {
  if (!lightbox || !lbImages[idx]) return;
  activeLbIdx = idx;
  lbReturn = document.activeElement;
  syncLbImg();
  lightbox.showModal();
  document.body.style.overflow = 'hidden';
}
function closeLb() {
  if (!lightbox) return;
  lightbox.close();
  document.body.style.overflow = '';
  if (lbReturn && lbReturn.focus) lbReturn.focus();
}
function moveLb(dir) {
  activeLbIdx = (activeLbIdx + dir + lbImages.length) % lbImages.length;
  syncLbImg();
}

lbImages.forEach((img, i) => {
  const fig = img.closest('figure');
  if (!fig) return;
  fig.style.cursor = 'zoom-in';
  fig.addEventListener('click', () => openLb(i));
  fig.setAttribute('tabindex', '0');
  fig.setAttribute('role', 'button');
  fig.setAttribute('aria-label', img.alt ? \`Xem ảnh: \${img.alt}\` : 'Xem ảnh phóng to');
  fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openLb(i); });
});
lightboxCloseBtns.forEach((btn) => btn.addEventListener('click', closeLb));
if (lightboxPrev) lightboxPrev.addEventListener('click', () => moveLb(-1));
if (lightboxNext) lightboxNext.addEventListener('click', () => moveLb(1));
if (lightbox) {
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft')  moveLb(-1);
    if (e.key === 'ArrowRight') moveLb(1);
  });
}

// ── Video lightbox ────────────────────────────────────
const videoLb       = document.querySelector('[data-video-lightbox]');
const videoLbCloseBtns = [...document.querySelectorAll('[data-video-lightbox-close]')];
const videoLbFrame  = document.querySelector('[data-video-lightbox-frame]');

function openVideoLb(embedUrl) {
  if (!videoLb || !videoLbFrame) return;
  videoLbFrame.innerHTML = \`<iframe src="\${embedUrl}?autoplay=1&rel=0" allow="autoplay; fullscreen" allowfullscreen></iframe>\`;
  videoLb.showModal();
  document.body.style.overflow = 'hidden';
}
function closeVideoLb() {
  if (!videoLb) return;
  videoLb.close();
  if (videoLbFrame) videoLbFrame.innerHTML = '';
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-video-embed]').forEach((btn) => {
  btn.addEventListener('click', () => openVideoLb(btn.dataset.videoEmbed));
});
videoLbCloseBtns.forEach((btn) => btn.addEventListener('click', closeVideoLb));
if (videoLb) {
  videoLb.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeVideoLb(); });
}
`;

writeFileSync('g:/Khanh Hoa/assets/js/main-v2.js', js, 'utf8');
console.log('JS written:', js.length, 'chars');
