import type { FeaturesStripBlockProps } from './types';
import { resolveBlockStyles, tc } from './blockStyles';

export default function FeaturesStripBlock(props: FeaturesStripBlockProps) {
  const { items, theme = 'light' } = props;
  const { className: customBgClass, style: customStyle, isDark, textColors } = resolveBlockStyles(props, theme);

  const cols =
    items.length === 3
      ? 'grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1'
      : 'grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1';

  return (
    <div
      className={`${customBgClass} border-y border-border`}
      style={customStyle}
      aria-label="Văn hóa Chăm - Khánh Hòa"
    >
      <div className={`w-[min(calc(100%-48px),var(--shell))] mx-auto grid ${cols}`}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const borderClass = isLast ? '' : 'border-r border-border max-lg:border-b max-sm:border-r-0 max-sm:border-b';
          const hoverClass = isDark ? 'hover:bg-white/5' : 'hover:bg-[rgba(26,35,32,0.045)]';

          return (
            <div
              key={idx}
              className={`flex items-center gap-4 py-[26px] px-[clamp(16px,3vw,36px)] ${borderClass} transition-colors duration-220 ${hoverClass} max-sm:py-[18px] max-sm:px-4`}
            >
              <div
                className="w-[42px] h-[42px] flex items-center justify-center bg-[rgba(184,80,48,0.12)] rounded-full shrink-0"
                aria-hidden="true"
              >
                {item.icon}
              </div>
              <div>
                <strong
                  className={`block text-[0.78rem] font-bold tracking-[0.06em] uppercase mb-0.5 ${isDark ? 'text-white' : 'text-ink'}`}
                  style={tc(textColors.title, textColors.main)}
                >
                  {item.title}
                </strong>
                <span
                  className={`text-[0.72rem] ${isDark ? 'text-white/70' : 'text-muted'}`}
                  style={tc(textColors.body, textColors.main)}
                >
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
