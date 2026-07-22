'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { C, SetFn, Field, Select, ImageUploader, getLangValue, setLangValue } from './shared'

export function ClosingForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <Field label="Kicker">
          <Input
            value={getLangValue(c.kicker, activeLang)}
            onChange={(e) => set('kicker', setLangValue(c.kicker, activeLang, e.target.value))}
            placeholder="LỜI KẾT"
          />
        </Field>
        <Field label="Câu 1" required={activeLang === 'vi'}>
          <Textarea value={getLangValue(c.q1, activeLang)} onChange={(e) => set('q1', setLangValue(c.q1, activeLang, e.target.value))} rows={2} />
        </Field>
        <Field label="Câu 2">
          <Textarea value={getLangValue(c.q2, activeLang)} onChange={(e) => set('q2', setLangValue(c.q2, activeLang, e.target.value))} rows={2} />
        </Field>
        <Field label="Chú thích 1">
          <Input value={getLangValue(c.sub1, activeLang)} onChange={(e) => set('sub1', setLangValue(c.sub1, activeLang, e.target.value))} />
        </Field>
        <Field label="Chú thích 2">
          <Input value={getLangValue(c.sub2, activeLang)} onChange={(e) => set('sub2', setLangValue(c.sub2, activeLang, e.target.value))} />
        </Field>
        <Field label="Tác giả / Ký tên">
          <Input value={getLangValue(c.author, activeLang)} onChange={(e) => set('author', setLangValue(c.author, activeLang, e.target.value))} />
        </Field>
      </div>
    )
  }

  if (tab === 'media') return null

  if (tab === 'ui') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Theme">
            <Select value={(c.theme as string) ?? 'dark'} onChange={(v) => set('theme', v)}
              options={[{ value: 'light', label: 'Sáng (Light)' }, { value: 'dark', label: 'Tối (Dark)' }]} />
          </Field>
          <Field label="Section ID (Anchor)">
            <Input value={(c.id as string) ?? ''} onChange={(e) => set('id', e.target.value)} placeholder="closing" />
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
