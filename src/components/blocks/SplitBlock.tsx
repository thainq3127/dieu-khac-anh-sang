import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal, RevealGroup } from '@/components/Reveal';
import Parallax from '@/components/Parallax';
import type { SplitBlockProps, BlockImage, TextElementStyle } from './types';
import BlockBackground from './BlockBackground';
import { resolveBlockStyles, tc, buildElemStyle } from './blockStyles';

const SPLIT_EYEBROW_SIZES: Record<string, string> = {
  small: '0.56rem', medium: '0.68rem', large: '0.80rem', xlarge: '0.92rem', xxlarge: '1.05rem',
};
const SPLIT_TITLE_SIZES: Record<string, string> = {
  small: 'clamp(1.75rem,3vw,2.2rem)',
  medium: 'clamp(2rem,3.8vw,2.6rem)',
  large: 'clamp(2.4rem,4.5vw,3rem)',
  xlarge: 'clamp(2.8rem,5vw,3.6rem)',
  xxlarge: 'clamp(3.2rem,5.5vw,4.2rem)',
};
const SPLIT_SUBTITLE_SIZES: Record<string, string> = {
  small: 'clamp(0.85rem,1.4vw,1rem)',
  medium: 'clamp(1rem,1.8vw,1.25rem)',
  large: 'clamp(1.1rem,2vw,1.4rem)',
  xlarge: 'clamp(1.25rem,2.2vw,1.6rem)',
  xxlarge: 'clamp(1.4rem,2.5vw,1.8rem)',
};
const SPLIT_BODY_SIZES: Record<string, string> = {
  small: '0.88rem', medium: '1rem', large: '1.05rem', xlarge: '1.1rem', xxlarge: '1.15rem',
};
const SPLIT_BLOCKQUOTE_SIZES: Record<string, string> = {
  small: 'clamp(0.88rem,1vw,1rem)',
  medium: 'clamp(1.02rem,1.3vw,1.18rem)',
  large: 'clamp(1.1rem,1.5vw,1.3rem)',
  xlarge: 'clamp(1.2rem,1.7vw,1.45rem)',
  xxlarge: 'clamp(1.35rem,2vw,1.6rem)',
};
const SPLIT_BTN_SIZES: Record<string, string> = {
  small: '0.8rem', medium: '0.9rem', large: '1rem', xlarge: '1.1rem', xxlarge: '1.2rem',
};

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
const miniCardBg: Record<string, string> = {
  light: 'bg-[rgba(251,248,242,0.82)] border-[rgba(26,35,32,0.09)]',
  dark: 'bg-white/6 border-white/12',
};
const miniCardLabel: Record<string, string> = { light: 'text-terra', dark: 'text-gold-lt' };
const miniCardText: Record<string, string> = { light: 'text-muted', dark: 'text-white/72' };

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
  eyebrowStyle, titleStyle, subtitleStyle,
}: {
  eyebrow?: string; chapterNumber?: string; title: string; subtitle?: string; theme: string; textColors: TextColors;
  eyebrowStyle?: TextElementStyle; titleStyle?: TextElementStyle; subtitleStyle?: TextElementStyle;
}) {
  const { style: eyebrowIS, sizeClass: eyebrowSC } = buildElemStyle(eyebrowStyle, SPLIT_EYEBROW_SIZES, tc(textColors.accent, textColors.main) ?? {});
  const { style: titleIS, sizeClass: titleSC } = buildElemStyle(titleStyle, SPLIT_TITLE_SIZES, tc(textColors.title, textColors.main) ?? {});
  const { style: subtitleIS, sizeClass: subtitleSC } = buildElemStyle(subtitleStyle, SPLIT_SUBTITLE_SIZES, tc(textColors.body, textColors.main) ?? {});
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
            className={`inline-block text-[0.68rem] font-bold tracking-[0.18em] uppercase mb-3 max-md:text-[0.62rem] max-md:tracking-[0.15em] max-md:mb-2 max-sm:text-[0.58rem] max-sm:tracking-[0.14em] max-sm:mb-1.5 ${eyebrowColor[theme]} ${eyebrowSC}`}
            style={eyebrowIS}
          >
            {eyebrow}
          </span>
        )}
      </header>
      <h2
        className={`font-serif font-bold text-[clamp(2.4rem,4.5vw,3rem)] mb-2 leading-none max-md:text-[clamp(1.75rem,5.5vw,2.4rem)] max-md:leading-[1.08] max-sm:text-[clamp(1.5rem,6.5vw,2rem)] max-sm:leading-[1.1] max-sm:mb-1.5 ${titleColor[theme]} ${titleSC}`}
        style={titleIS}
        dangerouslySetInnerHTML={{
          __html: title.replace(/\\n/g, '<br />')
        }}
      ></h2>
      {subtitle && (
        <p
          className={`font-serif text-[clamp(1rem,1.8vw,1.25rem)] italic mt-1 max-md:text-[clamp(0.92rem,2.5vw,1.1rem)] max-md:mt-0.5 max-sm:text-[0.88rem] ${subtitleColor[theme]} ${subtitleSC}`}
          style={subtitleIS}
        >
          {subtitle}
        </p>
      )}
    </>
  );
}

function BodyText({ paragraphs, columns, theme, textColors, bodyStyle }: {
  paragraphs: string[]; columns?: boolean; theme: string; textColors: TextColors; bodyStyle?: TextElementStyle;
}) {
  const { style: bodyIS, sizeClass: bodySC } = buildElemStyle(bodyStyle, SPLIT_BODY_SIZES, tc(textColors.body, textColors.main) ?? {});
  return (
    <div className={`body-copy ${columns ? 'columns-2 gap-10 max-md:columns-1' : ''}`}>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className={`max-w-[66ch] mb-4.5 leading-[1.82] text-justify [text-justify:inter-word] [hyphens:auto] max-md:text-[16px] max-md:leading-[1.72] max-md:[hyphens:none] max-sm:text-[18px] max-sm:leading-[1.68] max-sm:mb-3.5 ${bodyColor[theme]} ${bodySC}`}
          style={bodyIS}
        >
          {typeof p === 'object' ? '' : p}
        </p>
      ))}
    </div>
  );
}

// Fills its Reveal wrapper (which must have `relative` in className)
function SingleImage({ image, parallax, fancyboxGroup }: { image: BlockImage; parallax?: boolean; fancyboxGroup?: string }) {
  if (!image.src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted text-xs text-muted-foreground border border-dashed border-border m-4 rounded">
        Chưa tải hình ảnh lên
      </div>
    );
  }
  const imgEl = (
    <Image src={image.src} alt={image.alt} fill className="object-cover object-center transition-transform duration-800 group-hover:scale-104" />
  );
  const parallaxEl = (
    <Parallax strength={16} className="w-full h-full">
      {imgEl}
    </Parallax>
  );
  return (
    <figure className="absolute inset-0 overflow-hidden">
      {fancyboxGroup ? (
        <a href={image.src} data-fancybox={fancyboxGroup} data-caption={image.caption} className="block absolute inset-0 cursor-zoom-in z-1">
          {parallax ? parallaxEl : imgEl}
        </a>
      ) : (
        parallax ? parallaxEl : imgEl
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(7,13,11,0.35)_100%)] pointer-events-none" />
    </figure>
  );
}

// Mosaic tile — fills its Reveal wrapper (which must have `relative overflow-hidden`)
function ImageTile({ image }: { image: BlockImage }) {
  if (!image.src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted text-xs text-muted-foreground border border-dashed border-border rounded">
        Chưa tải hình ảnh lên
      </div>
    );
  }
  return (
    <a
      href={image.src}
      className="absolute inset-0 block overflow-hidden group cursor-zoom-in"
      data-fancybox={image.fancyboxGroup}
      data-caption={image.caption}
    >
      <Image src={image.src} alt={image.alt} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(8,15,13,0.78))] opacity-92 z-1 pointer-events-none" />
      {image.caption && (
        <span className="absolute left-0 right-0 bottom-0 z-10 p-[14px_16px] text-white/94 text-[0.72rem] font-bold tracking-[0.12em] uppercase">
          {image.caption}
        </span>
      )}
    </a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SplitBlock(props: SplitBlockProps) {
  const {
    id,
    theme = 'light',
    eyebrow,
    chapterNumber,
    title,
    subtitle,
    body,
    bodyColumns,
    blockquote,
    tags,
    miniCards,
    miniCardsLayout = 'grid',
    ctaButtons,
    imagePosition = 'right',
    mediaType = 'single',
    images = [],
    parallax,
    galleryBelow,
    statsRow,
    infoCards,
    bgImage,
    bgImageOpacity,
    eyebrowStyle,
    titleStyle,
    subtitleStyle,
    bodyStyle,
    blockquoteStyle,
    ctaButtonsStyle,
  } = props;

  const { className: customBgClass, style: customStyle, isDark, textColors } = resolveBlockStyles(props, theme);
  const isImageLeft = imagePosition === 'left';
  const hasMedia = imagePosition !== 'none';
  const isSingleImg = !mediaType || mediaType === 'single';
  const t = isDark ? 'dark' : 'light';
  const revealDir = isImageLeft ? 'left' : 'right';

  // Ensure every image has a fancyboxGroup so clicks open Fancybox instead of navigating to the URL
  const fancyboxFallback = `block-${id ?? 'gallery'}`;
  const processedImages = images.map((img) => ({
    ...img,
    fancyboxGroup: img.fancyboxGroup ?? fancyboxFallback,
  }));
  const processedGalleryBelow = (galleryBelow ?? []).map((img) => ({
    ...img,
    fancyboxGroup: img.fancyboxGroup ?? fancyboxFallback,
  }));

  // ── Per-mediaType outer grid classes ──
  const gridCols = (() => {
    if (!hasMedia) return '';
    switch (mediaType) {
      case 'grid-2x3': return 'grid-cols-2';
      case 'mosaic-4': return isImageLeft ? 'grid-cols-[1.1fr_0.9fr]' : 'grid-cols-[0.9fr_1.1fr]';
      case 'mosaic-1+2': return isImageLeft ? 'grid-cols-[1.06fr_0.94fr]' : 'grid-cols-[0.94fr_1.06fr]';
      case 'info-cards': return isImageLeft ? 'grid-cols-[1.08fr_0.92fr]' : 'grid-cols-[0.92fr_1.08fr]';
      default: return isImageLeft ? 'grid-cols-[0.8fr_1fr]' : 'grid-cols-[1.1fr_1.02fr]';
    }
  })();

  // min-height only for single-image split (other types are height-driven by content)
  const gridExtra = (() => {
    if (!hasMedia) return '';
    if (isSingleImg) return 'min-h-[clamp(620px,75svh,820px)]';
    if (mediaType === 'info-cards') return 'items-start gap-[clamp(32px,4.5vw,72px)]';
    return 'items-center gap-[clamp(36px,5vw,72px)]';
  })();

  // ── Per-mediaType text column Reveal class ──
  const textColClass = (() => {
    if (!hasMedia) return '';
    if (isSingleImg) return 'px-[clamp(36px,3vw,80px)] flex flex-col justify-center max-md:px-[clamp(20px,4vw,40px)] max-sm:px-[18px] mb-5';
    if (mediaType === 'grid-2x3') return 'py-[clamp(36px,4.5vw,52px)]';
    if (mediaType === 'mosaic-4') return 'min-w-0 pt-[clamp(32px,4.5vw,56px)]';
    return 'min-w-0'; // mosaic-1+2, info-cards
  })();

  const { style: bqIS, sizeClass: bqSC } = buildElemStyle(blockquoteStyle, SPLIT_BLOCKQUOTE_SIZES, tc(textColors.body, textColors.main) ?? {});
  const { style: btnIS, sizeClass: btnSC } = buildElemStyle(ctaButtonsStyle, SPLIT_BTN_SIZES);

  // ── Text column ──
  const textCol = (
    <Reveal type={isImageLeft ? 'right' : 'left'} className={textColClass}>
      <ChapterHeader
        eyebrow={eyebrow} chapterNumber={chapterNumber} title={title} subtitle={subtitle}
        theme={t} textColors={textColors}
        eyebrowStyle={eyebrowStyle} titleStyle={titleStyle} subtitleStyle={subtitleStyle}
      />
      <BodyText paragraphs={body} columns={bodyColumns} theme={t} textColors={textColors} bodyStyle={bodyStyle} />

      {blockquote && (
        <blockquote className={`mt-7 pl-5 border-l-3 ${blockquoteBorder[t]}`}>
          <p
            className={`font-serif text-[clamp(1.02rem,1.3vw,1.18rem)] italic leading-[1.66] text-justify [text-justify:inter-word] [hyphens:auto] ${blockquoteText[t]} ${bqSC}`}
            style={bqIS}
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

      {miniCards && miniCards.length > 0 && (
        <RevealGroup className={miniCardsLayout === 'vertical' ? 'flex flex-col gap-3.5 mt-6 w-full' : 'grid grid-cols-3 gap-3.5 mt-6 max-lg:grid-cols-2 max-sm:grid-cols-1'}>
          {miniCards.map((card, i) => {
            const isVertical = miniCardsLayout === 'vertical';
            return (
              <article key={i} className={`${miniCardBg[t]} border rounded-md ${isVertical ? 'text-center p-[24px_28px]' : 'p-[22px_20px] h-full'}`}>
                <strong
                  className={`block uppercase mb-2 ${miniCardLabel[t]} ${isVertical ? 'text-[0.95rem] font-bold tracking-[0.1em]' : 'text-[0.88rem] font-bold tracking-[0.08em]'}`}
                  style={tc(textColors.accent, textColors.main)}
                >
                  {card.label}
                </strong>
                <p
                  className={`${miniCardText[t]} ${isVertical ? 'text-[0.92rem] leading-[1.8]' : 'text-[0.88rem] leading-[1.7]'}`}
                  style={tc(textColors.body, textColors.main)}
                >
                  {card.text}
                </p>
              </article>
            );
          })}
        </RevealGroup>
      )}

      {ctaButtons && ctaButtons.length > 0 && (
        <div className="flex gap-3.5 flex-wrap mt-7 max-sm:flex-col max-sm:items-stretch max-sm:gap-2.5">
          {ctaButtons.map((btn, idx) => {
            const cls =
              btn.variant === 'primary'
                ? `inline-flex items-center gap-2 py-[13px] px-7 bg-terra text-white rounded-md text-[0.9rem] font-bold tracking-[0.03em] transition-[background-color,transform] duration-220 hover:bg-terra-dark hover:-translate-y-0.5 max-sm:w-full max-sm:justify-center ${btnSC}`
                : `inline-flex items-center gap-2 py-[13px] px-7 border-[1.5px] border-white/36 text-white rounded-md text-[0.9rem] font-semibold transition-[border-color,background-color] duration-220 hover:border-white hover:bg-white/10 max-sm:w-full max-sm:justify-center ${btnSC}`;
            if (btn.isInternal && btn.locale) {
              return (
                <Link key={`${btn.label}-${idx}`} href={`/${btn.locale}${btn.href}`} className={cls} style={btnIS}>
                  <span>{btn.label}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
              );
            }
            return <a key={`${btn.label}-${idx}`} href={btn.href} className={cls} style={btnIS}>{btn.label}</a>;
          })}
        </div>
      )}
    </Reveal>
  );

  // ── Media column (per mediaType) ──
  // mosaic-4 and mosaic-1+2 use individual <Reveal> per tile so CSS grid span
  // directives (row-span-3, col-span-2) land on the motion.div — the actual grid item.
  // RevealGroup wraps each child in an extra motion.div, which breaks those directives.
  let mediaColJSX: React.ReactNode = null;

  if (hasMedia) {
    if (isSingleImg && processedImages[0]) {
      mediaColJSX = (
        <Reveal
          type={revealDir}
          className="overflow-hidden min-h-[clamp(520px,72svh,820px)] relative max-md:min-h-[340px] group"
        >
          {isImageLeft && (
            <div className="absolute top-[clamp(28px,5vw,56px)] bottom-[clamp(28px,5vw,56px)] right-0 w-px bg-[linear-gradient(180deg,transparent,rgba(232,184,50,0.72),transparent)] opacity-58 pointer-events-none z-10" />
          )}
          {!isImageLeft && (
            <div className="absolute top-[clamp(28px,5vw,56px)] bottom-[clamp(28px,5vw,56px)] left-0 w-px bg-[linear-gradient(180deg,transparent,rgba(232,184,50,0.72),transparent)] opacity-58 pointer-events-none z-10" />
          )}
          <SingleImage image={processedImages[0]} parallax={parallax} fancyboxGroup={processedImages[0].fancyboxGroup} />
        </Reveal>
      );

    } else if (mediaType === 'info-cards') {
      mediaColJSX = (
        <RevealGroup className={miniCardsLayout === 'vertical' ? 'flex flex-col gap-3.5 mt-6 w-full' : 'grid grid-cols-3 gap-3.5 mt-6 self-stretch max-lg:grid-cols-2 max-sm:grid-cols-1'}>
          {(infoCards ?? []).map((card, i) => (
            <article key={i} className="bg-white/6 border border-white/12 rounded-lg p-[20px_16px] h-full">
              {card.prefix && (
                <span className="inline-block mb-4 font-serif text-[clamp(1.6rem,2.6vw,2.3rem)] italic font-bold text-gold-lt leading-none">
                  {card.prefix}
                </span>
              )}
              <h3 className="text-[1.08rem] leading-[1.4] text-white mb-2.5 font-bold">{typeof card.title === 'object' ? '' : card.title}</h3>
              <p className="text-[0.92rem] leading-[1.74] text-white/72">{typeof card.body === 'object' ? '' : card.body}</p>
            </article>
          ))}
        </RevealGroup>
      );

    } else if (mediaType === 'grid-2x3') {
      mediaColJSX = (
        <RevealGroup className="grid grid-cols-2 gap-1 max-sm:grid-cols-1">
          {processedImages.map((img, i) => (
            <figure key={i} className="relative overflow-hidden aspect-4/3 group">
              {img.src ? (
                <a href={img.src} data-fancybox={img.fancyboxGroup} data-caption={img.caption} className="block absolute inset-0 cursor-zoom-in z-1">
                  <Parallax strength={14 + i * 2} className="w-full h-full">
                    <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                  </Parallax>
                </a>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted text-xs text-muted-foreground border border-dashed border-border rounded">
                  Chưa tải hình ảnh lên
                </div>
              )}
            </figure>
          ))}
        </RevealGroup>
      );

    } else if (mediaType === 'mosaic-4') {
      const [tall, ...small] = processedImages;
      mediaColJSX = (
        <div className="grid grid-cols-[1.02fr_0.98fr] grid-rows-[repeat(3,minmax(140px,1fr))] gap-2 max-sm:grid-cols-1 max-sm:grid-rows-none">
          <Reveal
            type={revealDir}
            className="row-span-3 max-sm:row-span-1 relative overflow-hidden min-h-[180px] max-sm:min-h-60"
          >
            <ImageTile image={tall} />
          </Reveal>
          {small.map((img, i) => (
            <Reveal key={i} type="up" delay={0.12 + i * 0.09} className="relative overflow-hidden min-h-[250px]">
              <ImageTile image={img} />
            </Reveal>
          ))}
        </div>
      );

    } else if (mediaType === 'mosaic-1+2') {
      const [wide, ...rest] = processedImages;
      mediaColJSX = (
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <Reveal
            type={revealDir}
            className="col-span-2 max-sm:col-span-1 relative overflow-hidden min-h-[clamp(340px,44vw,520px)] max-sm:min-h-52"
          >
            <ImageTile image={wide} />
          </Reveal>
          {rest.map((img, i) => (
            <Reveal key={i} type="up" delay={0.15 + i * 0.1} className="relative overflow-hidden min-h-60 max-sm:min-h-48">
              <ImageTile image={img} />
            </Reveal>
          ))}
        </div>
      );
    }
  }

  return (
    <section
      className={`${customBgClass} relative overflow-hidden isolate scroll-mt-[138px]`}
      style={customStyle}
      id={id}
    >
      <BlockBackground bgImage={bgImage} bgImageOpacity={bgImageOpacity} />
      <SectionBorders />

      <div className="relative z-2 w-full">
        {!hasMedia && (
          <Reveal
            type="zoom"
            className="w-[min(calc(100%-48px),var(--shell))] mx-auto mb-8.5 max-md:w-[min(calc(100%-32px),var(--shell))] max-sm:w-[calc(100%-24px)]"
          >
            <ChapterHeader eyebrow={eyebrow} chapterNumber={chapterNumber} title={title} subtitle={subtitle} theme={t} textColors={textColors} />
            <BodyText paragraphs={body} columns={bodyColumns} theme={t} textColors={textColors} />
          </Reveal>
        )}

        {hasMedia && (
          <div className={`grid ${gridCols} ${gridExtra} w-[min(calc(100%-48px),var(--shell))] max-w-(--shell) mx-auto max-md:grid-cols-1 max-md:w-[min(calc(100%-32px),var(--shell))] max-sm:w-[calc(100%-24px)]`}>
            {isImageLeft ? <>{mediaColJSX}{textCol}</> : <>{textCol}{mediaColJSX}</>}
          </div>
        )}

        {processedGalleryBelow.length > 0 && (
          <RevealGroup className="w-[min(calc(100%-48px),var(--shell))] mx-auto mt-10 grid grid-cols-3 gap-1 max-md:grid-cols-1 max-md:gap-2 max-md:w-[min(calc(100%-32px),var(--shell))] max-sm:w-[calc(100%-24px)]">
            {processedGalleryBelow.map((img, i) => (
              <figure key={i} className="relative overflow-hidden aspect-[4/3] group">
                {img.src ? (
                  <a href={img.src} data-fancybox={img.fancyboxGroup} data-caption={img.caption} className="block absolute inset-0 cursor-zoom-in z-1">
                    <Parallax strength={14 + i * 4} className="w-full h-full">
                      <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
                    </Parallax>
                  </a>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted text-xs text-muted-foreground border border-dashed border-border rounded">
                    Chưa tải hình ảnh lên
                  </div>
                )}
              </figure>
            ))}
          </RevealGroup>
        )}

        {statsRow && statsRow.length > 0 && (
          <RevealGroup className="w-[min(calc(100%-48px),var(--shell))] mx-auto mt-[clamp(32px,4vw,48px)] grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1 max-sm:w-[calc(100%-24px)]">
            {statsRow.map((stat, i) => (
              <article key={i} className="bg-[rgba(255,250,242,0.72)] border border-[rgba(26,35,32,0.09)] p-[28px_24px] min-h-[190px] flex flex-col gap-3 shadow-[0_12px_30px_rgba(8,15,13,0.06)] max-sm:min-h-0 max-sm:p-4">
                <strong className="text-center font-serif text-[clamp(2rem,2vw,3rem)] italic leading-none text-terra max-sm:text-[1.5rem]">
                  {stat.value}
                </strong>
                <span className="text-[0.88rem] leading-[1.72] text-muted text-justify [text-justify:inter-word] [hyphens:auto]">
                  {stat.text}
                </span>
              </article>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  );
}
