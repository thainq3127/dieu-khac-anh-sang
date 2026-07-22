import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import type { CatalogBlockProps } from './types';
import BlockBackground from './BlockBackground';
import { resolveBlockStyles, tc } from './blockStyles';
import { resolveAssetUrl } from '@/lib/assets';

const eyebrowColor: Record<string, string> = { light: 'text-terra', dark: 'text-gold-lt' };
const titleColor: Record<string, string> = { light: 'text-ivory', dark: 'text-white' };
const subtitleColor: Record<string, string> = { light: 'text-muted', dark: 'text-gold-lt' };
const bodyColor: Record<string, string> = { light: 'text-muted', dark: 'text-white/72' };

function ImageGrid({ images, caption }: { images: string[]; caption?: string }) {
  const imgs = images.slice(0, 4);
  if (imgs.length === 0) {
    return (
      <div className="aspect-square rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
        Chưa tải ảnh
      </div>
    );
  }
  const colsClass =
    imgs.length === 1 ? 'grid-cols-1' : imgs.length === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return (
    <div>
      <div className={`grid ${colsClass} gap-2`}>
        {imgs.map((src, i) => (
          <div key={i} className={`relative overflow-hidden rounded-lg bg-black/5 ${imgs.length === 3 && i === 0 ? 'col-span-3 aspect-[3/2]' : 'aspect-square'}`}>
            <Image src={resolveAssetUrl(src)} alt={caption ?? ''} fill className="object-cover" />
          </div>
        ))}
      </div>
      {caption && <p className="text-[0.75rem] text-muted-foreground mt-2 text-center">{caption}</p>}
    </div>
  );
}

export default function CatalogBlock(props: CatalogBlockProps) {
  const {
    id,
    number,
    title,
    subtitle,
    body,
    images = [],
    imageCaption,
    price,
    columns = [],
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

      <div className="relative z-2 w-[min(calc(100%-48px),var(--shell))] mx-auto grid grid-cols-2 gap-[clamp(32px,5vw,64px)] items-start max-md:grid-cols-1 max-md:w-[min(calc(100%-32px),var(--shell))]">
        <Reveal type="left">
          <ImageGrid images={images} caption={imageCaption} />
        </Reveal>

        <Reveal type="right">
          {number && (
            <span className={`font-serif italic text-[clamp(2rem,3vw,2.8rem)] font-bold opacity-20 block mb-2 leading-none ${eyebrowColor[t]}`}>
              {number}
            </span>
          )}
          <h3
            className={`font-serif font-bold text-[clamp(1.8rem,3.2vw,2.4rem)] mb-2 leading-tight ${titleColor[t]}`}
            style={tc(textColors.title, textColors.main)}
          >
            {title}
          </h3>
          {subtitle && (
            <p className={`italic text-[1.05rem] mb-4 ${subtitleColor[t]}`} style={tc(textColors.body, textColors.main)}>
              {subtitle}
            </p>
          )}
          {body && (
            <div
              className={`text-[0.95rem] leading-[1.8] mb-6 text-justify [text-justify:inter-word] [hyphens:auto] ${bodyColor[t]}`}
              style={tc(textColors.body, textColors.main)}
              dangerouslySetInnerHTML={{ __html: body.replace(/\\n/g, '<br />') }}
            />
          )}
          {price && (
            <p className={`font-serif text-[1.4rem] font-bold mb-6 ${eyebrowColor[t]}`}>{price}</p>
          )}

          {columns.length > 0 && (
            <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
              {columns.map((col, i) => (
                <div key={i}>
                  <h4 className={`text-[0.78rem] font-bold uppercase tracking-wider mb-2 ${eyebrowColor[t]}`}>
                    {col.heading}
                  </h4>
                  <ul className="space-y-1">
                    {col.items.map((item, j) => (
                      <li key={j} className={`text-[0.85rem] ${bodyColor[t]}`} style={tc(textColors.body, textColors.main)}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
