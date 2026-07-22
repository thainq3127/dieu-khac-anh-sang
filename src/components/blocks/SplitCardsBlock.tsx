'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal, RevealGroup } from '@/components/Reveal';
import type { SplitCardsBlockProps } from './types';
import BlockBackground from './BlockBackground';
import { resolveBlockStyles, tc } from './blockStyles';

// ─── Theme tokens ─────────────────────────────────────────────────────────────

const eyebrowColor: Record<string, string> = { light: 'text-terra', dark: 'text-gold-lt' };
const titleColor: Record<string, string> = { light: 'text-ivory', dark: 'text-white' };
const subtitleColor: Record<string, string> = { light: 'text-muted', dark: 'text-gold-lt' };
const bodyColor: Record<string, string> = { light: 'text-muted', dark: 'text-white/72' };
const blockquoteBorder: Record<string, string> = { light: 'border-terra', dark: 'border-gold' };
const blockquoteText: Record<string, string> = { light: 'text-terra-dark', dark: 'text-gold-lt' };
const tagBg: Record<string, string> = {
  light: 'bg-[rgba(184,80,48,0.08)] border-[rgba(184,80,48,0.22)] text-terra-dark',
  dark: 'bg-white/8 border-white/18 text-gold-lt',
};

const cardBg: Record<string, string> = {
  light: 'bg-[rgba(251,248,242,0.82)] border-[rgba(26,35,32,0.09)] shadow-[0_12px_30px_rgba(8,15,13,0.06)]',
  dark: 'bg-white/6 border-white/12',
};
const cardTitleColor: Record<string, string> = {
  light: 'text-ivory',
  dark: 'text-white',
};
const cardBodyColor: Record<string, string> = {
  light: 'text-muted',
  dark: 'text-white/72',
};
const cardPrefixColor: Record<string, string> = {
  light: 'text-terra',
  dark: 'text-gold-lt',
};

// ─── Sub-renderers ────────────────────────────────────────────────────────────

function SectionBorders() {
  return (
    <>
      <div className="absolute top-[34px] left-1/2 -translate-x-1/2 w-[min(calc(100%-48px),var(--shell))] h-px pointer-events-none z-0 opacity-32 bg-[linear-gradient(90deg,transparent,rgba(200,146,12,0.32),rgba(184,80,48,0.16),rgba(200,146,12,0.32),transparent)] max-sm:top-3.5 max-sm:w-[calc(100%-32px)] max-sm:opacity-24" aria-hidden="true" />
      <div className="absolute bottom-[34px] left-1/2 -translate-x-1/2 w-[min(calc(100%-48px),var(--shell))] h-px pointer-events-none z-0 opacity-32 bg-[linear-gradient(90deg,transparent,rgba(200,146,12,0.32),rgba(184,80,48,0.16),rgba(200,146,12,0.32),transparent)] max-sm:bottom-3.5 max-sm:w-[calc(100%-32px)] max-sm:opacity-24" aria-hidden="true" />
    </>
  );
}

type TextColors = { title: string | null; body: string | null; accent: string | null; main: string | null };

function ChapterHeader({
  eyebrow, chapterNumber, title, subtitle, theme, textColors,
}: { eyebrow?: string; chapterNumber?: string; title: string; subtitle?: string; theme: string; textColors: TextColors }) {
  return (
    <>
      <header className="flex items-baseline gap-3.5 mb-5 max-md:gap-2.5 max-md:mb-3.5 max-sm:gap-2 max-sm:mb-3">
        {chapterNumber && (
          <span
            className={`font-serif text-[clamp(3rem,6vw,5rem)] font-bold italic leading-none opacity-15 shrink-0 max-md:text-[clamp(2.2rem,8vw,3rem)] max-sm:text-[clamp(1.8rem,10vw,2.6rem)] ${theme === 'dark' ? 'text-gold-lt' : 'text-terra'}`}
            aria-hidden="true"
          >
            {chapterNumber}
          </span>
        )}
        {eyebrow && (
          <span
            className={`inline-block text-[0.68rem] font-bold tracking-[0.18em] uppercase mb-3 max-md:text-[0.62rem] max-md:tracking-[0.15em] max-md:mb-2 max-sm:text-[0.58rem] max-sm:tracking-[0.14em] max-sm:mb-1.5 ${eyebrowColor[theme]}`}
            style={tc(textColors.accent, textColors.main)}
          >
            {eyebrow}
          </span>
        )}
      </header>
      <h2
        className={`font-serif font-bold text-[clamp(2.4rem,4.5vw,3rem)] mb-2 leading-none max-md:text-[clamp(1.75rem,5.5vw,2.4rem)] max-md:leading-[1.08] max-sm:text-[clamp(1.5rem,6.5vw,2rem)] max-sm:leading-[1.1] max-sm:mb-1.5 ${titleColor[theme]}`}
        style={tc(textColors.title, textColors.main)}
        dangerouslySetInnerHTML={{
          __html: title.replace(/\\n/g, '<br />')
        }}
      >
      </h2>
      {subtitle && (
        <p
          className={`font-serif text-[clamp(1rem,1.8vw,1.25rem)] italic mt-1 max-md:text-[clamp(0.92rem,2.5vw,1.1rem)] max-md:mt-0.5 max-sm:text-[0.88rem] ${subtitleColor[theme]}`}
          style={tc(textColors.body, textColors.main)}
        >
          {subtitle}
        </p>
      )}
    </>
  );
}

function BodyText({ paragraphs, theme, textColors }: { paragraphs: string[]; theme: string; textColors: TextColors }) {
  return (
    <div className="body-copy">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className={`max-w-[66ch] mb-4.5 leading-[1.82] text-justify [text-justify:inter-word] [hyphens:auto] max-md:text-[16px] max-md:leading-[1.72] max-md:[hyphens:none] max-sm:text-[18px] max-sm:leading-[1.68] max-sm:mb-3.5 ${bodyColor[theme]}`}
          style={tc(textColors.body, textColors.main)}
        >
          {typeof p === 'object' ? '' : p}
        </p>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SplitCardsBlock(props: SplitCardsBlockProps) {
  const {
    id,
    theme = 'light',
    eyebrow,
    chapterNumber,
    title,
    subtitle,
    body,
    blockquote,
    tags,
    ctaButtons,
    imagePosition = 'right',
    infoCards = [],
    bgImage,
    bgImageOpacity,
  } = props;

  const { className: customBgClass, style: customStyle, isDark, textColors } = resolveBlockStyles(props, theme);
  const isImageLeft = imagePosition === 'left';
  const isVerticalLayout = imagePosition === 'top' || imagePosition === 'bottom';
  const t = isDark ? 'dark' : 'light';

  // ── Layout grid class ──
  const gridCols = isImageLeft ? 'grid-cols-[1.08fr_0.92fr]' : 'grid-cols-[0.92fr_1.08fr]';

  // ── Text column ──
  const textCol = (
    <Reveal type={isVerticalLayout ? 'up' : (isImageLeft ? 'right' : 'left')} className="w-full min-w-0">
      <ChapterHeader eyebrow={eyebrow} chapterNumber={chapterNumber} title={title} subtitle={subtitle} theme={t} textColors={textColors} />
      <BodyText paragraphs={body} theme={t} textColors={textColors} />

      {blockquote && (
        <blockquote className={`mt-7 pl-5 border-l-3 ${blockquoteBorder[t]}`}>
          <p
            className={`font-serif text-[clamp(1.02rem,1.3vw,1.18rem)] italic leading-[1.66] text-justify [text-justify:inter-word] [hyphens:auto] ${blockquoteText[t]}`}
            style={tc(textColors.body, textColors.main)}
          >
            {blockquote}
          </p>
        </blockquote>
      )}

      {tags && tags.filter(Boolean).length > 0 && (
        <ul className="flex flex-wrap gap-2.5 mt-9" aria-label="Tags">
          {tags.filter(Boolean).map((tag, i) => (
            <li
              key={i}
              className={`py-2 px-4.5 border rounded-[100px] text-[0.78rem] font-semibold tracking-[0.04em] transition-colors duration-200 ${tagBg[t]}`}
              style={tc(textColors.accent, textColors.main)}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {ctaButtons && ctaButtons.length > 0 && (
        <div className="flex gap-3.5 flex-wrap mt-7 max-sm:flex-col max-sm:items-stretch max-sm:gap-2.5">
          {ctaButtons.map((btn, idx) => {
            const cls =
              btn.variant === 'primary'
                ? 'inline-flex items-center gap-2 py-[13px] px-7 bg-terra text-white rounded-md text-[0.9rem] font-bold tracking-[0.03em] transition-[background-color,transform] duration-220 hover:bg-terra-dark hover:-translate-y-0.5 max-sm:w-full max-sm:justify-center'
                : 'inline-flex items-center gap-2 py-[13px] px-7 border-[1.5px] border-white/36 text-white rounded-md text-[0.9rem] font-semibold transition-[border-color,background-color] duration-220 hover:border-white hover:bg-white/10 max-sm:w-full max-sm:justify-center';
            if (btn.isInternal && btn.locale) {
              return (
                <Link key={`${btn.label}-${idx}`} href={`/${btn.locale}${btn.href}`} className={cls}>
                  <span>{btn.label}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
              );
            }
            return <a key={`${btn.label}-${idx}`} href={btn.href} className={cls}>{btn.label}</a>;
          })}
        </div>
      )}
    </Reveal>
  );

  // ── Cards column ──
  const cardsCol = (
    <RevealGroup
      className={
        isVerticalLayout
          ? 'grid grid-cols-3 gap-4.5 w-full max-lg:grid-cols-2 max-sm:grid-cols-1'
          : 'flex flex-col gap-4.5 self-stretch w-full'
      }
    >
      {infoCards.map((card, i) => (
        <article key={i} className={`${cardBg[t]} border rounded-lg p-[20px_20px] w-full`}>
          {card.prefix && (
            <span
              className={`inline-block mb-3.5 font-serif text-[clamp(1.6rem,2.6vw,2.3rem)] italic font-bold leading-none ${cardPrefixColor[t]}`}
              style={tc(textColors.accent, textColors.main)}
            >
              {card.prefix}
            </span>
          )}
          <h3
            className={`text-[1.08rem] leading-[1.4] mb-2 font-bold ${cardTitleColor[t]}`}
            style={tc(textColors.title, textColors.main)}
          >
            {typeof card.title === 'object' ? '' : card.title}
          </h3>
          <p
            className={`text-[0.92rem] leading-[1.74] ${cardBodyColor[t]}`}
            style={tc(textColors.body, textColors.main)}
          >
            {typeof card.body === 'object' ? '' : card.body}
          </p>
        </article>
      ))}
    </RevealGroup>
  );

  return (
    <section
      className={`${customBgClass} relative overflow-hidden isolate scroll-mt-[138px]`}
      style={customStyle}
      id={id}
    >
      <BlockBackground bgImage={bgImage} bgImageOpacity={bgImageOpacity} />
      <SectionBorders />

      <div className="relative z-2 w-full">
        {isVerticalLayout ? (
          <div className="flex flex-col gap-10 w-[min(calc(100%-48px),var(--shell))] max-w-(--shell) mx-auto max-md:w-[min(calc(100%-32px),var(--shell))] max-sm:w-[calc(100%-24px)]">
            {imagePosition === 'top' ? (
              <>
                {cardsCol}
                {textCol}
              </>
            ) : (
              <>
                {textCol}
                {cardsCol}
              </>
            )}
          </div>
        ) : (
          <div className={`grid ${gridCols} items-start gap-[clamp(32px,4.5vw,72px)] w-[min(calc(100%-48px),var(--shell))] max-w-(--shell) mx-auto max-md:grid-cols-1 max-md:w-[min(calc(100%-32px),var(--shell))] max-sm:w-[calc(100%-24px)]`}>
            {isImageLeft ? <>{cardsCol}{textCol}</> : <>{textCol}{cardsCol}</>}
          </div>
        )}
      </div>
    </section>
  );
}
