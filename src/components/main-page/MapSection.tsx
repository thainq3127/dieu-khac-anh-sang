'use client';

import dynamic from 'next/dynamic';
import { Reveal } from '@/components/Reveal';
import { resolveBlockStyles, BaseBlockStyleProps } from '../blocks/blockStyles';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[620px] bg-forest/20 rounded border border-white/5 animate-pulse flex items-center justify-center text-white/40 font-serif italic">
      Đang tải bản đồ di sản...
    </div>
  ),
});

interface MapSectionProps extends BaseBlockStyleProps {
  onlyLocationId?: number;
  locationIds?: Array<string | number>;
  title?: string;
  subtitle?: string;
  description?: string;
}

export default function MapSection(props: MapSectionProps) {
  const {
    onlyLocationId,
    locationIds,
    title = 'Hành trình Văn hóa Chăm',
    subtitle = 'BẢN ĐỒ DI SẢN',
    description = 'Khám phá vị trí địa lý các đền tháp, đền thờ, trung tâm nghiên cứu và bảo tàng lưu giữ hiện vật cổ xưa tiêu biểu của nền văn minh Champa tại Khánh Hòa và Ninh Thuận.',
  } = props;

  const { className: customBgClass, style: customStyle, isDark } = resolveBlockStyles(props, 'dark');
  const paddingClass = props.customPaddingSize ? '' : 'py-[clamp(64px,8vw,112px)]';

  const textColors = {
    subtitle: isDark ? 'text-gold-lt' : 'text-terra',
    title: isDark ? 'text-white' : 'text-ivory',
    desc: isDark ? 'text-white/76' : 'text-muted',
  };

  return (
    <section
      className={`${customBgClass} ${paddingClass} relative overflow-hidden isolate`}
      style={customStyle}
      id="ban-do"
    >
      {/* Decorative border matching other sections */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(calc(100%-48px),var(--shell))] h-px pointer-events-none z-0 opacity-24 bg-[linear-gradient(90deg,transparent,rgba(232,184,50,0.32),rgba(184,80,48,0.16),rgba(232,184,50,0.32),transparent)] max-sm:w-[calc(100%-32px)]" aria-hidden="true" />

      <div className="w-[min(calc(100%-48px),var(--shell))] max-w-(--shell) mx-auto relative z-10 flex flex-col gap-10 max-md:w-[min(calc(100%-32px),var(--shell))] max-sm:w-[calc(100%-24px)]">
        <Reveal type="zoom" className="text-center max-w-2xl mx-auto">
          <span className={`inline-block text-[0.68rem] font-bold tracking-[0.18em] uppercase mb-3.5 max-sm:text-[0.58rem] max-sm:tracking-[0.14em] ${textColors.subtitle}`}>
            {subtitle}
          </span>
          <h2
            dangerouslySetInnerHTML={{
              __html: title.replace(/\\n/g, '<br />')
            }}
            className={`font-serif font-bold text-[clamp(2.4rem,4.5vw,3rem)] mb-4 leading-none max-md:text-[clamp(1.75rem,5.5vw,2.4rem)] max-sm:text-[clamp(1.5rem,6.5vw,2rem)] ${textColors.title}`}>
          </h2>
          <p className={`text-[clamp(0.92rem,1.1vw,1.05rem)] leading-[1.62] ${textColors.desc}`}>
            {description}
          </p>
        </Reveal>

        <Reveal type="up" delay={0.15}>
          <LeafletMap onlyLocationId={onlyLocationId} locationIds={locationIds} />
        </Reveal>
      </div>
    </section>
  );
}
