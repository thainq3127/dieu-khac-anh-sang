'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import type { GalleryBlockProps } from './types';
import BlockBackground from './BlockBackground';
import { resolveBlockStyles, tc } from './blockStyles';
import { resolveAssetUrl } from '@/lib/assets';

const eyebrowColor: Record<string, string> = { light: 'text-terra', dark: 'text-gold-lt' };

export default function GalleryBlock(props: GalleryBlockProps) {
  const { id, kicker, images, theme = 'light', bgImage, bgImageOpacity } = props;
  const { className: customBgClass, style: customStyle, isDark, textColors } = resolveBlockStyles(props, theme);
  const t = isDark ? 'dark' : 'light';
  const [active, setActive] = useState(0);
  const current = images?.[active];

  if (!images || images.length === 0) return null;

  return (
    <section
      className={`${customBgClass} py-[clamp(52px,7vw,88px)] max-md:py-[clamp(36px,5vw,56px)] relative overflow-hidden isolate scroll-mt-[138px]`}
      style={customStyle}
      id={id}
    >
      <BlockBackground bgImage={bgImage} bgImageOpacity={bgImageOpacity} />

      <div className="relative z-2 w-[min(calc(100%-48px),var(--shell))] mx-auto max-md:w-[min(calc(100%-32px),var(--shell))] max-sm:w-[calc(100%-24px)]">
        {kicker && (
          <Reveal type="zoom" className="mb-6 text-center">
            <span
              className={`inline-block text-[0.68rem] font-bold tracking-[0.2em] uppercase ${eyebrowColor[t]}`}
              style={tc(textColors.accent, textColors.main)}
            >
              {kicker}
            </span>
          </Reveal>
        )}

        <Reveal type="zoom" className="relative aspect-[16/10] rounded-lg overflow-hidden mb-4 bg-black/5 max-sm:aspect-[4/3]">
          {current?.src ? (
            <Image
              key={current.src}
              src={resolveAssetUrl(current.src)}
              alt={current.alt}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-xs text-muted-foreground">
              Chưa tải ảnh
            </div>
          )}
          {current?.caption && (
            <span className="absolute left-0 right-0 bottom-0 p-4 bg-[linear-gradient(0deg,rgba(0,0,0,0.62),transparent)] text-white text-sm font-medium">
              {current.caption}
            </span>
          )}
        </Reveal>

        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={kicker || 'Thư viện ảnh'}>
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`relative shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-colors duration-200 cursor-pointer ${
                i === active ? 'border-terra' : 'border-transparent opacity-64 hover:opacity-100'
              }`}
            >
              {img.src ? (
                <Image src={resolveAssetUrl(img.src)} alt={img.alt} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
