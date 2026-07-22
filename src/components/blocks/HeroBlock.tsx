'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { resolveAssetUrl } from '@/lib/assets';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

import type { HeroBlockProps } from './types';
import { resolveBlockStyles, tc, buildElemStyle } from './blockStyles';

const TITLE_SIZES: Record<string, string> = {
  small: 'clamp(2rem,2.8vw,3.5rem)',
  medium: 'clamp(2.4rem,3.2vw,4.4rem)',
  large: 'clamp(2.8rem,4vw,5.5rem)',
  xlarge: 'clamp(3.4rem,4.8vw,6.5rem)',
  xxlarge: 'clamp(4rem,5.5vw,7.5rem)',
};
const EYEBROW_SIZES: Record<string, string> = {
  small: '0.6rem', medium: '0.7rem', large: '0.85rem', xlarge: '1rem', xxlarge: '1.2rem',
};
const SUBTITLE_SIZES: Record<string, string> = {
  small: 'clamp(0.95rem,1vw,1.2rem)',
  medium: 'clamp(1.1rem,1.2vw,1.5rem)',
  large: 'clamp(1.3rem,1.5vw,1.8rem)',
  xlarge: 'clamp(1.5rem,1.8vw,2.2rem)',
  xxlarge: 'clamp(1.8rem,2.2vw,2.6rem)',
};
const BUTTON_SIZES: Record<string, string> = {
  small: '0.8rem', medium: '0.9rem', large: '1rem', xlarge: '1.1rem', xxlarge: '1.2rem',
};

export default function HeroBlock(props: HeroBlockProps) {
  const {
    images,
    eyebrow,
    title,
    subtitle,
    buttons = [],
    scrollLabel,
    paginationId = 'hero-swiper-pagination-main',
    contentAlign = 'start',
    audioUrl,
    titleStyle,
    eyebrowStyle,
    subtitleStyle,
    buttonsStyle,
  } = props;

  const { className: customBgClass, style: customStyle, textColors } = resolveBlockStyles(props, 'dark');
  const headingId = 'hero-heading';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isExplicitlyPausedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(resolveAssetUrl(audioUrl));
    audio.loop = true;
    audioRef.current = audio;

    const playAudio = () => {
      if (isExplicitlyPausedRef.current) return;
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("Autoplay blocked, user interaction required:", err);
          setIsPlaying(false);
        });
    };

    playAudio();

    const handleInteraction = () => {
      if (isExplicitlyPausedRef.current) return;
      playAudio();
      removeInteractionListeners();
    };

    const removeInteractionListeners = () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('scroll', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      audio.pause();
      removeInteractionListeners();
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      isExplicitlyPausedRef.current = true;
      setIsPlaying(false);
    } else {
      isExplicitlyPausedRef.current = false;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Failed to play audio:", err);
        });
    }
  };

  const alignClass =
    contentAlign === 'end'
      ? 'justify-end max-sm:justify-end max-sm:pb-[10dvh]'
      : 'justify-center max-sm:justify-end max-sm:pb-[10dvh]';

  const { style: titleIS, sizeClass: titleSC } = buildElemStyle(titleStyle, TITLE_SIZES, tc(textColors.title, textColors.main) ?? {});
  const { style: eyebrowIS, sizeClass: eyebrowSC } = buildElemStyle(eyebrowStyle, EYEBROW_SIZES, tc(textColors.accent, textColors.main) ?? {});
  const { style: subtitleIS, sizeClass: subtitleSC } = buildElemStyle(subtitleStyle, SUBTITLE_SIZES, tc(textColors.body, textColors.main) ?? {});
  const { style: btnIS, sizeClass: btnSC } = buildElemStyle(buttonsStyle, BUTTON_SIZES);

  return (
    <section
      className={`relative min-h-svh flex flex-col overflow-hidden bg-forest text-white ${customBgClass} ${alignClass}`}
      style={customStyle}
      aria-labelledby={headingId}
    >
      {/* Background carousel */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          speed={1200}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true, el: `.${paginationId}` }}
          className="absolute inset-0 w-full h-full"
        >
          {images.map((src, idx) => {
            const resolvedSrc = resolveAssetUrl(src);
            return (
              <SwiperSlide key={`${src}-${idx}`} className="relative w-full h-full">
                {src ? (
                  <Image
                    src={resolvedSrc}
                    alt=""
                    fill
                    sizes="100vw"
                    priority={idx === 0}
                    className="object-cover object-center animate-[heroZoom_24s_ease-in-out_infinite_alternate]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-forest text-xs text-white/50">Chưa có ảnh slide</div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(8,15,13,0.92)_0%,rgba(8,15,13,0.60)_48%,rgba(8,15,13,0.12)_100%),linear-gradient(0deg,rgba(8,15,13,0.55)_0%,transparent_45%)] z-1 pointer-events-none" />
      </div>

      {/* Content */}
      <Reveal
        type="zoom"
        className="relative z-10 w-full min-w-0 self-start my-0 pt-[clamp(180px,24vh,280px)] px-[clamp(24px,6vw,80px)] pb-[clamp(32px,6vh,64px)] max-w-[min(1120px,74vw)] ml-[max(24px,calc((100vw-var(--shell))/2))] max-sm:self-start max-sm:py-8 max-sm:px-5 max-sm:ml-0 max-sm:mb-0 max-sm:w-full max-sm:max-w-full"
      >
        {eyebrow && (
          <p
            className={`flex items-center gap-2.5 text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gold-lt mb-4 max-sm:text-[0.62rem] max-sm:tracking-[0.16em] max-sm:mb-3 ${eyebrowSC}`}
            style={eyebrowIS}
          >
            <span className="block w-8 h-[1.5px] bg-gold-lt opacity-70" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h1
          id={headingId}
          dangerouslySetInnerHTML={{
            __html: title.replace(/\\n/g, '<br />')
          }}
          className={`italic font-serif font-bold text-[clamp(2.8rem,4vw,5.5rem)] leading-[120%] tracking-[-0.045em] [text-shadow:0_4px_48px_rgba(0,0,0,0.5)] whitespace-normal text-white max-sm:text-[clamp(1.8rem,8vw,2.8rem)] max-sm:leading-[0.94] max-sm:mb-3.5 ${titleSC}`}
          style={titleIS}
        >
          {/* {title} */}
        </h1>
        {subtitle && (
          <p
            className={`my-8 font-serif text-[clamp(1.1rem,1.2vw,1.5rem)] italic text-[rgba(255,255,255,0.76)] max-sm:text-[clamp(1rem,4.8vw,1.18rem)] max-sm:mt-2 max-sm:mb-6 ${subtitleSC}`}
            style={subtitleIS}
          >
            {subtitle}
          </p>
        )}
        {buttons.length > 0 && (
          <div className="flex gap-3.5 flex-wrap max-sm:flex-col max-sm:items-stretch max-sm:gap-2.5">
            {buttons.map((btn, idx) => {
              const baseClass =
                btn.variant === 'primary'
                  ? `btn btn-primary inline-flex items-center gap-2 py-[13px] px-7 bg-terra text-white rounded-[10px] text-[0.9rem] font-bold tracking-[0.03em] transition-[background-color,transform] duration-220 hover:bg-terra-dark hover:-translate-y-0.5 max-sm:w-full max-sm:justify-center ${btnSC}`
                  : `inline-flex items-center gap-2 py-[13px] px-7 border-[1.5px] border-white/36 text-white rounded-[10px] text-[0.9rem] font-semibold transition-[border-color,background-color] duration-220 hover:border-white hover:bg-white/10 max-sm:w-full max-sm:justify-center ${btnSC}`;

              if (btn.is3d) {
                return (
                  <button
                    key={`${btn.label}-${idx}`}
                    type="button"
                    className={baseClass}
                    style={btnIS}
                    data-3d-trigger={btn.href}
                  >
                    <span>{btn.label}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </button>
                );
              }
              if (btn.isInternal && btn.locale) {
                return (
                  <Link key={`${btn.label}-${idx}`} href={`/${btn.locale}${btn.href}`} className={baseClass} style={btnIS}>
                    <span>{btn.label}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </Link>
                );
              }
              return (
                <a key={`${btn.label}-${idx}`} href={btn.href} className={baseClass} style={btnIS}>
                  <span>{btn.label}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        )}
      </Reveal>

      {/* Pagination dots */}
      <div
        className={`${paginationId} absolute bottom-8 left-1/2 -translate-x-1/2 z-10 justify-center`}
      />

      {/* Scroll cue */}
      {scrollLabel && (
        <div
          className="absolute bottom-[clamp(164px,18vw,214px)] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 text-white/35 text-[0.6rem] font-bold tracking-[0.16em] uppercase animate-[scrollPulse_2.6s_ease-in-out_infinite] z-2 max-sm:hidden"
          aria-hidden="true"
        >
          <span>{scrollLabel}</span>
          <svg width="1" height="40" viewBox="0 0 1 40">
            <line x1="0.5" y1="0" x2="0.5" y2="40" stroke="currentColor" strokeWidth={1.5} />
          </svg>
        </div>
      )}

      {audioUrl && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Tắt âm thanh' : 'Bật âm thanh'}
          className={`${isScrolled ? 'fixed' : 'absolute'} bottom-6 right-6 z-9999 w-11 h-11 rounded-full border border-white/30 bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/45 transition-colors`}
        >
          <span className="sr-only">{isPlaying ? 'Tắt âm thanh' : 'Bật âm thanh'}</span>
          <span aria-hidden="true">{isPlaying ? '♪' : '♫'}</span>
        </button>
      )}
    </section>
  );
}
