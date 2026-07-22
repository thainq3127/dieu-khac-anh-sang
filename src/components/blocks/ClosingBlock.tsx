import { Reveal } from '@/components/Reveal';
import type { ClosingBlockProps } from './types';
import BlockBackground from './BlockBackground';
import { resolveBlockStyles, resolveBlockPaddingClass, tc } from './blockStyles';

const eyebrowColor: Record<string, string> = { light: 'text-terra', dark: 'text-gold-lt' };
const qColor: Record<string, string> = { light: 'text-ivory', dark: 'text-white' };
const subColor: Record<string, string> = { light: 'text-muted', dark: 'text-white/72' };

export default function ClosingBlock(props: ClosingBlockProps) {
  const { id, kicker, q1, q2, sub1, sub2, author, theme = 'dark', bgImage, bgImageOpacity } = props;
  const { className: customBgClass, style: customStyle, isDark, textColors } = resolveBlockStyles(props, theme);
  const t = isDark ? 'dark' : 'light';
  const hasPxPadding = props.customPaddingTop != null || props.customPaddingBottom != null
    || props.customPaddingLeft != null || props.customPaddingRight != null;
  const paddingClass = hasPxPadding ? '' : (resolveBlockPaddingClass(props.customPaddingSize) || 'py-[clamp(64px,9vw,110px)] max-md:py-[clamp(40px,6vw,64px)]');

  return (
    <section
      id={id}
      className={`${customBgClass} ${paddingClass} relative overflow-hidden isolate scroll-mt-[138px] text-center`}
      style={customStyle}
    >
      <BlockBackground bgImage={bgImage} bgImageOpacity={bgImageOpacity} />

      <Reveal type="zoom" className="relative z-10 max-w-[820px] mx-auto px-6">
        {kicker && (
          <span
            className={`inline-block text-[0.68rem] font-bold tracking-[0.22em] uppercase mb-6 ${eyebrowColor[t]}`}
            style={tc(textColors.accent, textColors.main)}
          >
            {kicker}
          </span>
        )}

        <p
          className={`font-serif italic text-[clamp(1.55rem,3.4vw,2.5rem)] leading-[1.4] ${qColor[t]}`}
          style={tc(textColors.title, textColors.main)}
          dangerouslySetInnerHTML={{ __html: q1.replace(/\\n/g, '<br />') }}
        />
        {q2 && (
          <p
            className={`font-serif italic text-[clamp(1.55rem,3.4vw,2.5rem)] leading-[1.4] mt-1 ${qColor[t]}`}
            style={tc(textColors.title, textColors.main)}
            dangerouslySetInnerHTML={{ __html: q2.replace(/\\n/g, '<br />') }}
          />
        )}

        {(sub1 || sub2) && (
          <div className="mt-8 space-y-1">
            {sub1 && (
              <p className={`text-[0.95rem] ${subColor[t]}`} style={tc(textColors.body, textColors.main)}>{sub1}</p>
            )}
            {sub2 && (
              <p className={`text-[0.95rem] ${subColor[t]}`} style={tc(textColors.body, textColors.main)}>{sub2}</p>
            )}
          </div>
        )}

        {author && (
          <p className={`mt-7 text-[0.78rem] font-bold uppercase tracking-[0.18em] ${eyebrowColor[t]}`}>
            — {author}
          </p>
        )}
      </Reveal>
    </section>
  );
}
