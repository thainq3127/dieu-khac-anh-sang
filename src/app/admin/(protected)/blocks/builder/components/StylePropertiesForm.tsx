import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { PALETTE_COLORS } from '../constants'
import { ElementStyles, CanvasElement, ElementKind } from '../types'
import { Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'

interface StylePropertiesFormProps {
  element: CanvasElement
  onChange: (styles: ElementStyles) => void
}

function ColorSelector({
  label,
  value = '',
  onChange,
}: {
  label: string
  value: string | undefined
  onChange: (val: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {PALETTE_COLORS.map(color => (
          <button
            key={color.name}
            type="button"
            onClick={() => onChange(color.value)}
            title={color.name}
            className={cn(
              'w-6 h-6 rounded-full border border-border transition-all flex items-center justify-center shrink-0 relative',
              value === color.value ? 'ring-2 ring-amber-500 scale-110 z-10 border-transparent shadow-sm' : 'hover:scale-105',
            )}
            style={{
              backgroundColor: color.value === 'transparent' ? 'transparent' : color.value,
              backgroundImage:
                color.value === 'transparent'
                  ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                  : undefined,
              backgroundSize: color.value === 'transparent' ? '6px 6px' : undefined,
            }}
          >
            {value === color.value && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" style={{ filter: 'invert(1) grayscale(1) contrast(9)' }} />
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground font-mono shrink-0">Custom:</span>
        <Input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#ffffff"
          className="h-7 text-xs font-mono px-2 py-0.5"
        />
      </div>
    </div>
  )
}

// Helper functions to check element styling support
const supportsTypography = (kind: ElementKind) => {
  return ['heading', 'paragraph', 'quote', 'list', 'button', 'badge', 'marquee'].includes(kind)
}

const supportsFontWeight = (kind: ElementKind) => {
  return ['heading', 'paragraph', 'button'].includes(kind)
}

const supportsTextAlign = (kind: ElementKind) => {
  return ['heading', 'paragraph', 'quote'].includes(kind)
}

const supportsFontStyleDeco = (kind: ElementKind) => {
  return ['heading', 'paragraph'].includes(kind)
}

const supportsTextColor = (kind: ElementKind) => {
  return ['heading', 'paragraph', 'quote', 'list', 'button', 'badge', 'marquee'].includes(kind)
}

const supportsBackgroundColor = (kind: ElementKind) => {
  return [
    'heading',
    'paragraph',
    'quote',
    'button',
    'badge',
    'card',
    'icon-feature',
    'marquee',
    'container',
    'columns',
    'column',
  ].includes(kind)
}

const supportsPadding = (kind: ElementKind) => {
  return ['button', 'card', 'icon-feature', 'container', 'columns', 'column'].includes(kind)
}

const supportsBorder = (kind: ElementKind) => {
  return [
    'button',
    'badge',
    'image',
    'image-banner',
    'video',
    'iframe',
    'card',
    'icon-feature',
    'heritage-map',
    'marquee',
    'container',
    'columns',
    'column',
  ].includes(kind)
}

export default function StylePropertiesForm({ element, onChange }: StylePropertiesFormProps) {
  const styles = element.styles || {}
  const setStyle = (key: keyof ElementStyles, value: unknown) => {
    onChange({
      ...styles,
      [key]: value,
    })
  }

  const kind = element.kind
  const hasTypography = supportsTypography(kind)
  const hasBackgroundColor = supportsBackgroundColor(kind)
  const hasPadding = supportsPadding(kind)
  const hasBorder = supportsBorder(kind)
  const hasSpacing = true // All elements support spacing margins

  return (
    <div className="space-y-5">
      {/* ── Typography ── */}
      {hasTypography && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Định dạng chữ</p>

          {/* Font size */}
          <div className="space-y-1.5">
            <Label className="text-xs">Kích thước</Label>
            <div className="grid grid-cols-5 gap-1">
              {['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'].map(sz => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setStyle('fontSize', sz)}
                  className={cn(
                    'py-1 text-[10px] font-semibold rounded border transition-all uppercase',
                    styles.fontSize === sz
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-bold'
                      : 'border-border text-muted-foreground hover:border-amber-500/40',
                  )}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Font weight */}
          {supportsFontWeight(kind) && (
            <div className="space-y-1.5">
              <Label className="text-xs">Độ đậm</Label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { v: 'light', l: 'Mỏng' },
                  { v: 'normal', l: 'Thường' },
                  { v: 'medium', l: 'Vừa' },
                  { v: 'bold', l: 'Đậm' },
                ].map(({ v, l }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setStyle('fontWeight', v)}
                    className={cn(
                      'py-1 text-[10px] rounded border transition-all',
                      styles.fontWeight === v
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-bold'
                        : 'border-border text-muted-foreground hover:border-amber-500/40',
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alignment & Deco Row */}
          {(supportsTextAlign(kind) || supportsFontStyleDeco(kind)) && (
            <div className="grid grid-cols-2 gap-3">
              {/* Text align */}
              {supportsTextAlign(kind) ? (
                <div className="space-y-1.5">
                  <Label className="text-xs">Căn lề</Label>
                  <div className="flex border border-border rounded-md overflow-hidden bg-background">
                    {[
                      { v: 'left', icon: AlignLeft },
                      { v: 'center', icon: AlignCenter },
                      { v: 'right', icon: AlignRight },
                      { v: 'justify', icon: AlignJustify },
                    ].map(({ v, icon: Icon }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setStyle('textAlign', v)}
                        className={cn(
                          'flex-1 py-1.5 flex items-center justify-center border-r last:border-r-0 border-border text-muted-foreground hover:bg-muted/40 transition-colors',
                          styles.textAlign === v && 'bg-amber-500/10 text-amber-700 font-bold',
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div />
              )}

              {/* Text Decoration / Style */}
              {supportsFontStyleDeco(kind) ? (
                <div className="space-y-1.5">
                  <Label className="text-xs">Kiểu chữ</Label>
                  <div className="flex border border-border rounded-md overflow-hidden bg-background">
                    {/* Italic toggle */}
                    <button
                      type="button"
                      onClick={() => setStyle('fontStyle', styles.fontStyle === 'italic' ? 'normal' : 'italic')}
                      className={cn(
                        'flex-1 py-1.5 flex items-center justify-center border-r border-border text-muted-foreground hover:bg-muted/40 transition-colors',
                        styles.fontStyle === 'italic' && 'bg-amber-500/10 text-amber-700 font-bold',
                      )}
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    {/* Underline toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setStyle(
                          'textDecoration',
                          styles.textDecoration === 'underline' ? 'none' : 'underline',
                        )
                      }
                      className={cn(
                        'flex-1 py-1.5 flex items-center justify-center border-r border-border text-muted-foreground hover:bg-muted/40 transition-colors',
                        styles.textDecoration === 'underline' && 'bg-amber-500/10 text-amber-700 font-bold',
                      )}
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    {/* Line-through toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setStyle(
                          'textDecoration',
                          styles.textDecoration === 'line-through' ? 'none' : 'line-through',
                        )
                      }
                      className={cn(
                        'flex-1 py-1.5 flex items-center justify-center text-muted-foreground hover:bg-muted/40 transition-colors',
                        styles.textDecoration === 'line-through' && 'bg-amber-500/10 text-amber-700 font-bold',
                      )}
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div />
              )}
            </div>
          )}

          {/* Text color */}
          {supportsTextColor(kind) && (
            <ColorSelector label="Màu chữ" value={styles.textColor} onChange={val => setStyle('textColor', val)} />
          )}
        </div>
      )}

      {hasTypography && (hasBackgroundColor || hasSpacing) && <Separator />}

      {/* ── Background & Spacing ── */}
      {(hasBackgroundColor || hasSpacing) && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Màu nền &amp; Khoảng cách</p>

          {/* Background color */}
          {hasBackgroundColor && (
            <ColorSelector
              label="Màu nền"
              value={styles.backgroundColor}
              onChange={val => setStyle('backgroundColor', val)}
            />
          )}

          {/* Spacing (Padding) */}
          {hasPadding && (
            <div className="space-y-1.5">
              <Label className="text-xs">Đệm trong (Padding px)</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: 'paddingTop' as const, label: 'Trên' },
                  { key: 'paddingBottom' as const, label: 'Dưới' },
                  { key: 'paddingLeft' as const, label: 'Trái' },
                  { key: 'paddingRight' as const, label: 'Phải' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-0.5">
                    <span className="text-[9px] text-muted-foreground uppercase block">{label}</span>
                    <Input
                      type="number"
                      value={styles[key] ?? ''}
                      onChange={e =>
                        setStyle(key, e.target.value === '' ? undefined : parseInt(e.target.value, 10))
                      }
                      placeholder="0"
                      className="h-8 text-xs px-1.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spacing (Margin) */}
          <div className="space-y-1.5">
            <Label className="text-xs">Lề ngoài (Margin px)</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'marginTop' as const, label: 'Lề Trên' },
                { key: 'marginBottom' as const, label: 'Lề Dưới' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-0.5">
                  <span className="text-[9px] text-muted-foreground uppercase block">{label}</span>
                  <Input
                    type="number"
                    value={styles[key] ?? ''}
                    onChange={e =>
                      setStyle(key, e.target.value === '' ? undefined : parseInt(e.target.value, 10))
                    }
                    placeholder="0"
                    className="h-8 text-xs px-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(hasBackgroundColor || hasSpacing) && hasBorder && <Separator />}

      {/* ── Border ── */}
      {hasBorder && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Đường viền</p>

          {/* Border Style */}
          <div className="space-y-1.5">
            <Label className="text-xs">Kiểu viền</Label>
            <div className="grid grid-cols-5 gap-1">
              {[
                { v: 'none', l: 'None' },
                { v: 'solid', l: 'Solid' },
                { v: 'dashed', l: 'Dash' },
                { v: 'dotted', l: 'Dot' },
                { v: 'double', l: 'Db' },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setStyle('borderStyle', v as ElementStyles['borderStyle'])}
                  className={cn(
                    'py-1 text-[10px] rounded border transition-all',
                    (styles.borderStyle || 'none') === v
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-bold'
                      : 'border-border text-muted-foreground hover:border-amber-500/40',
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Border Width & Radius */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Độ dày viền (px)</Label>
              <Input
                type="number"
                value={styles.borderWidth ?? ''}
                onChange={e =>
                  setStyle('borderWidth', e.target.value === '' ? undefined : parseInt(e.target.value, 10))
                }
                placeholder="0"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Bo góc (px)</Label>
              <Input
                type="number"
                value={styles.borderRadius ?? ''}
                onChange={e =>
                  setStyle('borderRadius', e.target.value === '' ? undefined : parseInt(e.target.value, 10))
                }
                placeholder="0"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Border Color */}
          <ColorSelector
            label="Màu viền"
            value={styles.borderColor}
            onChange={val => setStyle('borderColor', val)}
          />
        </div>
      )}
    </div>
  )
}
