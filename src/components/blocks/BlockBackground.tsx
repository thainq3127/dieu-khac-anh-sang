import Image from 'next/image';
import { resolveAssetUrl } from '@/lib/assets';

interface BlockBackgroundProps {
  bgImage?: string;
  bgImageOpacity?: number;
}

export default function BlockBackground({ bgImage, bgImageOpacity = 0.2 }: BlockBackgroundProps) {
  if (!bgImage) return null;
  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none"
      style={{ opacity: bgImageOpacity }}
      aria-hidden="true"
    >
      <Image
        src={resolveAssetUrl(bgImage)}
        alt=""
        fill
        sizes="100vw"
        className="object-cover pointer-events-none select-none"
        priority={false}
      />
    </div>
  );
}
