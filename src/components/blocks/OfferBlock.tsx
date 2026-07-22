'use client';

import { useEffect, useRef, useState } from 'react';
import { Phone } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import type { OfferBlockProps } from './types';
import BlockBackground from './BlockBackground';
import { resolveBlockStyles, tc } from './blockStyles';

const eyebrowColor: Record<string, string> = { light: 'text-terra', dark: 'text-gold-lt' };
const titleColor: Record<string, string> = { light: 'text-ivory', dark: 'text-white' };
const bodyColor: Record<string, string> = { light: 'text-muted', dark: 'text-white/72' };

export default function OfferBlock(props: OfferBlockProps) {
  const {
    id,
    headline,
    price,
    currency = 'VNĐ',
    note,
    hint,
    contacts = [],
    theme = 'dark',
    bgImage,
    bgImageOpacity,
  } = props;
  const { className: customBgClass, style: customStyle, isDark, textColors } = resolveBlockStyles(props, theme);
  const t = isDark ? 'dark' : 'light';

  const target = parseFloat(price) || 0;
  const [display, setDisplay] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
          setDisplay(target);
          return;
        }

        const duration = 2200;
        const startTime = performance.now();
        function tick(now: number) {
          const progress = Math.min(1, (now - startTime) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  const formattedPrice = new Intl.NumberFormat('vi-VN').format(display);

  return (
    <section
      id={id}
      className={`${customBgClass} py-[clamp(56px,8vw,96px)] max-md:py-[clamp(36px,6vw,56px)] relative overflow-hidden isolate scroll-mt-[138px] text-center`}
      style={customStyle}
    >
      <BlockBackground bgImage={bgImage} bgImageOpacity={bgImageOpacity} />

      <Reveal type="zoom" className="relative z-10 max-w-[720px] mx-auto px-6">
        <h2
          className={`font-serif font-bold text-[clamp(1.8rem,3.6vw,2.6rem)] leading-tight mb-6 ${titleColor[t]}`}
          style={tc(textColors.title, textColors.main)}
        >
          {headline}
        </h2>

        <div ref={counterRef} className={`font-serif text-[clamp(2.6rem,6vw,4rem)] font-bold ${eyebrowColor[t]}`}>
          {formattedPrice}
          <span className="text-[0.42em] font-sans font-semibold ml-2 align-middle uppercase tracking-wider">
            {currency}
          </span>
        </div>

        {note && (
          <p className={`mt-4 text-[0.95rem] ${bodyColor[t]}`} style={tc(textColors.body, textColors.main)}>
            {note}
          </p>
        )}
        {hint && (
          <p className={`mt-1 text-[0.8rem] italic ${bodyColor[t]}`} style={tc(textColors.body, textColors.main)}>
            {hint}
          </p>
        )}

        {contacts.length > 0 && (
          <div className="flex flex-wrap gap-3.5 justify-center mt-8">
            {contacts.map((c, i) => (
              <a
                key={i}
                href={`tel:${c.phone.replace(/\s+/g, '')}`}
                className={`inline-flex items-center gap-2 py-3 px-6 rounded-md text-[0.9rem] font-semibold transition-colors duration-200 ${
                  t === 'dark'
                    ? 'border-[1.5px] border-white/36 text-white hover:border-white hover:bg-white/10'
                    : 'border-[1.5px] border-terra/40 text-terra-dark hover:bg-terra/10'
                }`}
              >
                <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{c.name} · {c.phone}</span>
              </a>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}
