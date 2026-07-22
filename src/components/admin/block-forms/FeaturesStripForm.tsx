'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import {
  C, SetFn, Field, SectionTitle, Select,
  getLangValue, setLangValue, addItem, removeItem, updateItem
} from './shared'

export function FeaturesStripForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  const items = (c.items ?? []) as Array<{ iconKey: string; title: string; subtitle: string }>
  const ICON_OPTIONS = ['Landmark', 'Drama', 'Palette', 'ShieldCheck', 'MapPin', 'Music', 'Camera', 'Star', 'BookOpen', 'Globe']

  if (tab === 'ui') {
    return (
      <div className="space-y-4">
        <Field label="Theme">
          <Select value={(c.theme as string) ?? 'light'} onChange={(v) => set('theme', v)}
            options={[{ value: 'light', label: 'Sáng (Light)' }, { value: 'dark', label: 'Tối (Dark)' }]} />
        </Field>
      </div>
    )
  }

  if (tab === 'media') return null

  return (
    <div className="space-y-4">
      <SectionTitle>Các mục</SectionTitle>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="p-3 bg-muted/30 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Mục {i + 1}</span>
              <Button type="button" variant="ghost" size="icon" className="w-6 h-6" onClick={() => set('items', removeItem(items, i))}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select value={item.iconKey ?? 'Landmark'} onChange={(v) => set('items', updateItem(items, i, 'iconKey', v))}
                options={ICON_OPTIONS.map((k) => ({ value: k, label: k }))} />
              <Input
                value={getLangValue(item.title, activeLang)}
                placeholder="Tiêu đề"
                onChange={(e) => set('items', updateItem(items, i, 'title', setLangValue(item.title, activeLang, e.target.value)))}
                className="col-span-2"
              />
            </div>
            <Input
              value={getLangValue(item.subtitle, activeLang)}
              placeholder="Mô tả phụ"
              onChange={(e) => set('items', updateItem(items, i, 'subtitle', setLangValue(item.subtitle, activeLang, e.target.value)))}
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => set('items', addItem(items, { iconKey: 'Landmark', title: '', subtitle: '' }))}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Thêm mục
        </Button>
      </div>
    </div>
  )
}
