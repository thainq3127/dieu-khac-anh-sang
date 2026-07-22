import React from 'react'

export type ElementKind =
  | 'heading'
  | 'paragraph'
  | 'quote'
  | 'list'
  | 'image'
  | 'video'
  | 'button'
  | 'badge'
  | 'divider'
  | 'spacer'
  | 'columns'
  | 'column'
  | 'container'
  | 'card'
  | 'icon-feature'
  | 'marquee'
  | 'iframe'
  | 'image-banner'
  | 'heritage-map'

export type AnimationEffect =
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'bounce'
  | 'blur'

export type AnimationConfig = {
  effect: AnimationEffect
  delay: number
  duration: number
  trigger: 'load' | 'scroll'
  once: boolean
}

export type ElementStyles = {
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double'
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  marginTop?: number
  marginBottom?: number
  fontSize?: string
  fontWeight?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: string
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through'
}

export type CanvasElement = {
  id: string
  kind: ElementKind
  props: Record<string, unknown>
  animation: AnimationConfig
  styles?: ElementStyles
  visible: boolean
  children?: CanvasElement[]
}

export type DragData =
  | { source: 'palette'; kind: ElementKind }
  | { source: 'canvas'; elementId: string; parentId?: string | null }

export type PaletteItemDef = {
  kind: ElementKind
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export type PaletteGroup = {
  id: string
  label: string
  items: PaletteItemDef[]
}
