import type { MarqueeBlockProps } from './types';
import { resolveBlockStyles, resolveBlockPaddingClass, tc } from './blockStyles';

const themeMap = {
  gold: 'bg-terra',
  dark: 'bg-forest border-y border-white/8',
  footer: 'bg-terra',
};

const textMap = {
  gold: 'text-white',
  dark: 'text-white/68',
  footer: 'text-white',
};

export default function MarqueeBlock(props: MarqueeBlockProps) {
  const { items, theme } = props;
  const activeItems = (items ?? []).filter((item) => typeof item === 'string' && item.trim() !== '');
  if (activeItems.length === 0) return null;

  const { className: customBgClass, style: customStyle, hasCustomBg, textColors } = resolveBlockStyles(props, theme === 'dark' ? 'dark' : 'light');

  // When no custom bg is set, use the theme-specific class. When custom bg is set, use customBgClass.
  const sectionBgClass = hasCustomBg ? customBgClass : themeMap[theme];
  const hasPxPadding = props.customPaddingTop != null || props.customPaddingBottom != null
    || props.customPaddingLeft != null || props.customPaddingRight != null;
  const paddingClass = hasPxPadding ? '' : (resolveBlockPaddingClass(props.customPaddingSize) || 'py-3.5');

  return (
    <div
      className={`overflow-hidden ${sectionBgClass} ${paddingClass}`}
      style={customStyle}
      aria-hidden="true"
    >
      <div className="flex w-max animate-[marqueeLeft_30s_linear_infinite] motion-reduce:animation-none">
        {[...activeItems, ...activeItems].map((item, idx) => (
          <span
            key={idx}
            className={`whitespace-nowrap text-[0.76rem] font-bold tracking-[0.15em] uppercase ${textMap[theme]} px-[30px] flex items-center gap-3.5 after:content-[''] after:inline-block after:w-[5px] after:h-[5px] after:bg-current after:rotate-45 after:opacity-55 after:shrink-0`}
            style={tc(textColors.accent, textColors.main)}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
