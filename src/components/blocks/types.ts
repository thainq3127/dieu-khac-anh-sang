import type { ReactNode } from 'react';
import type { BaseBlockStyleProps, TextElementStyle } from './blockStyles';

export type { BaseBlockStyleProps, TextElementStyle };

// ─── Shared primitives ───────────────────────────────────────────────────────

export interface BlockImage {
  src: string;
  alt: string;
  caption?: string;
  fancyboxGroup?: string;
}

export interface BlockButton {
  label: string;
  href: string;
  variant: 'primary' | 'outline';
  /** open in lightbox as 3D/matterport */
  is3d?: boolean;
  /** internal Next.js link (uses locale prefix) */
  isInternal?: boolean;
  locale?: string;
}

// ─── Block 1: Hero ───────────────────────────────────────────────────────────

export interface HeroBlockProps extends BaseBlockStyleProps {
  images: string[];
  /** small text above the title, e.g. "Khánh Hòa · Việt Nam · 2026" */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  buttons?: BlockButton[];
  scrollLabel?: string;
  /** unique id for the pagination dots element */
  paginationId?: string;
  /** align content: main page = start, ponagar = end */
  contentAlign?: 'start' | 'end';
  audioUrl?: string | null;
  titleStyle?: TextElementStyle;
  eyebrowStyle?: TextElementStyle;
  subtitleStyle?: TextElementStyle;
  buttonsStyle?: TextElementStyle;
}

// ─── Block 2: FeaturesStrip ──────────────────────────────────────────────────

export interface FeaturesStripItem {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

export interface FeaturesStripBlockProps extends BaseBlockStyleProps {
  items: FeaturesStripItem[];
  theme?: 'light' | 'dark';
}

// ─── Block 3: Marquee ────────────────────────────────────────────────────────

export type MarqueeTheme = 'gold' | 'dark' | 'footer';

export interface MarqueeBlockProps extends BaseBlockStyleProps {
  items: string[];
  theme: MarqueeTheme;
}

// ─── Block 4: QuoteBreak ─────────────────────────────────────────────────────

export type QuoteTheme = 'terra' | 'forest';

export interface QuoteBreakBlockProps extends BaseBlockStyleProps {
  quote: string;
  eyebrow?: string;
  theme: QuoteTheme;
  bgImage?: string;
  bgImageOpacity?: number;
}

// ─── Block 5: Split ──────────────────────────────────────────────────────────

export type SplitTheme = 'light' | 'dark';
export type SplitImagePosition = 'left' | 'right' | 'none' | 'top' | 'bottom';

/**
 * single          – one tall image fills the column (parallax optional)
 * grid-3-cols     – three images in a row (used as a gallery BELOW the split)
 * grid-2x3        – 2×3 image grid replacing the image column
 * mosaic-1+2      – 1 wide image top + 2 images below
 * mosaic-4        – 1 tall image (row-span-3) + 3 stacked images
 * info-cards      – 3 glass/dark cards (no image)
 */
export type SplitMediaType =
  | 'single'
  | 'grid-3-cols'
  | 'grid-2x3'
  | 'mosaic-1+2'
  | 'mosaic-4'
  | 'info-cards';

export interface SplitInfoCard {
  /** large decorative prefix: "01", "Mẹ", "Đất"… */
  prefix?: string;
  title: string;
  body: string;
}

export interface SplitMiniCard {
  label: string;
  text: string;
}

export interface SplitStatCard {
  value: string;
  text: string;
}

export interface SplitBlockProps extends BaseBlockStyleProps {
  id?: string;
  theme?: SplitTheme;
  bgImage?: string;
  bgImageOpacity?: number;

  // ── Text column ──
  eyebrow?: string;
  chapterNumber?: string;
  title: string;
  subtitle?: string;
  /** each string renders as a <p> */
  body: string[];
  /** 2-column body text layout (Chapter 2 style) */
  bodyColumns?: boolean;
  blockquote?: string;
  tags?: string[];
  /** small light-bg mini cards inside the text column */
  miniCards?: SplitMiniCard[];
  miniCardsLayout?: 'grid' | 'vertical';
  ctaButtons?: BlockButton[];

  // ── Media column ──
  imagePosition?: SplitImagePosition;
  mediaType?: SplitMediaType;
  images?: BlockImage[];
  /** enable parallax on the main single image */
  parallax?: boolean;

  // ── Extras below the split ──
  /** gallery row rendered below the full-width section */
  galleryBelow?: BlockImage[];
  /** stat cards row rendered below the full-width section */
  statsRow?: SplitStatCard[];
  /** cards rendered in the media column (mediaType='info-cards') */
  infoCards?: SplitInfoCard[];

  // ── Per-element text styles ──
  eyebrowStyle?: TextElementStyle;
  titleStyle?: TextElementStyle;
  subtitleStyle?: TextElementStyle;
  bodyStyle?: TextElementStyle;
  blockquoteStyle?: TextElementStyle;
  ctaButtonsStyle?: TextElementStyle;
}

// ─── Block 6: CardGrid ───────────────────────────────────────────────────────

export type CardGridTheme = 'light' | 'dark';
export type CardStyle = 'numbered-roman' | 'numbered-decimal' | 'plain';

export interface CardGridItem {
  /** Roman "I.", decimal "01", or omitted */
  prefix?: string;
  title: string;
  body: string;
}

export interface CardGridBlockProps extends BaseBlockStyleProps {
  id?: string;
  theme?: CardGridTheme;
  eyebrow?: string;
  chapterNumber?: string;
  title?: string;
  subtitle?: string;
  cardStyle?: CardStyle;
  columns?: 2 | 3 | 4;
  cards: CardGridItem[];
  /** paragraph rendered below the cards */
  bodyText?: string;
  bgImage?: string;
  bgImageOpacity?: number;
}

// ─── Block 7: VideoGrid ──────────────────────────────────────────────────────

export interface VideoItem {
  /** YouTube video id */
  id: string;
  tag?: string;
  title: string;
  desc: string;
  thumbnail?: string;
}

export interface VideoGridBlockProps extends BaseBlockStyleProps {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  videos: VideoItem[];
  columns?: 2 | 3;
  bgImage?: string;
  bgImageOpacity?: number;
  theme?: 'light' | 'dark';
}

// ─── Block 8: SplitCards ────────────────────────────────────────────────────

export interface SplitCardsBlockProps extends BaseBlockStyleProps {
  id?: string;
  theme?: SplitTheme;
  eyebrow?: string;
  chapterNumber?: string;
  title: string;
  subtitle?: string;
  body: string[];
  blockquote?: string;
  tags?: string[];
  ctaButtons?: BlockButton[];
  imagePosition?: SplitImagePosition;
  infoCards: SplitInfoCard[];
  bgImage?: string;
  bgImageOpacity?: number;
}

// ─── Block 9: Iframe ─────────────────────────────────────────────────────────

export interface IframeBlockProps extends BaseBlockStyleProps {
  id?: string;
  src: string;
  layout?: 'full-width' | 'contained';
  height?: number | string;
  mobileHeight?: number | string;
  width?: number | string;
  theme?: SplitTheme;
  bgImage?: string;
  bgImageOpacity?: number;
}

// ─── Block 10: ImageBanner ───────────────────────────────────────────────────

export interface ImageBannerBlockProps extends BaseBlockStyleProps {
  id?: string;
  src: string;
  alt?: string;
  caption?: string;
  /** Container width preset */
  layout?: 'full' | 'shell' | 'narrow';
  /** Height preset or custom CSS value (e.g. "480px", "50vh") */
  height?: 'auto' | 'short' | 'medium' | 'tall' | 'full' | string;
  /** CSS object-position for cover mode (e.g. "center", "top", "50% 20%") */
  objectPosition?: string;
}

// ─── Block 11: Gallery ───────────────────────────────────────────────────────

export interface GalleryBlockProps extends BaseBlockStyleProps {
  id?: string;
  kicker?: string;
  images: BlockImage[];
  theme?: 'light' | 'dark';
  bgImage?: string;
  bgImageOpacity?: number;
}

// ─── Block 12: Reveal (spotlight statement) ─────────────────────────────────

export interface RevealBlockProps extends BaseBlockStyleProps {
  id?: string;
  text: string;
  bgImage?: string;
  bgImageOpacity?: number;
}

// ─── Block 13: Film (video showcase) ────────────────────────────────────────

export interface FilmBlockProps extends BaseBlockStyleProps {
  id?: string;
  kicker?: string;
  title?: string;
  /** YouTube URL/ID or an uploaded video URL */
  videoUrl: string;
  posterUrl?: string;
  theme?: 'light' | 'dark';
}

// ─── Block 14: Offer (price / CTA counter) ──────────────────────────────────

export interface OfferContact {
  name: string;
  phone: string;
}

export interface OfferBlockProps extends BaseBlockStyleProps {
  id?: string;
  headline: string;
  price: string;
  currency?: string;
  note?: string;
  hint?: string;
  contacts?: OfferContact[];
  theme?: 'light' | 'dark';
  bgImage?: string;
  bgImageOpacity?: number;
}

// ─── Block 15: Closing (closing statement) ──────────────────────────────────

export interface ClosingBlockProps extends BaseBlockStyleProps {
  id?: string;
  kicker?: string;
  q1: string;
  q2?: string;
  sub1?: string;
  sub2?: string;
  author?: string;
  theme?: 'light' | 'dark';
  bgImage?: string;
  bgImageOpacity?: number;
}

// ─── Block 16: Size (product dimensions) ────────────────────────────────────

export interface SizeDimension {
  label: string;
  value: string;
}

export interface SizeSpec {
  label: string;
  value: string;
}

export interface SizeBlockProps extends BaseBlockStyleProps {
  id?: string;
  kicker?: string;
  label?: string;
  imageUrl?: string;
  dimensions?: SizeDimension[];
  specs?: SizeSpec[];
  theme?: 'light' | 'dark';
  bgImage?: string;
  bgImageOpacity?: number;
}

// ─── Block 17: Catalog (product/artwork catalog card) ───────────────────────

export interface CatalogColumn {
  heading: string;
  items: string[];
}

export interface CatalogBlockProps extends BaseBlockStyleProps {
  id?: string;
  number?: string;
  title: string;
  subtitle?: string;
  /** rich text, supports basic HTML tags */
  body?: string;
  images?: string[];
  imageCaption?: string;
  price?: string;
  columns?: CatalogColumn[];
  theme?: 'light' | 'dark';
  bgImage?: string;
  bgImageOpacity?: number;
}
