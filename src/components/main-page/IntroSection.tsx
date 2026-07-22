import { Reveal } from '@/components/Reveal';
import Image from 'next/image';
import { resolveBlockStyles, BaseBlockStyleProps } from '../blocks/blockStyles';

export interface IntroSectionProps extends BaseBlockStyleProps {
  eyebrow?: string;
  title?: string;
  srText1?: string;
  srText2?: string;
}

export default function IntroSection(props: IntroSectionProps) {
  const {
    eyebrow = 'Tinh hoa di sản',
    title = 'Mỗi lễ hội, mỗi điệu múa, mỗi tiếng trống Ginăng — là cách cộng đồng kể lại ký ức, niềm tin và bản sắc của mình.',
    srText1 = 'Văn hóa Chăm là một phần đặc sắc trong nền văn hóa Việt Nam thống nhất và đa dạng.',
    srText2 = '"Chào mừng Lễ Khai mạc Ngày hội Văn hóa dân tộc Chăm lần thứ VI năm 2026, tại tỉnh Khánh Hòa"'
  } = props;

  const { className: customBgClass, style: customStyle, isDark } = resolveBlockStyles(props, 'dark');
  const paddingClass = props.customPaddingSize ? '' : 'pt-[clamp(74px,10vw,112px)] pb-[clamp(90px,12vw,132px)] max-md:py-[clamp(36px,6vw,56px)] max-sm:py-[clamp(28px,5vw,44px)]';

  return (
    <div
      className={`relative overflow-hidden isolate flex flex-col justify-center ${customBgClass} bg-no-repeat bg-center ${paddingClass} px-6 text-center max-md:px-5 max-sm:px-4`}
      style={customStyle}
    >
      {/* ::before background glow */}
      <div className="absolute top-[-40%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(212,168,67,0.07)_0%,transparent_70%)] pointer-events-none z-0" aria-hidden="true" />

      {/* ::after decorative border lines */}
      <div className="absolute top-6 bottom-6 left-1/2 w-[min(calc(100%-48px),var(--shell))] -translate-x-1/2 pointer-events-none z-1 opacity-46 bg-[linear-gradient(90deg,transparent,rgba(232,184,50,0.34),rgba(184,80,48,0.20),rgba(232,184,50,0.34),transparent)_center_top/100%_1px_no-repeat,radial-gradient(circle,rgba(232,184,50,0.70)_0_2px,transparent_2.5px)_center_top_-2px/14px_14px_no-repeat,linear-gradient(90deg,transparent,rgba(232,184,50,0.34),rgba(184,80,48,0.20),rgba(232,184,50,0.34),transparent)_center_bottom/100%_1px_no-repeat,radial-gradient(circle,rgba(232,184,50,0.70)_0_2px,transparent_2.5px)_center_bottom_-2px/14px_14px_no-repeat] max-sm:top-3.5 max-sm:bottom-3.5 max-sm:left-4 max-sm:w-[calc(100%-32px)] max-sm:translate-x-0 max-sm:opacity-22" aria-hidden="true" />

      <div className="relative z-2 w-full">
        <div className="absolute pointer-events-none z-10 right-[clamp(-120px,-5vw,-72px)] bottom-[clamp(-34px,-2vw,-16px)] max-sm:hidden" aria-hidden="true">
          <Image src="/images/gallery-square.png" alt="" width={2500} height={1748} className="block h-auto object-contain animate-[sectionDrift_9s_ease-in-out_infinite_alternate] [-webkit-mask-image:radial-gradient(ellipse_at_64%_58%,#000_0_46%,rgba(0,0,0,0.72)_58%,transparent_78%)] mask-[radial-gradient(ellipse_at_64%_58%,#000_0_46%,rgba(0,0,0,0.72)_58%,transparent_78%)] filter-[saturate(0.72)_brightness(0.76)_contrast(0.92)_drop-shadow(0_18px_44px_rgba(8,15,13,0.38))] w-[clamp(360px,32vw,620px)] aspect-2500/1748 opacity-22 [animation-delay:-0.8s] max-md:w-[min(82vw,560px)]" />
        </div>
        <Reveal type="zoom">
          {srText1 && <p className="sr-only">{srText1}</p>}
          {srText2 && <p className="sr-only">{srText2}</p>}
          <p className={`text-[0.68rem] font-bold tracking-[0.2em] uppercase mb-7 flex items-center justify-center gap-4 max-sm:text-[0.58rem] max-sm:mb-2.5 ${isDark ? 'text-gold-lt' : 'text-terra'}`}>
            <span className={`block w-12 h-px opacity-45 ${isDark ? 'bg-gold-lt' : 'bg-terra'}`} aria-hidden="true" />
            {eyebrow}
            <span className={`block w-12 h-px opacity-45 ${isDark ? 'bg-gold-lt' : 'bg-terra'}`} aria-hidden="true" />
          </p>
          <p className={`font-serif text-[clamp(1.6rem,3.5vw,1.8rem)] italic leading-[1.42] max-w-[840px] mx-auto max-md:text-[clamp(1.15rem,3.2vw,1.55rem)] max-sm:text-[clamp(1.05rem,4.5vw,1.35rem)] ${isDark ? 'text-white/92' : 'text-[#1a2320]/90'}`}>{title}</p>
        </Reveal>
      </div>
    </div>
  );
}
