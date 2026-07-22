import type { IframeBlockProps } from './types';
import BlockBackground from './BlockBackground';
import { resolveBlockStyles } from './blockStyles';
import { resolveAssetUrl } from '@/lib/assets';

// Helper to check and format YouTube URLs for autoplay & hiding info
function formatYoutubeUrl(url: string): string {
  if (!url) return '';
  const cleanedUrl = url.trim();

  // Match standard watch URL, share URL (youtu.be), or embed URL
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = cleanedUrl.match(ytRegex);

  if (match && match[1]) {
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&playlist=${videoId}&loop=1`;
  }

  return cleanedUrl;
}

// Helper to format width/height inputs with units if missing
function formatLength(value: string | number | undefined, defaultValue: string): string {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'number') return `${value}px`;

  const trimmed = String(value).trim();
  if (/^\d+$/.test(trimmed)) {
    return `${trimmed}px`;
  }
  return trimmed;
}

// Deterministic short hash from a string (djb2)
function hashStr(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h |= 0;
  }
  return 'ib' + Math.abs(h).toString(36);
}

export default function IframeBlock(props: IframeBlockProps) {
  const {
    id,
    src,
    layout = 'contained',
    height,
    mobileHeight,
    width,
    theme = 'light',
    bgImage,
    bgImageOpacity,
  } = props;

  if (!src) return null;

  const isLocalVideo = typeof src === 'string' && (
    src.startsWith('uploads/') ||
    src.startsWith('/uploads/') ||
    src.includes('/storage/') ||
    /\.(mp4|webm|ogg|mov|m4v)$/i.test(src)
  );

  const formattedSrc = isLocalVideo ? src : formatYoutubeUrl(src);
  const isYoutube = !isLocalVideo && /(?:youtube\.com|youtu\.be)/i.test(src);
  const { className: customBgClass, style: customStyle } = resolveBlockStyles(props, theme);
  const isFull = layout === 'full-width';

  const containerClass = isFull
    ? 'w-full relative overflow-hidden mx-auto'
    : 'w-[min(calc(100%-48px),var(--shell))] max-w-(--shell) mx-auto rounded-lg overflow-hidden border border-border shadow-md relative z-10';

  const sectionPadding = isFull ? 'py-0' : 'py-[clamp(32px,4vw,52px)]';
  const hasPxPadding = props.customPaddingTop != null || props.customPaddingBottom != null
    || props.customPaddingLeft != null || props.customPaddingRight != null;
  const paddingClass = (hasPxPadding || props.customPaddingSize) ? '' : sectionPadding;

  const resolvedWidth = formatLength(width, '100%');
  const resolvedHeight = height ? formatLength(height, '550px') : undefined;
  const resolvedMobileHeight = mobileHeight ? formatLength(mobileHeight, 'auto') : undefined;

  // Build inline styles for sizing
  const containerStyle: React.CSSProperties = {};
  if (width) {
    containerStyle.width = resolvedWidth;
    containerStyle.maxWidth = '100%';
  }

  // Responsive height via style tag — needed when desktop height is fixed (otherwise
  // mobile inherits the same tall height instead of staying 16:9) or when a specific
  // mobile height is requested.
  const needsResponsiveStyle = resolvedHeight || resolvedMobileHeight;
  const mediaClass = needsResponsiveStyle ? (id ? `ibk-${id}` : hashStr(src)) : null;
  const responsiveStyle = mediaClass
    ? `
      .${mediaClass}-media{height:${resolvedHeight ?? 'auto'};aspect-ratio:${resolvedHeight ? 'unset' : '16/9'};}
      @media(max-width:767px){.${mediaClass}-media{height:${resolvedMobileHeight ?? 'auto'};aspect-ratio:${resolvedMobileHeight ? 'unset' : '16/9'};}}
    `
    : null;

  return (
    <section
      className={`${customBgClass} ${paddingClass} relative overflow-hidden isolate scroll-mt-[138px]`}
      style={customStyle}
      id={id}
    >
      {responsiveStyle && <style dangerouslySetInnerHTML={{ __html: responsiveStyle }} />}
      <BlockBackground bgImage={bgImage} bgImageOpacity={bgImageOpacity} />

      <div className={containerClass} style={containerStyle}>
        {isLocalVideo ? (
          <video
            src={resolveAssetUrl(formattedSrc)}
            style={mediaClass ? { width: '100%' } : {
              width: '100%',
              aspectRatio: '16/9',
            }}
            controls
            className={`block w-full object-cover${mediaClass ? ` ${mediaClass}-media` : ''}`}
          />
        ) : (
          <iframe
            src={formattedSrc}
            style={mediaClass ? { border: 0, width: '100%' } : {
              border: 0,
              width: '100%',
              aspectRatio: '16/9',
            }}
            allow="autoplay; fullscreen"
            allowFullScreen
            loading="lazy"
            title="Tour link or map iframe"
            className={`block w-full${mediaClass ? ` ${mediaClass}-media` : ''}`}
          />
        )}
        {!isLocalVideo && isYoutube && (
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] z-20 cursor-default select-none pointer-events-auto"
          />
        )}
      </div>
    </section>
  );
}

