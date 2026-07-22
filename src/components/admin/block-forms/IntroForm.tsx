'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { C, SetFn, Field, SectionTitle, getLangValue, setLangValue } from './shared'

export function IntroForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  if (tab && tab !== 'content') return null
  return (
    <div className="space-y-4">
      <SectionTitle>Section Intro</SectionTitle>
      <Field label="Eyebrow (Tiêu đề phụ)">
        <Input value={getLangValue(c.eyebrow, activeLang)} onChange={(e) => set('eyebrow', setLangValue(c.eyebrow, activeLang, e.target.value))} placeholder="Tinh hoa di sản" />
      </Field>
      <Field label="Tiêu đề chính (Phần trích dẫn)" required={activeLang === 'vi'}>
        <Textarea value={getLangValue(c.title, activeLang)} onChange={(e) => set('title', setLangValue(c.title, activeLang, e.target.value))} rows={4} placeholder="Mỗi lễ hội, mỗi điệu múa..." />
      </Field>
    </div>
  )
}
