'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import {
  C, SetFn, Field, SectionTitle, Select,
  getLangValue, setLangValue, getLangArray, setLangArray,
  getLangArrayValue, setLangArrayValue, addItem, removeItem, updateItem, ImageList, ImageUploader
} from './shared'

export function SplitForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  const body = (c.body ?? []) as unknown[]
  const images = (c.images ?? []) as Array<{ src: string; alt: string; caption?: string; fancyboxGroup?: string }>
  const gallery = (c.galleryBelow ?? []) as typeof images
  const tags = getLangArray(c.tags, activeLang)
  const infoCards = (c.infoCards ?? []) as Array<{ prefix?: string; title: unknown; body: unknown }>
  const miniCards = (c.miniCards ?? []) as Array<{ label: unknown; text: unknown }>
  const statsRow = (c.statsRow ?? []) as Array<{ value: string; text: unknown }>
  const ctaButtons = (c.ctaButtons ?? []) as Array<{ label: unknown; href: string; variant: string }>

  if (tab === 'media') {
    return (
      <div className="space-y-4">
        <SectionTitle>Ảnh chính {images.length > 0 && <Badge variant="outline" className="ml-1 text-xs">{images.length}</Badge>}</SectionTitle>
        <ImageList images={images} onChange={(imgs) => set('images', imgs)} fancyboxGroup={(c.id as string) ?? 'group'} activeLang={activeLang} />
        <Separator />
        <SectionTitle>Gallery bên dưới {gallery.length > 0 && <Badge variant="outline" className="ml-1 text-xs">{gallery.length}</Badge>}</SectionTitle>
        <ImageList images={gallery} onChange={(imgs) => set('galleryBelow', imgs)} fancyboxGroup={(c.id as string) ?? 'gallery'} activeLang={activeLang} />
      </div>
    )
  }

  if (tab === 'ui') {
    const elements = [
      { key: 'eyebrowStyle',     label: 'Eyebrow' },
      { key: 'titleStyle',       label: 'Tiêu đề (Title / h2)' },
      { key: 'subtitleStyle',    label: 'Subtitle' },
      { key: 'bodyStyle',        label: 'Nội dung (Body text)' },
      { key: 'blockquoteStyle',  label: 'Blockquote' },
      { key: 'ctaButtonsStyle',  label: 'Nút CTA (Buttons)' },
    ] as const

    return (
      <div className="space-y-3">
        <SectionTitle>Style từng thành phần</SectionTitle>
        <p className="text-[11px] text-muted-foreground -mt-2">Cỡ chữ chỉ áp dụng trên desktop. Mobile giữ nguyên kích thước mặc định.</p>
        {elements.map(({ key, label }) => {
          const es = (c[key] ?? {}) as Record<string, string>
          const upd = (field: string, val: string) =>
            set(key, { ...es, [field]: val || undefined })
          return (
            <div key={key} className="border border-border rounded-md p-3 space-y-2 bg-muted/10">
              <div className="text-[11px] font-bold text-terra dark:text-gold-lt uppercase tracking-wider">{label}</div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Font Family">
                  <Select value={es.fontFamily ?? ''} onChange={(v) => upd('fontFamily', v)}
                    options={[
                      { value: '', label: 'Mặc định' },
                      { value: 'sans', label: 'Sans-serif (Inter)' },
                      { value: 'serif', label: 'Serif (Brygada)' },
                      { value: 'mono', label: 'Monospace' },
                    ]} />
                </Field>
                <Field label="Font Weight">
                  <Select value={es.fontWeight ?? ''} onChange={(v) => upd('fontWeight', v)}
                    options={[
                      { value: '', label: 'Mặc định' },
                      { value: 'normal', label: 'Thường' },
                      { value: 'medium', label: 'Vừa' },
                      { value: 'semibold', label: 'Hơi đậm' },
                      { value: 'bold', label: 'Đậm' },
                    ]} />
                </Field>
                <Field label="Font Style">
                  <Select value={es.fontStyle ?? ''} onChange={(v) => upd('fontStyle', v)}
                    options={[
                      { value: '', label: 'Mặc định' },
                      { value: 'normal', label: 'Thường' },
                      { value: 'italic', label: 'Nghiêng (Italic)' },
                    ]} />
                </Field>
                <Field label="Cỡ chữ (desktop)">
                  <Select value={es.fontSize ?? ''} onChange={(v) => upd('fontSize', v)}
                    options={[
                      { value: '', label: 'Mặc định' },
                      { value: 'small', label: 'Nhỏ' },
                      { value: 'medium', label: 'Vừa' },
                      { value: 'large', label: 'Lớn' },
                      { value: 'xlarge', label: 'Rất lớn' },
                      { value: 'xxlarge', label: 'Cực lớn' },
                    ]} />
                </Field>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Cấu hình khối</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Theme">
          <Select value={(c.theme as string) ?? 'light'} onChange={(v) => set('theme', v)}
            options={[{ value: 'light', label: 'Sáng' }, { value: 'dark', label: 'Tối' }]} />
        </Field>
        <Field label="Vị trí ảnh">
          <Select value={(c.imagePosition as string) ?? 'right'} onChange={(v) => set('imagePosition', v)}
            options={[{ value: 'left', label: 'Trái' }, { value: 'right', label: 'Phải' }, { value: 'none', label: 'Không có' }]} />
        </Field>
        <Field label="Kiểu media">
          <Select value={(c.mediaType as string) ?? 'single'} onChange={(v) => set('mediaType', v)}
            options={[
              { value: 'single', label: 'Ảnh đơn' }, { value: 'grid-2x3', label: 'Lưới 2×3' },
              { value: 'grid-3-cols', label: 'Lưới 3 cột' }, { value: 'mosaic-1+2', label: 'Mosaic 1+2' },
              { value: 'mosaic-4', label: 'Mosaic 4' }, { value: 'info-cards', label: 'Info cards' },
            ]} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ảnh nền (Background Image)">
          <ImageUploader value={(c.bgImage as string) ?? ''} onChange={(url) => set('bgImage', url)} />
        </Field>
        <Field label="Độ mờ ảnh nền (Opacity)">
          <Select value={String(c.bgImageOpacity ?? '0.2')} onChange={(v) => set('bgImageOpacity', parseFloat(v))}
            options={[
              { value: '0.05', label: '5%' },
              { value: '0.1', label: '10%' },
              { value: '0.15', label: '15%' },
              { value: '0.2', label: '20% (Mặc định)' },
              { value: '0.3', label: '30%' },
              { value: '0.4', label: '40%' },
              { value: '0.5', label: '50%' },
              { value: '0.7', label: '70%' },
              { value: '1', label: '100%' }
            ]} />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Số chương">
          <Input value={(c.chapterNumber as string) ?? ''} onChange={(e) => set('chapterNumber', e.target.value)} placeholder="01" />
        </Field>
        <Field label="Eyebrow">
          <Input value={getLangValue(c.eyebrow, activeLang)} onChange={(e) => set('eyebrow', setLangValue(c.eyebrow, activeLang, e.target.value))} placeholder="LỊCH SỬ & VĂN HÓA" />
        </Field>
        <Field label="Section ID">
          <Input value={(c.id as string) ?? ''} onChange={(e) => set('id', e.target.value)} placeholder="khong-gian" />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Bố cục Mini Cards">
          <Select value={(c.miniCardsLayout as string) ?? 'grid'} onChange={(v) => set('miniCardsLayout', v)}
            options={[{ value: 'grid', label: 'Lưới (3 cột)' }, { value: 'vertical', label: 'Dọc (1 cột, căn giữa)' }]} />
        </Field>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={!!(c.parallax)} onCheckedChange={(v) => set('parallax', v)} />
          <Label className="text-xs">Parallax</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={!!(c.bodyColumns)} onCheckedChange={(v) => set('bodyColumns', v)} />
          <Label className="text-xs">2 cột văn bản</Label>
        </div>
      </div>

      <Separator />
      <SectionTitle>Nội dung văn bản</SectionTitle>
      <Field label="Tiêu đề" required={activeLang === 'vi'}>
        <Input value={getLangValue(c.title, activeLang)} onChange={(e) => set('title', setLangValue(c.title, activeLang, e.target.value))} />
      </Field>
      <Field label="Subtitle">
        <Input value={getLangValue(c.subtitle, activeLang)} onChange={(e) => set('subtitle', setLangValue(c.subtitle, activeLang, e.target.value))} />
      </Field>
      <Field label="Đoạn văn">
        <div className="space-y-2">
          {body.map((_p, i) => (
            <div key={i} className="flex gap-2">
              <Textarea
                value={getLangArrayValue(body, i, activeLang)}
                onChange={(e) => set('body', setLangArrayValue(body, i, activeLang, e.target.value))}
                rows={3}
                className="flex-1 text-sm"
              />
              <Button type="button" variant="ghost" size="icon" className="w-7 h-7 shrink-0 mt-1" onClick={() => set('body', removeItem(body, i))}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set('body', addItem(body, { vi: '' }))}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm đoạn
          </Button>
        </div>
      </Field>
      <Field label="Blockquote">
        <Textarea value={getLangValue(c.blockquote, activeLang)} onChange={(e) => set('blockquote', setLangValue(c.blockquote, activeLang, e.target.value))} rows={2} />
      </Field>
      <Field label="Tags (cách bởi dấu phẩy)">
        <Input
          value={tags.join(', ')}
          onChange={(e) => set('tags', setLangArray(c.tags, activeLang, e.target.value.split(',').map((t) => t.trim())))}
          placeholder="Nghề truyền thống, Lễ hội Katê"
        />
      </Field>

      <Separator />
      <SectionTitle>Info Cards (mediaType = info-cards) {infoCards.length > 0 && <Badge variant="outline" className="ml-1 text-xs">{infoCards.length}</Badge>}</SectionTitle>
      <div className="space-y-2">
        {infoCards.map((card, i) => (
          <div key={i} className="p-3 bg-muted/30 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Card {i + 1}</span>
              <Button type="button" variant="ghost" size="icon" className="w-6 h-6" onClick={() => set('infoCards', removeItem(infoCards, i))}>
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Input value={card.prefix ?? ''} placeholder="01" onChange={(e) => set('infoCards', updateItem(infoCards, i, 'prefix', e.target.value))} className="text-xs" />
              <Input
                value={getLangValue(card.title, activeLang)}
                placeholder="Tiêu đề"
                onChange={(e) => set('infoCards', updateItem(infoCards, i, 'title', setLangValue(card.title, activeLang, e.target.value)))}
                className="col-span-3 text-sm"
              />
            </div>
            <Textarea
              value={getLangValue(card.body, activeLang)}
              placeholder="Nội dung card"
              onChange={(e) => set('infoCards', updateItem(infoCards, i, 'body', setLangValue(card.body, activeLang, e.target.value)))}
              rows={2}
              className="text-xs"
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => set('infoCards', addItem(infoCards, { prefix: '', title: '', body: '' }))}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Thêm info card
        </Button>
      </div>

      <Separator />
      <SectionTitle>Mini Cards {miniCards.length > 0 && <Badge variant="outline" className="ml-1 text-xs">{miniCards.length}</Badge>}</SectionTitle>
      <div className="space-y-2">
        {miniCards.map((card, i) => (
          <div key={i} className="p-3 bg-muted/30 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Card {i + 1}</span>
              <Button type="button" variant="ghost" size="icon" className="w-6 h-6" onClick={() => set('miniCards', removeItem(miniCards, i))}>
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
            <Input
              value={getLangValue(card.label, activeLang)}
              placeholder="Nhãn (label)"
              onChange={(e) => set('miniCards', updateItem(miniCards, i, 'label', setLangValue(card.label, activeLang, e.target.value)))}
              className="text-sm font-medium"
            />
            <Textarea
              value={getLangValue(card.text, activeLang)}
              placeholder="Nội dung"
              onChange={(e) => set('miniCards', updateItem(miniCards, i, 'text', setLangValue(card.text, activeLang, e.target.value)))}
              rows={2}
              className="text-xs"
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => set('miniCards', addItem(miniCards, { label: '', text: '' }))}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Thêm mini card
        </Button>
      </div>

      <Separator />
      <SectionTitle>Stats Row {statsRow.length > 0 && <Badge variant="outline" className="ml-1 text-xs">{statsRow.length}</Badge>}</SectionTitle>
      <div className="space-y-2">
        {statsRow.map((stat, i) => (
          <div key={i} className="p-3 bg-muted/30 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Stat {i + 1}</span>
              <Button type="button" variant="ghost" size="icon" className="w-6 h-6" onClick={() => set('statsRow', removeItem(statsRow, i))}>
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input value={stat.value ?? ''} placeholder="VIII–XIII" onChange={(e) => set('statsRow', updateItem(statsRow, i, 'value', e.target.value))} className="text-sm font-bold" />
              <Textarea
                value={getLangValue(stat.text, activeLang)}
                placeholder="Mô tả thống kê"
                onChange={(e) => set('statsRow', updateItem(statsRow, i, 'text', setLangValue(stat.text, activeLang, e.target.value)))}
                rows={2}
                className="col-span-2 text-xs"
              />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => set('statsRow', addItem(statsRow, { value: '', text: '' }))}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Thêm stat
        </Button>
      </div>

      <Separator />
      <SectionTitle>Nút CTA {ctaButtons.length > 0 && <Badge variant="outline" className="ml-1 text-xs">{ctaButtons.length}</Badge>}</SectionTitle>
      <div className="space-y-2">
        {ctaButtons.map((btn, i) => (
          <div key={i} className="flex gap-2 items-start p-3 bg-muted/30 rounded-md">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input
                value={getLangValue(btn.label, activeLang)}
                onChange={(e) => set('ctaButtons', updateItem(ctaButtons, i, 'label', setLangValue(btn.label, activeLang, e.target.value)))}
                placeholder="Tên nút"
              />
              <Input value={btn.href} onChange={(e) => set('ctaButtons', updateItem(ctaButtons, i, 'href', e.target.value))} placeholder="https://... hoặc #anchor" />
              <Select value={btn.variant ?? 'primary'} onChange={(v) => set('ctaButtons', updateItem(ctaButtons, i, 'variant', v))}
                options={[{ value: 'primary', label: 'Primary' }, { value: 'outline', label: 'Outline' }]} />
            </div>
            <Button type="button" variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={() => set('ctaButtons', removeItem(ctaButtons, i))}>
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
        ))}
        {ctaButtons.length < 3 && (
          <Button type="button" variant="outline" size="sm" onClick={() => set('ctaButtons', addItem(ctaButtons, { label: '', href: '', variant: 'primary' }))}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm nút CTA
          </Button>
        )}
      </div>

    </div>
  )
}
