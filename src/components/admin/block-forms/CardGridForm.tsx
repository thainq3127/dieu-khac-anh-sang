'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import {
  C, SetFn, Field, SectionTitle, Select,
  getLangValue, setLangValue, addItem, removeItem, updateItem, ImageUploader
} from './shared'

export function CardGridForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  if (tab && tab !== 'content') return null
  const cards = (c.cards ?? []) as Array<{ prefix?: string; title: string; body: string }>
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Theme">
          <Select value={(c.theme as string) ?? 'light'} onChange={(v) => set('theme', v)}
            options={[{ value: 'light', label: 'Sáng' }, { value: 'dark', label: 'Tối' }]} />
        </Field>
        <Field label="Số cột">
          <Select value={String(c.columns ?? 3)} onChange={(v) => set('columns', Number(v))}
            options={[{ value: '2', label: '2 cột' }, { value: '3', label: '3 cột' }, { value: '4', label: '4 cột' }]} />
        </Field>
        <Field label="Kiểu đánh số">
          <Select value={(c.cardStyle as string) ?? 'plain'} onChange={(v) => set('cardStyle', v)}
            options={[{ value: 'plain', label: 'Không' }, { value: 'numbered-roman', label: 'La Mã (I, II...)' }, { value: 'numbered-decimal', label: 'Số (01, 02...)' }]} />
        </Field>
        <Field label="Số chương">
          <Input value={(c.chapterNumber as string) ?? ''} onChange={(e) => set('chapterNumber', e.target.value)} placeholder="06" />
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
      <Field label="Eyebrow">
        <Input value={getLangValue(c.eyebrow, activeLang)} onChange={(e) => set('eyebrow', setLangValue(c.eyebrow, activeLang, e.target.value))} />
      </Field>
      <Field label="Tiêu đề">
        <Input value={getLangValue(c.title, activeLang)} onChange={(e) => set('title', setLangValue(c.title, activeLang, e.target.value))} />
      </Field>
      <Field label="Subtitle">
        <Input value={getLangValue(c.subtitle, activeLang)} onChange={(e) => set('subtitle', setLangValue(c.subtitle, activeLang, e.target.value))} />
      </Field>
      <Field label="Văn bản phía dưới">
        <Textarea value={getLangValue(c.bodyText, activeLang)} onChange={(e) => set('bodyText', setLangValue(c.bodyText, activeLang, e.target.value))} rows={3} />
      </Field>

      <Separator />
      <SectionTitle>Các thẻ (cards)</SectionTitle>
      <div className="space-y-2">
        {cards.map((card, i) => (
          <div key={i} className="p-3 bg-muted/30 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Card {i + 1}</span>
              <Button type="button" variant="ghost" size="icon" className="w-6 h-6" onClick={() => set('cards', removeItem(cards, i))}>
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Input value={card.prefix ?? ''} placeholder="I." onChange={(e) => set('cards', updateItem(cards, i, 'prefix', e.target.value))} className="text-xs" />
              <Input
                value={getLangValue(card.title, activeLang)}
                placeholder="Tiêu đề"
                onChange={(e) => set('cards', updateItem(cards, i, 'title', setLangValue(card.title, activeLang, e.target.value)))}
                className="col-span-3 text-sm"
              />
            </div>
            <Textarea
              value={getLangValue(card.body, activeLang)}
              placeholder="Nội dung thẻ"
              onChange={(e) => set('cards', updateItem(cards, i, 'body', setLangValue(card.body, activeLang, e.target.value)))}
              rows={2}
              className="text-xs"
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => set('cards', addItem(cards, { prefix: '', title: '', body: '' }))}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Thêm thẻ
        </Button>
      </div>
    </div>
  )
}
