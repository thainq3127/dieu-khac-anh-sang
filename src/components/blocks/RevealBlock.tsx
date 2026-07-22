'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import type { RevealBlockProps } from './types';
import { resolveBlockStyles, tc } from './blockStyles';
import { resolveAssetUrl } from '@/lib/assets';

export default function RevealBlock(props: RevealBlockProps) {
  const { id, text, bgImage, bgImageOpacity = 1 } = props;
  const { className: customBgClass, style: customStyle, textColors } = resolveBlockStyles(props, 'dark');
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [spot, setSpot] = useState({ x: 50, y: 42 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      onPointerMove={handlePointerMove}
      className={`${customBgClass} relative overflow-hidden isolate min-h-[68svh] flex items-center justify-center scroll-mt-[138px] max-md:min-h-[52svh]`}
      style={customStyle}
    >
      {bgImage && (
        <div className="absolute inset-0 z-0" style={{ opacity: bgImageOpacity }} aria-hidden="true">
          <Image src={resolveAssetUrl(bgImage)} alt="" fill sizes="100vw" className="object-cover" priority={false} />
        </div>
      )}

      <div
        className="absolute inset-0 z-[1] transition-[background] duration-700 ease-out"
        style={{
          background: inView
            ? `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(10,10,10,0.28), rgba(6,6,6,0.86) 55%)`
            : 'rgba(6,6,6,0.94)',
        }}
        aria-hidden="true"
      />

      <Reveal type="zoom" className="relative z-10 max-w-[880px] px-6 text-center">
        <p
          className="font-serif italic text-white text-[clamp(1.35rem,3vw,2.35rem)] leading-[1.48]"
          style={tc(textColors.main, null)}
          dangerouslySetInnerHTML={{ __html: text.replace(/\\n/g, '<br />') }}
        />
      </Reveal>
    </section>
  );
}
