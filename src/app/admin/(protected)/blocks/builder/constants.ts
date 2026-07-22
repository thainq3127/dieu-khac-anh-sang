import React from 'react'
import {
  Type,
  AlignLeft,
  Quote,
  List,
  Image as ImgIcon,
  Play,
  MousePointerClick,
  Tag,
  Minus,
  ArrowUpDown,
  Columns,
  LayoutGrid,
  Star,
  Map,
  Globe,
} from 'lucide-react'
import { Variants } from 'framer-motion'
import { ElementKind, AnimationConfig, ElementStyles, CanvasElement, PaletteGroup, PaletteItemDef } from './types'

export const PALETTE_GROUPS: PaletteGroup[] = [
  {
    id: 'text',
    label: 'Văn bản',
    items: [
      { kind: 'heading', label: 'Tiêu đề', icon: Type },
      { kind: 'paragraph', label: 'Đoạn văn', icon: AlignLeft },
      { kind: 'quote', label: 'Trích dẫn', icon: Quote },
      { kind: 'list', label: 'Danh sách', icon: List },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    items: [
      { kind: 'image', label: 'Hình ảnh', icon: ImgIcon },
      { kind: 'video', label: 'Video', icon: Play },
      { kind: 'iframe', label: 'Iframe Embed', icon: Globe },
      { kind: 'image-banner', label: 'Banner ảnh', icon: ImgIcon },
    ],
  },
  {
    id: 'interactive',
    label: 'Tương tác',
    items: [
      { kind: 'button', label: 'Nút bấm', icon: MousePointerClick },
      { kind: 'badge', label: 'Nhãn', icon: Tag },
      { kind: 'marquee', label: 'Chữ chạy (Marquee)', icon: Type },
    ],
  },
  {
    id: 'layout',
    label: 'Bố cục',
    items: [
      { kind: 'divider', label: 'Đường kẻ', icon: Minus },
      { kind: 'spacer', label: 'Khoảng trống', icon: ArrowUpDown },
      { kind: 'columns', label: 'Chia cột', icon: Columns },
      { kind: 'container', label: 'Container Box', icon: LayoutGrid },
    ],
  },
  {
    id: 'components',
    label: 'Thành phần',
    items: [
      { kind: 'card', label: 'Thẻ nội dung', icon: LayoutGrid },
      { kind: 'icon-feature', label: 'Icon Feature', icon: Star },
      { kind: 'heritage-map', label: 'Bản đồ di sản', icon: Map },
    ],
  },
]

export const ALL_PALETTE_ITEMS: PaletteItemDef[] = PALETTE_GROUPS.flatMap(g => g.items)

export const ANIMATION_EFFECTS = [
  { effect: 'none' as const, label: 'Không', symbol: '—' },
  { effect: 'fade' as const, label: 'Fade In', symbol: '✦' },
  { effect: 'slide-up' as const, label: 'Slide Up', symbol: '↑' },
  { effect: 'slide-down' as const, label: 'Slide Down', symbol: '↓' },
  { effect: 'slide-left' as const, label: 'Slide Left', symbol: '←' },
  { effect: 'slide-right' as const, label: 'Slide Right', symbol: '→' },
  { effect: 'scale' as const, label: 'Scale In', symbol: '⊕' },
  { effect: 'bounce' as const, label: 'Bounce', symbol: '↕' },
  { effect: 'blur' as const, label: 'Blur In', symbol: '◎' },
]

export const ANIMATION_VARIANTS: Record<string, Variants> = {
  none: { hidden: {}, visible: {} },
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  'slide-up': { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
  'slide-down': { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
  'slide-left': { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  'slide-right': { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.82 }, visible: { opacity: 1, scale: 1 } },
  bounce: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 380, damping: 14 },
    },
  },
  blur: { hidden: { opacity: 0, filter: 'blur(14px)' }, visible: { opacity: 1, filter: 'blur(0px)' } },
}

export function newId() {
  return `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function getDefaultAnimation(): AnimationConfig {
  return { effect: 'none', delay: 0, duration: 500, trigger: 'scroll', once: true }
}

export function getDefaultProps(kind: ElementKind): Record<string, unknown> {
  switch (kind) {
    case 'heading':
      return { text: 'Tiêu đề của bạn', level: 'h2', align: 'left' }
    case 'paragraph':
      return { text: 'Nội dung đoạn văn bản của bạn...', align: 'left' }
    case 'quote':
      return { text: 'Trích dẫn nổi bật...', author: 'Tên tác giả' }
    case 'list':
      return { items: ['Mục thứ nhất', 'Mục thứ hai', 'Mục thứ ba'], style: 'bullet' }
    case 'image':
      return { src: '', alt: 'Mô tả hình ảnh', caption: '', aspectRatio: '16/9' }
    case 'video':
      return { youtubeId: '', title: 'Tiêu đề video' }
    case 'button':
      return { text: 'Nhấn vào đây', href: '#', variant: 'primary', align: 'left', size: 'md' }
    case 'badge':
      return { text: 'DI SẢN VĂN HÓA', color: 'gold' }
    case 'divider':
      return { style: 'line' }
    case 'spacer':
      return { height: 48 }
    case 'columns':
      return { columns: 2, layout: '2-equal', gap: 16 }
    case 'column':
      return { width: '50%' }
    case 'container':
      return {}
    case 'card':
      return { title: 'Tiêu đề thẻ', body: 'Nội dung thẻ...', image: '', tag: '' }
    case 'icon-feature':
      return { icon: '🏛️', title: 'Tiêu đề', body: 'Mô tả ngắn gọn.' }
    case 'marquee':
      return { text: 'Dòng chữ chạy liên tục giới thiệu di sản văn hóa Chăm...', speed: 5, direction: 'left' }
    case 'iframe':
      return { src: 'https://my.matterport.com/show/?m=Qd6j8nI12mU', height: 450 }
    case 'image-banner':
      return { src: '', alt: 'Banner ảnh di sản', height: 350 }
    case 'heritage-map':
      return { title: 'Bản đồ di sản văn hóa Chăm', zoom: 12 }
    default:
      return {}
  }
}

export function getDefaultStyles(kind: ElementKind): ElementStyles {
  switch (kind) {
    case 'container':
      return {
        paddingTop: 24,
        paddingBottom: 24,
        paddingLeft: 24,
        paddingRight: 24,
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#cbd5e1', // slate-300
        backgroundColor: '#f8fafc', // slate-50
      }
    case 'column':
      return {
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 8,
        borderStyle: 'none',
        borderWidth: 0,
      }
    default:
      return {}
  }
}

export function createElement(kind: ElementKind): CanvasElement {
  const elementId = newId()
  let children: CanvasElement[] | undefined = undefined

  if (kind === 'columns') {
    children = []
  } else if (kind === 'container' || kind === 'column') {
    children = []
  }

  return {
    id: elementId,
    kind,
    props: getDefaultProps(kind),
    animation: getDefaultAnimation(),
    styles: getDefaultStyles(kind),
    visible: true,
    children,
  }
}

export function getStyleObject(styles?: ElementStyles): React.CSSProperties {
  if (!styles) return {}
  const css: React.CSSProperties = {}

  if (styles.textColor) css.color = styles.textColor
  if (styles.backgroundColor) css.backgroundColor = styles.backgroundColor
  if (styles.borderColor) css.borderColor = styles.borderColor
  if (styles.borderWidth !== undefined) css.borderWidth = `${styles.borderWidth}px`
  if (styles.borderRadius !== undefined) css.borderRadius = `${styles.borderRadius}px`
  if (styles.borderStyle) css.borderStyle = styles.borderStyle

  if (styles.paddingTop !== undefined) css.paddingTop = `${styles.paddingTop}px`
  if (styles.paddingBottom !== undefined) css.paddingBottom = `${styles.paddingBottom}px`
  if (styles.paddingLeft !== undefined) css.paddingLeft = `${styles.paddingLeft}px`
  if (styles.paddingRight !== undefined) css.paddingRight = `${styles.paddingRight}px`

  if (styles.marginTop !== undefined) css.marginTop = `${styles.marginTop}px`
  if (styles.marginBottom !== undefined) css.marginBottom = `${styles.marginBottom}px`

  if (styles.fontSize) {
    const sizeMap: Record<string, string> = {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    }
    css.fontSize = sizeMap[styles.fontSize] || styles.fontSize
  }

  if (styles.fontWeight) {
    const weightMap: Record<string, string> = {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    }
    css.fontWeight = weightMap[styles.fontWeight] || styles.fontWeight
  }

  if (styles.textAlign) css.textAlign = styles.textAlign
  if (styles.lineHeight) css.lineHeight = styles.lineHeight
  if (styles.fontStyle) css.fontStyle = styles.fontStyle
  if (styles.textDecoration) css.textDecoration = styles.textDecoration

  return css
}

export function getGridSpanClass(width?: string): string {
  if (!width) return 'md:col-span-6'
  const w = width.trim().toLowerCase()
  if (w.includes('25%') || w === '1/4') return 'md:col-span-3'
  if (w.includes('33%') || w.includes('33.33%') || w === '1/3') return 'md:col-span-4'
  if (w.includes('50%') || w === '1/2') return 'md:col-span-6'
  if (w.includes('66%') || w.includes('66.67%') || w === '2/3') return 'md:col-span-8'
  if (w.includes('75%') || w === '3/4') return 'md:col-span-9'
  if (w.includes('100%') || w === '1/1') return 'md:col-span-12'

  // Custom span
  if (w.startsWith('span-')) {
    return `md:col-span-${w.substring(5)}`
  }
  if (w.startsWith('span ')) {
    return `md:col-span-${w.substring(5)}`
  }
  const parsedInt = parseInt(w)
  if (!isNaN(parsedInt) && parsedInt >= 1 && parsedInt <= 12) {
    return `md:col-span-${parsedInt}`
  }

  // Fallback for percentage
  if (w.endsWith('%')) {
    const val = parseFloat(w)
    if (!isNaN(val)) {
      const span = Math.round((val / 100) * 12)
      return `md:col-span-${Math.max(1, Math.min(12, span))}`
    }
  }

  return 'md:col-span-6'
}

export const COLUMN_LAYOUTS = [
  {
    id: '2-equal',
    label: '2 cột (40% - 60%)',
    cols: 2,
    widths: ['40%', '60%'],
    grid: [
      { colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 1 },
      { colStart: 3, colSpan: 3, rowStart: 1, rowSpan: 1 },
    ],
  },
  {
    id: '2-right-narrow',
    label: '2 cột (60% - 40%)',
    cols: 2,
    widths: ['60%', '40%'],
    grid: [
      { colStart: 1, colSpan: 3, rowStart: 1, rowSpan: 1 },
      { colStart: 4, colSpan: 2, rowStart: 1, rowSpan: 1 },
    ],
  },
  {
    id: '3-cols-mixed',
    label: '3 cột (40% - 40% - 20%)',
    cols: 3,
    widths: ['40%', '40%', '20%'],
    grid: [
      { colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 1 },
      { colStart: 3, colSpan: 2, rowStart: 1, rowSpan: 1 },
      { colStart: 5, colSpan: 1, rowStart: 1, rowSpan: 1 },
    ],
  },
  {
    id: '5-equal',
    label: '5 cột đều (20% mỗi cột)',
    cols: 5,
    widths: ['20%', '20%', '20%', '20%', '20%'],
    grid: [
      { colStart: 1, colSpan: 1, rowStart: 1, rowSpan: 1 },
      { colStart: 2, colSpan: 1, rowStart: 1, rowSpan: 1 },
      { colStart: 3, colSpan: 1, rowStart: 1, rowSpan: 1 },
      { colStart: 4, colSpan: 1, rowStart: 1, rowSpan: 1 },
      { colStart: 5, colSpan: 1, rowStart: 1, rowSpan: 1 },
    ],
  },
  {
    id: '2-rows-mixed',
    label: '2 hàng (67/33 + 3 cột đều)',
    cols: 5,
    widths: ['60%', '40%', '20%', '20%', '20%'],
    grid: [
      { colStart: 1, colSpan: 3, rowStart: 1, rowSpan: 1 },
      { colStart: 4, colSpan: 2, rowStart: 1, rowSpan: 1 },
      { colStart: 1, colSpan: 1, rowStart: 2, rowSpan: 1 },
      { colStart: 2, colSpan: 1, rowStart: 2, rowSpan: 1 },
      { colStart: 3, colSpan: 1, rowStart: 2, rowSpan: 1 },
    ],
  },
]

export const PALETTE_COLORS = [
  { name: 'Trong suốt', value: 'transparent' },
  { name: 'Trắng', value: '#ffffff' },
  { name: 'Đen', value: '#09090b' }, // zinc-950
  { name: 'Vàng Amber', value: '#d97706' }, // amber-600
  { name: 'Vàng Cát', value: '#fef3c7' }, // amber-100
  { name: 'Đỏ Rose', value: '#e11d48' }, // rose-600
  { name: 'Hồng Nhạt', value: '#ffe4e6' }, // rose-100
  { name: 'Xanh Emerald', value: '#059669' }, // emerald-600
  { name: 'Xanh Mint', value: '#d1fae5' }, // emerald-100
  { name: 'Xanh Dương', value: '#2563eb' }, // blue-600
  { name: 'Xanh Nhạt', value: '#dbeafe' }, // blue-100
  { name: 'Xám Slate', value: '#475569' }, // slate-600
  { name: 'Xám Nhạt', value: '#f1f5f9' }, // slate-100
]
