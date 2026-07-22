'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import {
  C, SetFn, Field, SectionTitle, Select,
  getLangValue, setLangValue, getLangArrayValue, setLangArrayValue,
  getLangArray, setLangArray, addItem, removeItem, updateItem, ImageUploader
} from './shared'

export function SplitCardsForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  if (tab && tab !== 'content') return null
  const body = (c.body ?? []) as unknown[]
  const tags = getLangArray(c.tags, activeLang)
  const infoCards = (c.infoCards ?? []) as Array<{ prefix?: string; title: unknown; body: unknown }>
  const ctaButtons = (c.ctaButtons ?? []) as Array<{ label: unknown; href: string; variant: string }>

  return (
    <div className="space-y-4">
      <SectionTitle>Cấu hình khối (Split Cards)</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Theme">
          <Select value={(c.theme as string) ?? 'light'} onChange={(v) => set('theme', v)}
            options={[{ value: 'light', label: 'Sáng' }, { value: 'dark', label: 'Tối' }]} />
        </Field>
        <Field label="Vị trí cột thẻ">
          <Select value={(c.imagePosition as string) ?? 'right'} onChange={(v) => set('imagePosition', v)}
            options={[
              { value: 'left', label: 'Trái' },
              { value: 'right', label: 'Phải' },
              { value: 'top', label: 'Trên' },
              { value: 'bottom', label: 'Dưới' }
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

      <Field label="Tiêu đề (Title)">
        <Input value={getLangValue(c.title, activeLang)} onChange={(e) => set('title', setLangValue(c.title, activeLang, e.target.value))} placeholder="Từ người trị thủy..." />
      </Field>

      <Field label="Tiêu đề phụ (Subtitle)">
        <Input value={getLangValue(c.subtitle, activeLang)} onChange={(e) => set('subtitle', setLangValue(c.subtitle, activeLang, e.target.value))} placeholder="Khi ký ức cộng đồng..." />
      </Field>

      <Field label="Đoạn văn mô tả (Body Paragraphs)">
        <div className="space-y-2">
          {body.map((_p, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Textarea
                value={getLangArrayValue(body, i, activeLang)}
                onChange={(e) => set('body', setLangArrayValue(body, i, activeLang, e.target.value))}
                rows={3}
              />
              <Button type="button" variant="ghost" size="icon" className="w-7 h-7 shrink-0 mt-1" onClick={() => set('body', removeItem(body, i))}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set('body', addItem(body, { vi: '' }))}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm đoạn văn
          </Button>
        </div>
      </Field>

      <Field label="Trích dẫn (Blockquote)">
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
      <SectionTitle>Info Cards {infoCards.length > 0 && <Badge variant="outline" className="ml-1 text-xs">{infoCards.length}</Badge>}</SectionTitle>
      <div className="space-y-2">
        {infoCards.map((card, i) => (
          <div key={i} className="p-3 bg-muted/30 rounded-md space-y-2 relative">
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
        <Button type="button" variant="outline" size="sm" onClick={() => set('infoCards', addItem(infoCards, { prefix: '', title: { vi: '' }, body: { vi: '' } }))}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Thêm info card
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
