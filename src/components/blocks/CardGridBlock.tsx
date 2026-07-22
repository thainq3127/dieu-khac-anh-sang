import { Reveal, RevealGroup } from '@/components/Reveal';
import type { CardGridBlockProps } from './types';
import BlockBackground from './BlockBackground';
import { resolveBlockStyles, tc } from './blockStyles';

const eyebrowColor: Record<string, string> = {
  light: 'text-terra',
  dark: 'text-gold-lt',
};

const titleColor: Record<string, string> = {
  light: 'text-ivory',
  dark: 'text-white',
};

const subtitleColor: Record<string, string> = {
  light: 'text-muted',
  dark: 'text-gold-lt',
};

const cardBg: Record<string, string> = {
  light: 'bg-surface border-border hover:shadow-[0_14px_48px_rgba(8,15,13,0.18)]',
  dark: 'bg-white/6 border-white/12',
};

const cardPrefixColor: Record<string, string> = {
  light: 'text-gold opacity-24',
  dark: 'text-gold-lt',
};

const cardTitleColor: Record<string, string> = {
  light: 'text-ivory',
  dark: 'text-white',
};

const cardBodyColor: Record<string, string> = {
  light: 'text-muted',
  dark: 'text-white/72',
};

const bodyTextColor: Record<string, string> = {
  light: 'text-muted',
  dark: 'text-white/72',
};

const colsMap: Record<number, string> = {
  2: 'grid-cols-2 max-md:grid-cols-1',
  3: 'grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1',
  4: 'grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1',
};

export default function CardGridBlock(props: CardGridBlockProps) {
  const {
    id,
    theme = 'light',
    eyebrow,
    chapterNumber,
    title,
    subtitle,
    cards,
    cardStyle = 'plain',
    columns = 3,
    bodyText,
    bgImage,
    bgImageOpacity,
  } = props;

  const { className: customBgClass, style: customStyle, isDark, textColors } = resolveBlockStyles(props, theme);
  const isNumbered = cardStyle === 'numbered-roman' || cardStyle === 'numbered-decimal';
  const themeKey = isDark ? 'dark' : 'light';

  return (
    <section
      className={`${customBgClass} relative overflow-hidden isolate scroll-mt-[138px]`}
      style={customStyle}
      id={id}
    >
      <BlockBackground bgImage={bgImage} bgImageOpacity={bgImageOpacity} />
      <div className="absolute top-[34px] left-1/2 -translate-x-1/2 w-[min(calc(100%-48px),var(--shell))] h-px pointer-events-none z-0 opacity-32 bg-[linear-gradient(90deg,transparent,rgba(200,146,12,0.32),rgba(184,80,48,0.16),rgba(200,146,12,0.32),transparent)] max-sm:top-3.5 max-sm:w-[calc(100%-32px)] max-sm:opacity-24" aria-hidden="true" />
      <div className="absolute bottom-[34px] left-1/2 -translate-x-1/2 w-[min(calc(100%-48px),var(--shell))] h-px pointer-events-none z-0 opacity-32 bg-[linear-gradient(90deg,transparent,rgba(200,146,12,0.32),rgba(184,80,48,0.16),rgba(200,146,12,0.32),transparent)] max-sm:bottom-3.5 max-sm:w-[calc(100%-32px)] max-sm:opacity-24" aria-hidden="true" />

      <div className="relative z-2 w-full">
        {(title || eyebrow) && (
          <Reveal
            type="zoom"
            className="w-[min(calc(100%-48px),var(--shell))] mx-auto mb-8.5 max-md:w-[min(calc(100%-32px),var(--shell))] max-sm:w-[calc(100%-24px)]"
          >
            <header className="flex items-baseline gap-3.5 mb-5 max-md:gap-2.5 max-md:mb-3.5 max-sm:gap-2 max-sm:mb-3">
              {chapterNumber && (
                <span
                  className={`font-serif text-[clamp(3rem,6vw,5rem)] font-bold italic leading-none opacity-15 shrink-0 max-md:text-[clamp(2.2rem,8vw,3rem)] max-sm:text-[clamp(1.8rem,10vw,2.6rem)] ${themeKey === 'dark' ? 'text-gold-lt' : 'text-terra'}`}
                  aria-hidden="true"
                >
                  {chapterNumber}
                </span>
              )}
              {eyebrow && (
                <span
                  className={`inline-block text-[0.68rem] font-bold tracking-[0.18em] uppercase mb-3 max-md:text-[0.62rem] max-sm:text-[0.58rem] ${eyebrowColor[themeKey]}`}
                  style={tc(textColors.accent, textColors.main)}
                >
                  {eyebrow}
                </span>
              )}
            </header>
            {title && (
              <h2
                dangerouslySetInnerHTML={{
                  __html: title.replace(/\\n/g, '<br />')
                }}
                className={`font-serif font-bold text-[clamp(2.4rem,4.5vw,3rem)] mb-2 leading-none max-md:text-[clamp(1.75rem,5.5vw,2.4rem)] max-md:leading-[1.08] max-sm:text-[clamp(1.5rem,6.5vw,2rem)] max-sm:leading-[1.1] max-sm:mb-1.5 ${titleColor[themeKey]}`}
                style={tc(textColors.title, textColors.main)}
              >
              </h2>
            )}
            {subtitle && (
              <p
                className={`font-serif text-[clamp(1rem,1.8vw,1.25rem)] italic mt-1 max-sm:text-[0.88rem] ${subtitleColor[themeKey]}`}
                style={tc(textColors.body, textColors.main)}
              >
                {subtitle}
              </p>
            )}
          </Reveal>
        )}

        <RevealGroup
          className={`w-[min(calc(100%-48px),var(--shell))] mx-auto mb-6 grid ${colsMap[columns]} gap-3.5 max-md:w-[min(calc(100%-32px),var(--shell))] max-sm:w-[calc(100%-24px)]`}
        >
          {cards.map((card, i) => (
            <article
              key={i}
              className={`relative overflow-hidden ${cardBg[themeKey]} border rounded-lg transition-[transform,box-shadow] duration-280 ease-out ${isNumbered ? 'hover:-translate-y-1.5' : ''} group h-full`}
            >
              {isNumbered && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[linear-gradient(90deg,var(--gold),var(--terra))] opacity-0 transition-opacity duration-280 group-hover:opacity-100" />
              )}
              <div className="p-[30px_28px] max-md:p-[24px_22px]">
                {card.prefix && (
                  <div className="flex items-baseline gap-2.5 mb-3">
                    <span
                      className={`inline font-serif text-[clamp(1.8rem,3vw,2.8rem)] italic font-bold leading-none mb-0 ${cardPrefixColor[themeKey]}`}
                      aria-hidden="true"
                      style={tc(textColors.accent, textColors.main)}
                    >
                      {card.prefix}
                    </span>
                    <h3
                      className={`text-[1.18rem] font-bold mb-0 leading-[1.35] ${cardTitleColor[themeKey]}`}
                      style={tc(textColors.title, textColors.main)}
                    >
                      {card.title}
                    </h3>
                  </div>
                )}
                {!card.prefix && (
                  <h3
                    className={`text-[1.08rem] font-bold mb-2.5 leading-[1.4] ${cardTitleColor[themeKey]}`}
                    style={tc(textColors.title, textColors.main)}
                  >
                    {card.title}
                  </h3>
                )}
                <p
                  className={`text-[0.9rem] leading-[1.72] text-justify [text-justify:inter-word] [hyphens:auto] ${cardBodyColor[themeKey]}`}
                  style={tc(textColors.body, textColors.main)}
                >
                  {card.body}
                </p>
              </div>
            </article>
          ))}
        </RevealGroup>

        {bodyText && (
          <Reveal
            type="zoom"
            className="w-[min(calc(100%-48px),var(--shell))] mx-auto max-md:w-[min(calc(100%-32px),var(--shell))] max-sm:w-[calc(100%-24px)]"
          >
            <p
              className={`font-sans text-[clamp(1rem,1.25vw,1.1rem)] font-normal leading-[1.88] max-w-none text-justify [text-justify:inter-word] [hyphens:auto] max-sm:text-[18px] ${bodyTextColor[themeKey]}`}
              style={tc(textColors.body, textColors.main)}
            >
              {bodyText}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
