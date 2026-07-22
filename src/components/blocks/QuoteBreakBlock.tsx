import { Reveal } from '@/components/Reveal';
import type { QuoteBreakBlockProps } from './types';
import BlockBackground from './BlockBackground';
import { resolveBlockStyles, resolveBlockPaddingClass, tc } from './blockStyles';

const themeMap = {
  terra: {
    bg: 'bg-terra bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]',
    border: 'border-white/8',
    eyebrowColor: 'text-white/70',
    lineColor: 'rgba(255,255,255,0.44)',
    lineAccent: 'rgba(232,184,50,0.28)',
  },
  forest: {
    bg: 'bg-forest-mid bg-[linear-gradient(180deg,rgba(212,168,67,0.10),rgba(255,255,255,0.02))]',
    border: 'border-white/8',
    eyebrowColor: 'text-gold-lt',
    lineColor: 'rgba(255,255,255,0.44)',
    lineAccent: 'rgba(232,184,50,0.28)',
  },
};

export default function QuoteBreakBlock(props: QuoteBreakBlockProps) {
  const { quote, eyebrow, theme = 'terra', bgImage, bgImageOpacity } = props;
  const { className: customBgClass, style: customStyle, hasCustomBg, textColors } = resolveBlockStyles(props, theme === 'forest' ? 'dark' : 'light');
  const themeKey = theme === 'forest' ? 'forest' : 'terra';
  const t = themeMap[themeKey];

  // When no custom bg, use the theme-specific gradient class. When custom bg set, use customBgClass.
  const sectionClass = hasCustomBg ? customBgClass : t.bg;
  const hasPxPadding = props.customPaddingTop != null || props.customPaddingBottom != null
    || props.customPaddingLeft != null || props.customPaddingRight != null;
  const paddingClass = hasPxPadding ? '' : (resolveBlockPaddingClass(props.customPaddingSize) || 'py-[clamp(52px,8vw,88px)] max-md:py-[clamp(36px,6vw,56px)] max-sm:py-[clamp(28px,5vw,44px)]');

  return (
    <div
      className={`relative overflow-hidden flex items-center ${sectionClass} text-white ${paddingClass} px-6 text-center border-y ${t.border} max-md:px-5 max-sm:px-4`}
      style={customStyle}
    >
      <BlockBackground bgImage={bgImage} bgImageOpacity={bgImageOpacity} />
      {/* decorative large quote mark */}
      <div
        className="absolute top-[-0.15em] left-1/2 -translate-x-1/2 font-serif text-[clamp(10rem,22vw,20rem)] italic leading-none text-white/92 opacity-10 pointer-events-none z-0"
        aria-hidden="true"
      >
        &ldquo;
      </div>
      {/* border lines */}
      <div
        className={`absolute top-[22px] bottom-[22px] left-1/2 w-[min(calc(100%-48px),var(--shell))] -translate-x-1/2 pointer-events-none z-0 opacity-26`}
        style={{
          background: `linear-gradient(90deg,transparent,${t.lineColor},${t.lineAccent},${t.lineColor},transparent) center top / 100% 1px no-repeat, linear-gradient(90deg,transparent,${t.lineColor},${t.lineAccent},${t.lineColor},transparent) center bottom / 100% 1px no-repeat`,
        }}
        aria-hidden="true"
      />

      <Reveal type="zoom" className="relative z-10 max-w-[980px] mx-auto">
        {eyebrow && (
          <span
            className={`inline-block text-[0.68rem] font-bold tracking-[0.2em] uppercase ${t.eyebrowColor} mb-5 max-md:text-[0.62rem] max-md:tracking-[0.15em] max-md:mb-3 max-sm:text-[0.58rem] max-sm:tracking-[0.14em] max-sm:mb-2`}
            style={tc(textColors.accent, textColors.main)}
          >
            {eyebrow}
          </span>
        )}
        <blockquote>
          <p
            className="font-serif text-[clamp(1.3rem,2.5vw,1.7rem)] italic leading-[1.52] text-justify text-white/94 [text-justify:inter-word] [hyphens:auto] max-md:text-[clamp(1.1rem,3vw,1.4rem)] max-sm:text-[clamp(1rem,4vw,1.25rem)]"
            style={tc(textColors.body, textColors.main)}
          >
            {quote}
          </p>
        </blockquote>
      </Reveal>
    </div>
  );
}
