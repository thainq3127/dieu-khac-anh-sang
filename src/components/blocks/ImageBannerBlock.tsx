import { resolveAssetUrl } from '@/lib/assets';
import type { ImageBannerBlockProps } from './types';

const HEIGHT_MAP: Record<string, string> = {
  short: '300px',
  medium: '480px',
  tall: '640px',
  full: '100svh',
};

const LAYOUT_CLASS: Record<string, string> = {
  full: 'w-full',
  shell: 'max-w-[var(--shell)] mx-auto px-[clamp(16px,4vw,40px)]',
  narrow: 'max-w-3xl mx-auto px-[clamp(16px,4vw,40px)]',
};

export default function ImageBannerBlock(props: ImageBannerBlockProps) {
  const {
    id,
    src,
    alt = '',
    caption,
    layout = 'full',
    height = 'auto',
    objectPosition,
  } = props;

  if (!src) return null;

  const isCover = height !== 'auto';
  const resolvedHeight = HEIGHT_MAP[height] ?? height;
  const containerClass = LAYOUT_CLASS[layout] ?? LAYOUT_CLASS.full;
  const resolvedSrc = resolveAssetUrl(src);

  return (
    <section className="w-full relative overflow-hidden isolate" id={id}>
      <div className={containerClass}>
        <figure
          className="relative block overflow-hidden"
          style={isCover ? { height: resolvedHeight } : undefined}
        >
          <img
            src={resolvedSrc}
            alt={alt}
            className={isCover ? 'absolute inset-0 w-full h-full object-cover' : 'w-full h-auto block'}
            style={isCover && objectPosition ? { objectPosition } : undefined}
            loading="lazy"
          />
          {caption && (
            <figcaption className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xs text-white text-xs py-1.5 px-3 rounded text-right pointer-events-none select-none max-sm:bottom-2 max-sm:right-2 max-sm:text-[10px]">
              {caption}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}
