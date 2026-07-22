import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import type { SizeBlockProps } from './types';
import BlockBackground from './BlockBackground';
import { resolveBlockStyles, tc } from './blockStyles';
import { resolveAssetUrl } from '@/lib/assets';

const eyebrowColor: Record<string, string> = { light: 'text-terra', dark: 'text-gold-lt' };
const titleColor: Record<string, string> = { light: 'text-ivory', dark: 'text-white' };
const bodyColor: Record<string, string> = { light: 'text-muted', dark: 'text-white/72' };
const cardBg: Record<string, string> = { light: 'bg-surface border-border', dark: 'bg-white/6 border-white/12' };

export default function SizeBlock(props: SizeBlockProps) {
  const {
    id,
    kicker,
    label,
    imageUrl,
    dimensions = [],
    specs = [],
    theme = 'light',
    bgImage,
    bgImageOpacity,
  } = props;
  const { className: customBgClass, style: customStyle, isDark, textColors } = resolveBlockStyles(props, theme);
  const t = isDark ? 'dark' : 'light';

  return (
    <section
      id={id}
      className={`${customBgClass} py-[clamp(52px,7vw,88px)] max-md:py-[clamp(36px,5vw,56px)] relative overflow-hidden isolate scroll-mt-[138px]`}
      style={customStyle}
    >
      <BlockBackground bgImage={bgImage} bgImageOpacity={bgImageOpacity} />

      <div className="relative z-2 w-[min(calc(100%-48px),var(--shell))] mx-auto grid grid-cols-[1fr_1.1fr] gap-[clamp(32px,5vw,72px)] items-center max-md:grid-cols-1 max-md:w-[min(calc(100%-32px),var(--shell))]">
        <Reveal type="left" className="relative aspect-square rounded-lg overflow-hidden bg-black/5">
          {imageUrl ? (
            <Image src={resolveAssetUrl(imageUrl)} alt={label ?? ''} fill className="object-contain" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-xs text-muted-foreground">
              Chưa tải ảnh
            </div>
          )}
        </Reveal>

        <Reveal type="right">
          {kicker && (
            <span
              className={`inline-block text-[0.68rem] font-bold tracking-[0.2em] uppercase mb-3 ${eyebrowColor[t]}`}
              style={tc(textColors.accent, textColors.main)}
            >
              {kicker}
            </span>
          )}
          {label && (
            <h3
              className={`font-serif font-bold text-[clamp(1.6rem,3vw,2.2rem)] mb-6 ${titleColor[t]}`}
              style={tc(textColors.title, textColors.main)}
            >
              {label}
            </h3>
          )}

          {dimensions.length > 0 && (
            <dl className="grid grid-cols-3 gap-3 mb-6">
              {dimensions.map((d, i) => (
                <div key={i} className={`p-4 border rounded-lg text-center ${cardBg[t]}`}>
                  <dt className={`text-[0.64rem] uppercase tracking-wider mb-1 ${eyebrowColor[t]}`}>{d.label}</dt>
                  <dd className={`font-serif text-[1.3rem] font-bold ${titleColor[t]}`} style={tc(textColors.title, textColors.main)}>
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {specs.length > 0 && (
            <dl className="space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="flex justify-between border-b border-border/50 pb-2">
                  <dt className={`text-[0.85rem] ${bodyColor[t]}`} style={tc(textColors.body, textColors.main)}>{s.label}</dt>
                  <dd className={`text-[0.85rem] font-semibold ${titleColor[t]}`} style={tc(textColors.title, textColors.main)}>{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Reveal>
      </div>
    </section>
  );
}
