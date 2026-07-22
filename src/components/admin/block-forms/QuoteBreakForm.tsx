'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { C, SetFn, Field, Select, getLangValue, setLangValue, ImageUploader } from './shared'

export function QuoteBreakForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  if (tab && tab !== 'content') return null
  return (
    <div className="space-y-4">
      <Field label="Theme">
        <Select value={(c.theme as string) ?? 'terra'} onChange={(v) => set('theme', v)}
          options={[{ value: 'terra', label: 'Terra (đỏ nâu)' }, { value: 'forest', label: 'Forest (xanh)' }]} />
      </Field>
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
      <Field label="Eyebrow (tuỳ chọn)">
        <Input value={getLangValue(c.eyebrow, activeLang)} onChange={(e) => set('eyebrow', setLangValue(c.eyebrow, activeLang, e.target.value))} placeholder="Lời trích dẫn" />
      </Field>
      <Field label="Trích dẫn" required={activeLang === 'vi'}>
        <Textarea value={getLangValue(c.quote, activeLang)} onChange={(e) => set('quote', setLangValue(c.quote, activeLang, e.target.value))} rows={4} placeholder="Di sản Chăm chỉ thật sự sống..." />
      </Field>
    </div>
  )
}
