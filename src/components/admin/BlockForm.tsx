'use client'

import { C, Field, Select } from './block-forms/shared'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Palette, FileText, Image as ImageIcon, Settings, ChevronDown } from 'lucide-react'
import { HeroForm } from './block-forms/HeroForm'
import { SplitForm } from './block-forms/SplitForm'
import { SplitCardsForm } from './block-forms/SplitCardsForm'
import { MarqueeForm } from './block-forms/MarqueeForm'
import { QuoteBreakForm } from './block-forms/QuoteBreakForm'
import { VideoGridForm } from './block-forms/VideoGridForm'
import { CardGridForm } from './block-forms/CardGridForm'
import { FeaturesStripForm } from './block-forms/FeaturesStripForm'
import { IntroForm } from './block-forms/IntroForm'
import { MapForm } from './block-forms/MapForm'
import { IframeForm } from './block-forms/IframeForm'
import { ImageBannerForm } from './block-forms/ImageBannerForm'
import { GalleryForm } from './block-forms/GalleryForm'
import { RevealForm } from './block-forms/RevealForm'
import { FilmForm } from './block-forms/FilmForm'
import { OfferForm } from './block-forms/OfferForm'
import { ClosingForm } from './block-forms/ClosingForm'
import { SizeForm } from './block-forms/SizeForm'
import { CatalogForm } from './block-forms/CatalogForm'

type Props = { blockType: string; content: C; onChange: (c: C) => void; activeLang: string; }

export function validateBlockContent(blockType: string, content: Record<string, unknown>): string | null {
  const getViValue = (field: unknown) => {
    if (!field) return ''
    if (typeof field === 'object' && field !== null) {
      return ((field as Record<string, unknown>).vi as string) ?? ''
    }
    return String(field)
  }

  switch (blockType) {
    case 'hero':
      if (!getViValue(content.title).trim()) return 'Tiêu đề Tiếng Việt không được để trống.'
      break
    case 'split':
      if (!getViValue(content.title).trim()) return 'Tiêu đề Tiếng Việt không được để trống.'
      break
    case 'quote_break':
      if (!getViValue(content.quote).trim()) return 'Trích dẫn Tiếng Việt không được để trống.'
      break
    case 'video_grid':
      if (!getViValue(content.title).trim()) return 'Tiêu đề Tiếng Việt không được để trống.'
      break
    case 'intro':
      if (!getViValue(content.title).trim()) return 'Tiêu đề chính Tiếng Việt không được để trống.'
      break
    case 'map':
      if (!getViValue(content.title).trim()) return 'Tiêu đề chính Tiếng Việt không được để trống.'
      break
    case 'iframe':
      if (!getViValue(content.src).trim()) return 'Đường dẫn Iframe không được để trống.'
      break
    case 'image_banner':
      if (!String(content.src ?? '').trim()) return 'Vui lòng tải ảnh banner lên.'
      break
    case 'reveal':
      if (!getViValue(content.text).trim()) return 'Nội dung câu chữ Tiếng Việt không được để trống.'
      break
    case 'film':
      if (!String(content.videoUrl ?? '').trim()) return 'Vui lòng nhập hoặc tải video lên.'
      break
    case 'offer':
      if (!getViValue(content.headline).trim()) return 'Tiêu đề Tiếng Việt không được để trống.'
      if (!String(content.price ?? '').trim()) return 'Vui lòng nhập giá.'
      break
    case 'closing':
      if (!getViValue(content.q1).trim()) return 'Câu 1 Tiếng Việt không được để trống.'
      break
    case 'catalog':
      if (!getViValue(content.title).trim()) return 'Tiêu đề Tiếng Việt không được để trống.'
      break
  }
  return null
}

export function BlockForm({ blockType, content, onChange, activeLang }: Props) {
  function set(key: string, value: unknown) {
    onChange({ ...content, [key]: value })
  }

  const blocksWithMedia = ['hero', 'split', 'video_grid', 'map', 'iframe', 'image_banner', 'gallery', 'film', 'size', 'catalog']
  const hasMedia = blocksWithMedia.includes(blockType)

  function renderForm(tab: 'content' | 'media' | 'ui') {
    switch (blockType) {
      case 'hero': return <HeroForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'split': return <SplitForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'split_cards': return <SplitCardsForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'marquee': return <MarqueeForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'quote_break': return <QuoteBreakForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'video_grid': return <VideoGridForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'card_grid': return <CardGridForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'features_strip': return <FeaturesStripForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'intro': return <IntroForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'map': return <MapForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'iframe': return <IframeForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'image_banner': return <ImageBannerForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'gallery': return <GalleryForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'reveal': return <RevealForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'film': return <FilmForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'offer': return <OfferForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'closing': return <ClosingForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'size': return <SizeForm c={content} set={set} activeLang={activeLang} tab={tab} />
      case 'catalog': return <CatalogForm c={content} set={set} activeLang={activeLang} tab={tab} />
      default:
        return tab === 'content' ? (
          <Field label="Nội dung (JSON thô)">
            <Textarea
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => { try { onChange(JSON.parse(e.target.value)) } catch { /* invalid JSON */ } }}
              rows={12}
              className="font-mono text-xs"
            />
          </Field>
        ) : null
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. NỘI DUNG & VĂN BẢN */}
      <details className="group border border-border rounded-lg bg-card overflow-hidden" open>
        <summary className="p-3.5 font-semibold text-sm cursor-pointer select-none bg-muted/40 hover:bg-muted/70 transition-colors flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-2 text-terra-dark dark:text-gold-lt">
            <FileText className="w-4.5 h-4.5" />
            <span>1. Nội dung & Văn bản (Content)</span>
          </div>
          <ChevronDown className="w-4.5 h-4.5 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <div className="p-4 space-y-4 border-t border-border bg-background/50">
          {renderForm('content')}
        </div>
      </details>

      {/* 2. HÌNH ẢNH & MEDIA */}
      {hasMedia && (
        <details className="group border border-border rounded-lg bg-card overflow-hidden">
          <summary className="p-3.5 font-semibold text-sm cursor-pointer select-none bg-muted/40 hover:bg-muted/70 transition-colors flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
            <div className="flex items-center gap-2 text-terra-dark dark:text-gold-lt">
              <ImageIcon className="w-4.5 h-4.5" />
              <span>2. Hình ảnh & Đa phương tiện (Media)</span>
            </div>
            <ChevronDown className="w-4.5 h-4.5 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="p-4 space-y-4 border-t border-border bg-background/50">
            {renderForm('media')}
          </div>
        </details>
      )}

      {/* 3. GIAO DIỆN & CẤU HÌNH */}
      <details className="group border border-border rounded-lg bg-card overflow-hidden">
        <summary className="p-3.5 font-semibold text-sm cursor-pointer select-none bg-muted/40 hover:bg-muted/70 transition-colors flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-2 text-terra-dark dark:text-gold-lt">
            <Settings className="w-4.5 h-4.5" />
            <span>{hasMedia ? '3.' : '2.'} Giao diện & Cấu hình (UI & Layout)</span>
          </div>
          <ChevronDown className="w-4.5 h-4.5 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <div className="p-4 space-y-5 border-t border-border bg-background/50">
          {renderForm('ui')}
          {blockType !== "image_banner" && <BlockStylingForm c={content} set={set} blockType={blockType} />}
        </div>
      </details>
    </div>
  )
}

function BlockStylingForm({ c, set, blockType }: { c: C; set: (key: string, value: unknown) => void; blockType?: string }) {
  const isHero = blockType === 'hero' || blockType === 'image_banner';
  const customBgType = (c.customBgType as string) ?? 'none'
  const customBgColor = (c.customBgColor as string) ?? '#efe4d2'
  const customBgGradientStart = (c.customBgGradientStart as string) ?? '#f5f0e6'
  const customBgGradientEnd = (c.customBgGradientEnd as string) ?? '#efe4d2'
  const customBgGradientAngle = (c.customBgGradientAngle as number) ?? 135
  const customTextColor = (c.customTextColor as string) ?? ''
  const customTitleColor = (c.customTitleColor as string) ?? ''
  const customBodyColor = (c.customBodyColor as string) ?? ''
  const customAccentColor = (c.customAccentColor as string) ?? ''
  const customThemeMode = (c.customThemeMode as string) ?? 'light'
  const customTextAlign = (c.customTextAlign as string) ?? ''
  const customPaddingTop = c.customPaddingTop as number | undefined
  const customPaddingBottom = c.customPaddingBottom as number | undefined
  const customPaddingLeft = c.customPaddingLeft as number | undefined
  const customPaddingRight = c.customPaddingRight as number | undefined
  const customMarginTop = c.customMarginTop as number | undefined
  const customMarginBottom = c.customMarginBottom as number | undefined
  const customFontFamily = (c.customFontFamily as string) ?? ''
  const customFontWeight = (c.customFontWeight as string) ?? ''
  const customFontSize = (c.customFontSize as string) ?? ''

  return (
    <details className="group border border-border rounded-lg bg-card overflow-hidden" open>
      <summary className="p-3.5 font-semibold text-sm cursor-pointer select-none bg-muted/40 hover:bg-muted/70 transition-colors flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2 text-terra-dark dark:text-gold-lt">
          <Palette className="w-4.5 h-4.5" />
          <span>Tùy chỉnh Giao diện Block (Styling & Typography)</span>
        </div>
        <ChevronDown className="w-4.5 h-4.5 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="p-4 space-y-5 border-t border-border bg-background/50">

        {/* SECTION 1: BACKGROUND & CONTRAST — hidden for hero (full-screen image bg) */}
        {!isHero && (
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-terra dark:text-gold-lt uppercase tracking-wider">Màu nền & Tông màu (Background & Contrast)</div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Kiểu nền (Background Type)">
                <Select
                  value={customBgType}
                  onChange={(v) => set('customBgType', v)}
                  options={[
                    { value: 'none', label: 'Mặc định (Theo Block)' },
                    { value: 'solid', label: 'Màu đơn (Solid Color)' },
                    { value: 'gradient', label: 'Màu loang (Gradient)' }
                  ]}
                />
              </Field>

              {customBgType !== 'none' && (
                <Field label="Tông màu giao diện (Contrast Mode)">
                  <Select
                    value={customThemeMode}
                    onChange={(v) => set('customThemeMode', v)}
                    options={[
                      { value: 'light', label: 'Sáng (Chữ tối, các card/badge sáng)' },
                      { value: 'dark', label: 'Tối (Chữ sáng, các card/badge tối)' }
                    ]}
                  />
                </Field>
              )}
            </div>

            {customBgType === 'solid' && (
              <div className="p-3 bg-muted/20 rounded-md border border-border">
                <Field label="Màu nền (Background Color)">
                  <div className="flex gap-2 max-w-md">
                    <Input
                      type="color"
                      value={customBgColor.startsWith('#') ? customBgColor : '#efe4d2'}
                      onChange={(e) => set('customBgColor', e.target.value)}
                      className="w-10 h-9 p-1 cursor-pointer shrink-0"
                    />
                    <Input
                      value={customBgColor}
                      onChange={(e) => set('customBgColor', e.target.value)}
                      placeholder="#efe4d2"
                      className="flex-1 text-sm font-mono"
                    />
                  </div>
                </Field>
              </div>
            )}

            {customBgType === 'gradient' && (
              <div className="p-3 bg-muted/20 rounded-md border border-border space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Màu Gradient bắt đầu (Start)">
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customBgGradientStart.startsWith('#') ? customBgGradientStart : '#f5f0e6'}
                        onChange={(e) => set('customBgGradientStart', e.target.value)}
                        className="w-10 h-9 p-1 cursor-pointer shrink-0"
                      />
                      <Input
                        value={customBgGradientStart}
                        onChange={(e) => set('customBgGradientStart', e.target.value)}
                        placeholder="#f5f0e6"
                        className="flex-1 text-sm font-mono"
                      />
                    </div>
                  </Field>
                  <Field label="Màu Gradient kết thúc (End)">
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customBgGradientEnd.startsWith('#') ? customBgGradientEnd : '#efe4d2'}
                        onChange={(e) => set('customBgGradientEnd', e.target.value)}
                        className="w-10 h-9 p-1 cursor-pointer shrink-0"
                      />
                      <Input
                        value={customBgGradientEnd}
                        onChange={(e) => set('customBgGradientEnd', e.target.value)}
                        placeholder="#efe4d2"
                        className="flex-1 text-sm font-mono"
                      />
                    </div>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Góc loang (Angle - độ)">
                    <Input
                      type="number"
                      value={customBgGradientAngle}
                      onChange={(e) => set('customBgGradientAngle', parseInt(e.target.value) || 0)}
                      placeholder="135"
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>
        )}

        {!isHero && <Separator />}

        {/* SECTION 2: TYPOGRAPHY — global font controls hidden for hero (per-element controls in HeroForm ui tab) */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-terra dark:text-gold-lt uppercase tracking-wider">Cấu hình Chữ (Typography & Fonts)</div>

          {!isHero && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Kiểu chữ (Font Family)">
                  <Select
                    value={customFontFamily}
                    onChange={(v) => set('customFontFamily', v)}
                    options={[
                      { value: '', label: 'Mặc định (Default)' },
                      { value: 'sans', label: 'Không chân (Sans-serif)' },
                      { value: 'serif', label: 'Có chân (Serif)' },
                      { value: 'mono', label: 'Đơn trị (Monospace)' }
                    ]}
                  />
                </Field>

                <Field label="Độ đậm chữ (Font Weight)">
                  <Select
                    value={customFontWeight}
                    onChange={(v) => set('customFontWeight', v)}
                    options={[
                      { value: '', label: 'Mặc định (Default)' },
                      { value: 'normal', label: 'Thường (Normal)' },
                      { value: 'medium', label: 'Vừa (Medium)' },
                      { value: 'semibold', label: 'Hơi đậm (Semibold)' },
                      { value: 'bold', label: 'Đậm (Bold)' }
                    ]}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Cỡ chữ (Font Size)">
                  <Select
                    value={customFontSize}
                    onChange={(v) => set('customFontSize', v)}
                    options={[
                      { value: '', label: 'Mặc định (Default)' },
                      { value: 'small', label: 'Nhỏ (Small)' },
                      { value: 'medium', label: 'Vừa (Medium)' },
                      { value: 'large', label: 'Lớn (Large)' },
                      { value: 'xlarge', label: 'Rất lớn (XL)' },
                      { value: 'xxlarge', label: 'Cực lớn (XXL)' },
                      { value: 'xxxlarge', label: 'Khổng lồ (XXXL)' }
                    ]}
                  />
                </Field>

                <Field label="Căn lề chữ (Text Align)">
                  <Select
                    value={customTextAlign}
                    onChange={(v) => set('customTextAlign', v)}
                    options={[
                      { value: '', label: 'Mặc định (Default)' },
                      { value: 'left', label: 'Trái (Left)' },
                      { value: 'center', label: 'Giữa (Center)' },
                      { value: 'right', label: 'Phải (Right)' },
                      { value: 'justify', label: 'Đều 2 bên (Justify)' }
                    ]}
                  />
                </Field>
              </div>
            </>
          )}

          {/* Per-element color pickers — hidden for marquee (no per-element color customization) */}
          {blockType !== 'marquee' && <div className="p-3 bg-muted/20 rounded-md border border-border space-y-3">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Màu chữ theo thành phần (Per-element Text Colors)</div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Màu tiêu đề (Title Color)">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customTitleColor.startsWith('#') ? customTitleColor : '#1a2320'}
                    onChange={(e) => set('customTitleColor', e.target.value)}
                    className="w-10 h-9 p-1 cursor-pointer shrink-0"
                  />
                  <Input
                    value={customTitleColor}
                    onChange={(e) => set('customTitleColor', e.target.value)}
                    placeholder="Mặc định"
                    className="flex-1 text-sm font-mono"
                  />
                </div>
              </Field>

              <Field label="Màu văn bản (Body Color)">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customBodyColor.startsWith('#') ? customBodyColor : '#1a2320'}
                    onChange={(e) => set('customBodyColor', e.target.value)}
                    className="w-10 h-9 p-1 cursor-pointer shrink-0"
                  />
                  <Input
                    value={customBodyColor}
                    onChange={(e) => set('customBodyColor', e.target.value)}
                    placeholder="Mặc định"
                    className="flex-1 text-sm font-mono"
                  />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Màu nhấn mạnh / Eyebrow (Accent Color)">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customAccentColor.startsWith('#') ? customAccentColor : '#b85030'}
                    onChange={(e) => set('customAccentColor', e.target.value)}
                    className="w-10 h-9 p-1 cursor-pointer shrink-0"
                  />
                  <Input
                    value={customAccentColor}
                    onChange={(e) => set('customAccentColor', e.target.value)}
                    placeholder="Mặc định"
                    className="flex-1 text-sm font-mono"
                  />
                </div>
              </Field>

              <Field label="Màu chữ chung (Fallback)">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customTextColor.startsWith('#') ? customTextColor : '#1a2320'}
                    onChange={(e) => set('customTextColor', e.target.value)}
                    className="w-10 h-9 p-1 cursor-pointer shrink-0"
                  />
                  <Input
                    value={customTextColor}
                    onChange={(e) => set('customTextColor', e.target.value)}
                    placeholder="Fallback khi không có màu riêng"
                    className="flex-1 text-sm font-mono"
                  />
                </div>
              </Field>
            </div>
            <p className="text-[11px] text-muted-foreground">Màu chữ chung (Fallback) áp dụng khi không đặt màu riêng cho từng thành phần.</p>
          </div>}
        </div>

        <Separator />

        {/* SECTION 3: SPACING */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-terra dark:text-gold-lt uppercase tracking-wider">Khoảng cách & Căn lề (Spacing)</div>

          <div className="space-y-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Đệm trong (Padding px)</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {([
                { key: 'customPaddingTop', label: 'Trên', val: customPaddingTop },
                { key: 'customPaddingBottom', label: 'Dưới', val: customPaddingBottom },
                { key: 'customPaddingLeft', label: 'Trái', val: customPaddingLeft },
                { key: 'customPaddingRight', label: 'Phải', val: customPaddingRight },
              ] as const).map(({ key, label, val }) => (
                <div key={key} className="space-y-0.5">
                  <span className="text-[9px] text-muted-foreground uppercase block">{label}</span>
                  <Input
                    type="number"
                    min={0}
                    value={val ?? ''}
                    onChange={(e) => set(key, e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="–"
                    className="h-8 text-xs px-1.5"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Lề ngoài (Margin px)</div>
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { key: 'customMarginTop', label: 'Trên', val: customMarginTop },
                { key: 'customMarginBottom', label: 'Dưới', val: customMarginBottom },
              ] as const).map(({ key, label, val }) => (
                <div key={key} className="space-y-0.5">
                  <span className="text-[9px] text-muted-foreground uppercase block">{label}</span>
                  <Input
                    type="number"
                    min={0}
                    value={val ?? ''}
                    onChange={(e) => set(key, e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder="–"
                    className="h-8 text-xs px-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </details>
  )
}
