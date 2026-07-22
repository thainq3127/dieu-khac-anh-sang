'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import {
  C, SetFn, Field, SectionTitle, Select, ImageUploader,
  getLangValue, setLangValue, getLangArray, setLangArray, addItem, removeItem, updateItem,
} from './shared'

function updateImageAt(images: string[], i: number, url: string): string[] {
  return images.map((img, idx) => (idx === i ? url : img))
}

export function CatalogForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  const images = (c.images ?? []) as string[]
  const columns = (c.columns ?? []) as Array<{ heading: unknown; items: unknown }>

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Số thứ tự (VD: 01)">
            <Input value={(c.number as string) ?? ''} onChange={(e) => set('number', e.target.value)} placeholder="01" />
          </Field>
          <Field label="Giá (hiển thị, có thể để trống)">
            <Input value={getLangValue(c.price, activeLang)} onChange={(e) => set('price', setLangValue(c.price, activeLang, e.target.value))} placeholder="Liên hệ" />
          </Field>
        </div>
        <Field label="Tiêu đề" required={activeLang === 'vi'}>
          <Input
            value={getLangValue(c.title, activeLang)}
            onChange={(e) => set('title', setLangValue(c.title, activeLang, e.target.value))}
            placeholder="Diệu Liên - Tâm Ảnh"
          />
        </Field>
        <Field label="Phụ đề">
          <Input value={getLangValue(c.subtitle, activeLang)} onChange={(e) => set('subtitle', setLangValue(c.subtitle, activeLang, e.target.value))} />
        </Field>
        <Field label="Mô tả chi tiết">
          <Textarea value={getLangValue(c.body, activeLang)} onChange={(e) => set('body', setLangValue(c.body, activeLang, e.target.value))} rows={4} />
        </Field>

        <SectionTitle>Cột thông tin (chất liệu, kỹ thuật...)</SectionTitle>
        <div className="space-y-3">
          {columns.map((col, i) => {
            const items = getLangArray(col.items, activeLang)
            return (
              <div key={i} className="p-3.5 border border-border bg-muted/10 rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Cột {i + 1}</span>
                  <Button type="button" variant="ghost" size="icon" className="w-6 h-6 hover:bg-destructive/10 text-destructive" onClick={() => set('columns', removeItem(columns, i))}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Input
                  value={getLangValue(col.heading, activeLang)}
                  placeholder="Tiêu đề cột (VD: Chất liệu)"
                  onChange={(e) => set('columns', updateItem(columns, i, 'heading', setLangValue(col.heading, activeLang, e.target.value)))}
                  className="text-sm"
                />
                <Textarea
                  value={items.join('\n')}
                  placeholder={'Mỗi dòng là 1 mục\nVD: Đồng nguyên khối\nCao 90cm'}
                  onChange={(e) => set('columns', updateItem(columns, i, 'items', setLangArray(col.items, activeLang, e.target.value.split('\n'))))}
                  rows={3}
                  className="text-xs"
                />
              </div>
            )
          })}
          <Button type="button" variant="outline" size="sm" onClick={() => set('columns', addItem(columns, { heading: '', items: [] }))} className="border-dashed hover:border-amber-500/50 hover:text-amber-500">
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm cột
          </Button>
        </div>
      </div>
    )
  }

  if (tab === 'media') {
    return (
      <div className="space-y-4">
        <SectionTitle>Hình ảnh (tối đa 4 ảnh)</SectionTitle>
        <div className="space-y-3">
          {images.map((src, i) => (
            <div key={i} className="p-3 bg-muted/30 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Ảnh {i + 1}</span>
                <Button type="button" variant="ghost" size="icon" className="w-6 h-6" onClick={() => set('images', images.filter((_, idx) => idx !== i))}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
              <ImageUploader value={src} onChange={(url) => set('images', updateImageAt(images, i, url))} placeholder="Tải hình ảnh lên..." />
            </div>
          ))}
          {images.length < 4 && (
            <Button type="button" variant="outline" size="sm" onClick={() => set('images', [...images, ''])}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Thêm ảnh
            </Button>
          )}
        </div>
        <Field label="Chú thích ảnh">
          <Input value={getLangValue(c.imageCaption, activeLang)} onChange={(e) => set('imageCaption', setLangValue(c.imageCaption, activeLang, e.target.value))} />
        </Field>
      </div>
    )
  }

  if (tab === 'ui') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Theme">
            <Select value={(c.theme as string) ?? 'light'} onChange={(v) => set('theme', v)}
              options={[{ value: 'light', label: 'Sáng (Light)' }, { value: 'dark', label: 'Tối (Dark)' }]} />
          </Field>
          <Field label="Section ID (Anchor)">
            <Input value={(c.id as string) ?? ''} onChange={(e) => set('id', e.target.value)} placeholder="catalog-1" />
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
                { value: '0.2', label: '20% (Mặc định)' },
                { value: '0.3', label: '30%' },
                { value: '0.5', label: '50%' },
              ]} />
          </Field>
        </div>
      </div>
    )
  }

  return null
}
