'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import {
  C, SetFn, Field, SectionTitle, Select, ImageUploader,
  getLangValue, setLangValue, addItem, removeItem, updateItem,
} from './shared'

export function SizeForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  const dimensions = (c.dimensions ?? []) as Array<{ label: unknown; value: string }>
  const specs = (c.specs ?? []) as Array<{ label: unknown; value: unknown }>

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <Field label="Kicker">
          <Input
            value={getLangValue(c.kicker, activeLang)}
            onChange={(e) => set('kicker', setLangValue(c.kicker, activeLang, e.target.value))}
            placeholder="KÍCH THƯỚC"
          />
        </Field>
        <Field label="Tên tác phẩm">
          <Input value={getLangValue(c.label, activeLang)} onChange={(e) => set('label', setLangValue(c.label, activeLang, e.target.value))} />
        </Field>

        <SectionTitle>Kích thước (cao / rộng / dài...)</SectionTitle>
        <div className="space-y-2">
          {dimensions.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={getLangValue(d.label, activeLang)}
                placeholder="Nhãn (VD: Cao)"
                onChange={(e) => set('dimensions', updateItem(dimensions, i, 'label', setLangValue(d.label, activeLang, e.target.value)))}
                className="text-sm"
              />
              <Input
                value={d.value}
                placeholder="Giá trị (VD: 90cm)"
                onChange={(e) => set('dimensions', updateItem(dimensions, i, 'value', e.target.value))}
                className="text-sm"
              />
              <Button type="button" variant="ghost" size="icon" className="w-8 h-8 shrink-0 hover:bg-destructive/10 text-destructive" onClick={() => set('dimensions', removeItem(dimensions, i))}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set('dimensions', addItem(dimensions, { label: '', value: '' }))} className="border-dashed hover:border-amber-500/50 hover:text-amber-500">
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm kích thước
          </Button>
        </div>

        <SectionTitle>Thông số kỹ thuật</SectionTitle>
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={getLangValue(s.label, activeLang)}
                placeholder="Nhãn (VD: Chất liệu)"
                onChange={(e) => set('specs', updateItem(specs, i, 'label', setLangValue(s.label, activeLang, e.target.value)))}
                className="text-sm"
              />
              <Input
                value={getLangValue(s.value, activeLang)}
                placeholder="Giá trị (VD: Đồng nguyên khối)"
                onChange={(e) => set('specs', updateItem(specs, i, 'value', setLangValue(s.value, activeLang, e.target.value)))}
                className="text-sm"
              />
              <Button type="button" variant="ghost" size="icon" className="w-8 h-8 shrink-0 hover:bg-destructive/10 text-destructive" onClick={() => set('specs', removeItem(specs, i))}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set('specs', addItem(specs, { label: '', value: '' }))} className="border-dashed hover:border-amber-500/50 hover:text-amber-500">
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm thông số
          </Button>
        </div>
      </div>
    )
  }

  if (tab === 'media') {
    return (
      <div className="space-y-4">
        <Field label="Ảnh sản phẩm">
          <ImageUploader value={(c.imageUrl as string) ?? ''} onChange={(url) => set('imageUrl', url)} />
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
            <Input value={(c.id as string) ?? ''} onChange={(e) => set('id', e.target.value)} placeholder="size" />
          </Field>
        </div>
      </div>
    )
  }

  return null
}
