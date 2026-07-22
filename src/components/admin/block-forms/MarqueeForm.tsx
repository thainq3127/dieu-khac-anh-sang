'use client'

import { Textarea } from '@/components/ui/textarea'
import { C, SetFn, Field, Select, getLangArray, setLangArray } from './shared'

export function MarqueeForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  if (tab && tab !== 'content') return null
  const items = getLangArray(c.items, activeLang)
  return (
    <div className="space-y-4">
      <Field label="Theme">
        <Select value={(c.theme as string) ?? 'gold'} onChange={(v) => set('theme', v)}
          options={[{ value: 'gold', label: 'Vàng (gold)' }, { value: 'dark', label: 'Tối (dark)' }, { value: 'footer', label: 'Footer' }]} />
      </Field>
      <Field label="Các mục (mỗi dòng 1 mục)">
        <Textarea
          value={items.join('\n')}
          onChange={(e) => set('items', setLangArray(c.items, activeLang, e.target.value.split('\n')))}
          rows={6}
          placeholder="Văn hóa Chăm · Khánh Hòa 2026&#10;Di sản sống · Lễ hội Katê"
        />
      </Field>
    </div>
  )
}
