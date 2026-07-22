'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/Reveal';
import type { FilmBlockProps } from './types';
import { resolveBlockStyles, tc } from './blockStyles';
import { resolveAssetUrl } from '@/lib/assets';

const eyebrowColor: Record<string, string> = { light: 'text-terra', dark: 'text-gold-lt' };
const titleColor: Record<string, string> = { light: 'text-ivory', dark: 'text-white' };

function toEmbedSrc(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('youtube.com/embed/')) return trimmed;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&rel=0&playlist=${videoId}`;
  }
  return trimmed;
}

export default function FilmBlock(props: FilmBlockProps) {
  const { id, kicker, title, videoUrl, theme = 'dark' } = props;
  const { className: customBgClass, style: customStyle, isDark, textColors } = resolveBlockStyles(props, theme);
  const t = isDark ? 'dark' : 'light';
  const wrapRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!videoUrl) return null;

  const isLocal = /^(uploads\/|\/uploads\/|\/?storage\/)/.test(videoUrl) || /\.(mp4|webm|ogg|mov|m4v)$/i.test(videoUrl);
  const embedSrc = isLocal ? resolveAssetUrl(videoUrl) : toEmbedSrc(videoUrl);

  return (
    <section
      id={id}
      className={`${customBgClass} py-[clamp(52px,7vw,88px)] max-md:py-[clamp(36px,5vw,56px)] relative overflow-hidden isolate scroll-mt-[138px]`}
      style={customStyle}
    >
      <div className="relative z-2 w-full">
        {(kicker || title) && (
          <Reveal
            type="zoom"
            className="w-[min(calc(100%-48px),var(--shell))] mx-auto mb-7 text-center max-md:w-[min(calc(100%-32px),var(--shell))]"
          >
            {kicker && (
              <span
                className={`inline-block text-[0.68rem] font-bold tracking-[0.2em] uppercase mb-3 ${eyebrowColor[t]}`}
                style={tc(textColors.accent, textColors.main)}
              >
                {kicker}
              </span>
            )}
            {title && (
              <h2
                className={`font-serif font-bold text-[clamp(2rem,4vw,2.8rem)] leading-none ${titleColor[t]}`}
                style={tc(textColors.title, textColors.main)}
              >
                {title}
              </h2>
            )}
          </Reveal>
        )}

        <Reveal
          type="up"
          className="w-[min(calc(100%-48px),var(--shell))] mx-auto max-md:w-[min(calc(100%-32px),var(--shell))]"
        >
          <div
            ref={wrapRef}
            className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-[0_20px_60px_rgba(8,15,13,0.35)]"
          >
            {live && embedSrc ? (
              isLocal ? (
                <video src={embedSrc} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <iframe
                  src={embedSrc}
                  title={title || 'Video'}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  loading="lazy"
                />
              )
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
