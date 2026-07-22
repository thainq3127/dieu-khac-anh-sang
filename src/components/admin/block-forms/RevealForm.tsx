'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { C, SetFn, Field, Select, ImageUploader, getLangValue, setLangValue } from './shared'

export function RevealForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <Field label="Nội dung câu chữ (Reveal Statement)" required={activeLang === 'vi'}>
          <Textarea
            value={getLangValue(c.text, activeLang)}
            onChange={(e) => set('text', setLangValue(c.text, activeLang, e.target.value))}
            rows={4}
            placeholder="Ánh sáng không tạo ra hình khối, nó khơi dậy điều đã ngủ quên trong đá."
          />
        </Field>
      </div>
    )
  }

  if (tab === 'media') return null

  if (tab === 'ui') {
    return (
      <div className="space-y-4">
        <Field label="Section ID (Anchor)">
          <Input value={(c.id as string) ?? ''} onChange={(e) => set('id', e.target.value)} placeholder="reveal" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ảnh nền (Background Image)">
            <ImageUploader value={(c.bgImage as string) ?? ''} onChange={(url) => set('bgImage', url)} />
          </Field>
          <Field label="Độ mờ ảnh nền (Opacity)">
            <Select value={String(c.bgImageOpacity ?? '1')} onChange={(v) => set('bgImageOpacity', parseFloat(v))}
              options={[
                { value: '0.3', label: '30%' },
                { value: '0.5', label: '50%' },
                { value: '0.7', label: '70%' },
                { value: '1', label: '100% (Mặc định)' },
              ]} />
          </Field>
        </div>
      </div>
    )
  }

  return null
}
