import { CSSProperties } from 'react';

export interface BaseBlockStyleProps {
  customBgType?: 'solid' | 'gradient';
  customBgColor?: string;
  customBgGradientStart?: string;
  customBgGradientEnd?: string;
  customBgGradientAngle?: number;
  customTextColor?: string;
  customTitleColor?: string;
  customBodyColor?: string;
  customAccentColor?: string;
  customTextAlign?: 'left' | 'center' | 'right' | 'justify';
  customPaddingSize?: 'none' | 'small' | 'medium' | 'large';
  customMarginSize?: 'none' | 'small' | 'medium' | 'large';
  customPaddingTop?: number;
  customPaddingBottom?: number;
  customPaddingLeft?: number;
  customPaddingRight?: number;
  customMarginTop?: number;
  customMarginBottom?: number;
  customThemeMode?: 'light' | 'dark';
  customFontFamily?: 'sans' | 'serif' | 'mono';
  customFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  customFontSize?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'xxxlarge';
}

export interface BlockTextColors {
  title: string | null;
  body: string | null;
  accent: string | null;
  main: string | null;
}

export function resolveBlockStyles(props: BaseBlockStyleProps, defaultTheme: 'light' | 'dark' = 'light') {
  let className = '';
  const style: CSSProperties = {};

  // By default, if no custom color is used, we use the defaultTheme
  let isDark = defaultTheme === 'dark';

  // Whether a custom background has been explicitly set
  const hasCustomBg = props.customBgType === 'solid' || props.customBgType === 'gradient';

  // 1. Resolve Background
  if (hasCustomBg) {
    // If the user has customized the background, we use their theme mode configuration (light/dark)
    isDark = props.customThemeMode === 'dark';

    if (props.customBgType === 'gradient') {
      const start = props.customBgGradientStart || '#f5f0e6';
      const end = props.customBgGradientEnd || '#efe4d2';
      const angle = props.customBgGradientAngle ?? 135;
      style.background = `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;
    } else if (props.customBgColor) {
      style.backgroundColor = props.customBgColor;
    }
  } else {
    // Default backgrounds (when no customization is done)
    if (defaultTheme === 'light') {
      className += ' bg-surface bg-[linear-gradient(180deg,rgba(11,42,36,0.03),transparent_30%,transparent_70%,rgba(184,80,48,0.05))] text-[#1a2320]/84';
    } else {
      className += ' bg-forest bg-[linear-gradient(180deg,rgba(232,184,50,0.08),transparent_26%,transparent_74%,rgba(255,255,255,0.04))] text-white';
    }
  }

  // 2. Resolve base text color class (only when custom bg is set, to provide contrast)
  if (hasCustomBg) {
    className += isDark ? ' text-white' : ' text-[#1a2320]/84';
  }

  // 3. Resolve Font Family
  if (props.customFontFamily) {
    if (props.customFontFamily === 'sans') className += ' block-custom-sans font-sans';
    else if (props.customFontFamily === 'serif') className += ' block-custom-serif font-serif';
    else if (props.customFontFamily === 'mono') className += ' block-custom-mono font-mono';
  }

  // 4. Resolve Font Weight
  if (props.customFontWeight) {
    if (props.customFontWeight === 'normal') className += ' font-normal';
    else if (props.customFontWeight === 'medium') className += ' font-medium';
    else if (props.customFontWeight === 'semibold') className += ' font-semibold';
    else if (props.customFontWeight === 'bold') className += ' font-bold';
  }

  // 5. Resolve Font Size
  if (props.customFontSize) {
    className += ` block-custom-size block-font-size-${props.customFontSize}`;
    if (props.customFontSize === 'small') className += ' text-sm';
    else if (props.customFontSize === 'medium') className += ' text-base';
    else if (props.customFontSize === 'large') className += ' text-lg';
    else if (props.customFontSize === 'xlarge') className += ' text-xl';
    else if (props.customFontSize === 'xxlarge') className += ' text-2xl';
    else if (props.customFontSize === 'xxxlarge') className += ' text-3xl';
  }

  // 6. Resolve Text Alignment
  if (props.customTextAlign) {
    if (props.customTextAlign === 'left') className += ' text-left';
    else if (props.customTextAlign === 'center') className += ' text-center';
    else if (props.customTextAlign === 'right') className += ' text-right';
    else if (props.customTextAlign === 'justify') className += ' text-justify';
  }

  // 7. Resolve Padding — pixel values take priority, fall back to size presets
  const hasPx = props.customPaddingTop != null || props.customPaddingBottom != null
    || props.customPaddingLeft != null || props.customPaddingRight != null;
  if (hasPx) {
    if (props.customPaddingTop != null) style.paddingTop = props.customPaddingTop;
    if (props.customPaddingBottom != null) style.paddingBottom = props.customPaddingBottom;
    if (props.customPaddingLeft != null) style.paddingLeft = props.customPaddingLeft;
    if (props.customPaddingRight != null) style.paddingRight = props.customPaddingRight;
  } else {
    const pad = props.customPaddingSize;
    if (pad) {
      if (pad === 'none') className += ' py-0';
      else if (pad === 'small') className += ' py-[clamp(24px,3vw,36px)]';
      else if (pad === 'medium') className += ' py-[clamp(52px,6vw,43px)]';
      else if (pad === 'large') className += ' py-[clamp(80px,10vw,120px)]';
    }
  }

  // 8. Resolve Margin — pixel values take priority, fall back to size presets
  const hasMarginPx = props.customMarginTop != null || props.customMarginBottom != null;
  if (hasMarginPx) {
    if (props.customMarginTop != null) style.marginTop = props.customMarginTop;
    if (props.customMarginBottom != null) style.marginBottom = props.customMarginBottom;
  } else {
    const marg = props.customMarginSize;
    if (marg) {
      if (marg === 'none') className += ' my-0';
      else if (marg === 'small') className += ' my-4';
      else if (marg === 'medium') className += ' my-8';
      else if (marg === 'large') className += ' my-16';
    }
  }

  // 9. Build per-element text colors object
  const textColors: BlockTextColors = {
    title: props.customTitleColor || null,
    body: props.customBodyColor || null,
    accent: props.customAccentColor || null,
    main: props.customTextColor || null,
  };

  return { className, style, isDark, hasCustomBg, textColors };
}

export function resolveBlockPaddingClass(customPaddingSize?: string): string {
  if (!customPaddingSize) return '';
  if (customPaddingSize === 'none') return 'py-0';
  if (customPaddingSize === 'small') return 'py-[clamp(24px,3vw,36px)]';
  if (customPaddingSize === 'medium') return 'py-[clamp(52px,6vw,43px)]';
  if (customPaddingSize === 'large') return 'py-[clamp(80px,10vw,120px)]';
  return '';
}

/**
 * Helper to pick the most specific inline color style for an element.
 * Returns undefined (not an empty object) when no color is set, so spread
 * won't add an empty style attribute.
 */
export function tc(specific: string | null | undefined, fallback: string | null | undefined): React.CSSProperties | undefined {
  const color = specific || fallback;
  return color ? { color } : undefined;
}

// ─── Per-element text style (shared by Hero, Split, …) ───────────────────────

export interface TextElementStyle {
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  fontStyle?: 'normal' | 'italic';
  fontFamily?: 'sans' | 'serif' | 'mono';
}

export type BlockElemStyle = CSSProperties & {
  '--hff'?: string;
  '--hfw'?: string;
  '--hfst'?: string;
  '--hfs'?: string;
  '--hcolor'?: string;
};

/**
 * Build inline style + class string for a single text element.
 * Uses CSS custom-property classes (hero-el-*) declared after the Tailwind
 * import in globals.css so their !important overrides Tailwind v4 utilities.
 */
export function buildElemStyle(
  es: TextElementStyle | undefined,
  sizeMap: Record<string, string>,
  colorStyle?: CSSProperties,
): { style: BlockElemStyle; sizeClass: string } {
  const style: BlockElemStyle = {};
  const cls: string[] = [];

  if (colorStyle?.color) {
    style['--hcolor'] = colorStyle.color as string;
    cls.push('hero-el-color');
  }

  if (!es) return { style, sizeClass: cls.join(' ') };

  if (es.fontFamily === 'sans')       { style['--hff'] = 'var(--font-sans)';  cls.push('hero-el-ff'); }
  else if (es.fontFamily === 'serif') { style['--hff'] = 'var(--font-serif)'; cls.push('hero-el-ff'); }
  else if (es.fontFamily === 'mono')  { style['--hff'] = 'monospace';         cls.push('hero-el-ff'); }

  if (es.fontWeight === 'normal')        { style['--hfw'] = '400'; cls.push('hero-el-fw'); }
  else if (es.fontWeight === 'medium')   { style['--hfw'] = '500'; cls.push('hero-el-fw'); }
  else if (es.fontWeight === 'semibold') { style['--hfw'] = '600'; cls.push('hero-el-fw'); }
  else if (es.fontWeight === 'bold')     { style['--hfw'] = '700'; cls.push('hero-el-fw'); }

  if (es.fontStyle) { style['--hfst'] = es.fontStyle; cls.push('hero-el-fst'); }

  if (es.fontSize && sizeMap[es.fontSize]) {
    style['--hfs'] = sizeMap[es.fontSize];
    cls.push('hero-custom-fs');
  }

  return { style, sizeClass: cls.join(' ') };
}
