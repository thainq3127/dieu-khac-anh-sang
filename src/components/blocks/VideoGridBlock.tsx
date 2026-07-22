import Image from 'next/image';
import { Play } from 'lucide-react';
import { Reveal, RevealGroup } from '@/components/Reveal';
import type { VideoGridBlockProps } from './types';
import BlockBackground from './BlockBackground';
import { resolveBlockStyles, tc } from './blockStyles';
import { resolveAssetUrl } from '@/lib/assets';

const colsMap: Record<number, string> = {
  2: 'grid-cols-2 max-md:grid-cols-1',
  3: 'grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1',
};

export default function VideoGridBlock(props: VideoGridBlockProps) {
  const {
    id,
    eyebrow,
    title,
    subtitle,
    videos,
    columns = 2,
    bgImage,
    bgImageOpacity,
    theme = 'light',
  } = props;

  const { className: customBgClass, style: customStyle, isDark, textColors } = resolveBlockStyles(props, theme);
  const hasPxPadding = props.customPaddingTop != null || props.customPaddingBottom != null
    || props.customPaddingLeft != null || props.customPaddingRight != null;
  const paddingClass = (hasPxPadding || props.customPaddingSize) ? '' : 'py-[clamp(52px,7vw,88px)] max-md:py-[clamp(36px,5vw,56px)] max-sm:py-[clamp(28px,5vw,44px)]';

  // Theme styles
  const themeColors = {
    eyebrow: isDark ? 'text-gold-lt' : 'text-terra',
    title: isDark ? 'text-white' : 'text-ivory',
    subtitle: isDark ? 'text-gold-lt' : 'text-muted',
    cardTitle: isDark ? 'text-white' : 'text-ivory',
    cardDesc: isDark ? 'text-white/72' : 'text-muted',
    cardBg: isDark ? 'bg-white/6 border-white/12' : 'bg-surface border-border hover:shadow-[0_14px_48px_rgba(8,15,13,0.18)]',
    tag: isDark ? 'text-gold-lt bg-white/8' : 'text-terra bg-[rgba(184,80,48,0.13)]',
  };

  return (
    <section
      className={`${customBgClass} ${paddingClass} relative overflow-hidden isolate scroll-mt-[138px]`}
      style={customStyle}
      id={id}
    >
      <BlockBackground bgImage={bgImage} bgImageOpacity={bgImageOpacity} />
      <div className="absolute top-[34px] left-1/2 -translate-x-1/2 w-[min(calc(100%-48px),var(--shell))] h-px pointer-events-none z-0 opacity-32 bg-[linear-gradient(90deg,transparent,rgba(200,146,12,0.32),rgba(184,80,48,0.16),rgba(200,146,12,0.32),transparent)] max-sm:top-3.5 max-sm:w-[calc(100%-32px)] max-sm:opacity-24" aria-hidden="true" />
      <div className="absolute bottom-[34px] left-1/2 -translate-x-1/2 w-[min(calc(100%-48px),var(--shell))] h-px pointer-events-none z-0 opacity-32 bg-[linear-gradient(90deg,transparent,rgba(200,146,12,0.32),rgba(184,80,48,0.16),rgba(200,146,12,0.32),transparent)] max-sm:bottom-3.5 max-sm:w-[calc(100%-32px)] max-sm:opacity-24" aria-hidden="true" />

      <div className="relative z-2 w-full">
        <Reveal
          type="zoom"
          className="w-[min(calc(100%-48px),var(--shell))] mx-auto mb-8.5 max-md:w-[min(calc(100%-32px),var(--shell))] max-sm:w-[calc(100%-24px)]"
        >
          {eyebrow && (
            <span
              className={`inline-block text-[0.68rem] font-bold tracking-[0.18em] uppercase ${themeColors.eyebrow} mb-3 max-md:text-[0.62rem] max-sm:text-[0.58rem]`}
              style={tc(textColors.accent, textColors.main)}
            >
              {eyebrow}
            </span>
          )}
          <h2
            className={`font-serif font-bold text-[clamp(2.4rem,4.5vw,3rem)] ${themeColors.title} mb-2 leading-none max-md:text-[clamp(1.75rem,5.5vw,2.4rem)] max-md:leading-[1.08] max-sm:text-[clamp(1.5rem,6.5vw,2rem)] max-sm:leading-[1.1] max-sm:mb-1.5`}
            style={tc(textColors.title, textColors.main)}
            dangerouslySetInnerHTML={{
              __html: title.replace(/\\n/g, '<br />')
            }}
          >
          </h2>
          {subtitle && (
            <p
              className={`font-serif text-[clamp(1rem,1.8vw,1.25rem)] italic ${themeColors.subtitle} mt-1 max-sm:text-[0.88rem]`}
              style={tc(textColors.body, textColors.main)}
            >
              {subtitle}
            </p>
          )}
        </Reveal>

        <RevealGroup
          className={`grid ${colsMap[columns]} gap-4 w-[min(calc(100%-48px),var(--shell))] mx-auto`}
        >
          {videos.map((video, idx) => {
            const isLocal = typeof video.id === 'string' && (
              video.id.startsWith('uploads/') ||
              video.id.startsWith('/uploads/') ||
              video.id.includes('/storage/') ||
              /\.(mp4|webm|ogg|mov|m4v)$/i.test(video.id)
            );
            const embedUrl = isLocal ? resolveAssetUrl(video.id) : `https://www.youtube.com/embed/${video.id}`;

            return (
              <article
                key={`${video.id}-${idx}`}
                className={`border rounded-lg overflow-hidden transition-[transform,box-shadow] duration-280 hover:-translate-y-1.25 group ${themeColors.cardBg}`}
              >
                <div className="relative aspect-[16/9] bg-black overflow-hidden">
                  <button
                    className="block w-full h-full relative cursor-pointer group/trigger"
                    type="button"
                    data-video-embed={embedUrl}
                    aria-label={video.title ? `Phát video: ${video.title}` : 'Phát video: Văn hóa Chăm - Khánh Hòa'}
                  >
                    {video.thumbnail ? (
                      <Image
                        src={resolveAssetUrl(video.thumbnail)}
                        alt={`Xem video: ${video.title}`}
                        fill
                        className="object-cover transition-[transform,filter] duration-600 ease-out brightness-[0.80] group-hover/trigger:scale-104 group-hover/trigger:brightness-[0.65]"
                      />
                    ) : isLocal ? (
                      <video
                        src={resolveAssetUrl(video.id)}
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.80] transition-[transform,filter] duration-600 ease-out group-hover/trigger:scale-104 group-hover/trigger:brightness-[0.65]"
                        preload="metadata"
                        muted
                        playsInline
                      />
                    ) : video.id ? (
                      <Image
                        src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                        alt={`Xem video: ${video.title}`}
                        fill
                        className="object-cover transition-[transform,filter] duration-600 ease-out brightness-[0.80] group-hover/trigger:scale-104 group-hover/trigger:brightness-[0.65]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted text-xs text-muted-foreground">Chưa nhập Video hoặc YouTube ID</div>
                    )}
                    <span
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[58px] h-[58px] bg-[rgba(212,168,67,0.90)] rounded-full flex items-center justify-center transition-[background,transform] duration-220 group-hover/trigger:bg-gold group-hover/trigger:scale-110"
                      aria-hidden="true"
                    >
                      <Play className="w-[22px] h-[22px] fill-current translate-x-px text-black" />
                    </span>
                  </button>
                </div>
              <div className="p-[22px_24px]">
                {video.tag && (
                  <span className={`text-[0.62rem] font-bold tracking-[0.14em] uppercase py-1 px-2.5 rounded inline-block mb-2.5 ${themeColors.tag}`}>
                    {video.tag}
                  </span>
                )}
                <h3
                  className={`text-[1rem] font-bold leading-[1.42] mb-2 font-serif ${themeColors.cardTitle}`}
                  style={tc(textColors.title, textColors.main)}
                >
                  {video.title}
                </h3>
                <p
                  className={`text-[0.83rem] leading-[1.6] text-justify [text-justify:inter-word] [hyphens:auto] ${themeColors.cardDesc}`}
                  style={tc(textColors.body, textColors.main)}
                >
                  {video.desc}
                </p>
              </div>
            </article>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
