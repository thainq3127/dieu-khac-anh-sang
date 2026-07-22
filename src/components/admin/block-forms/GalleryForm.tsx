'use client'

import { Input } from '@/components/ui/input'
import {
  C, SetFn, Field, Select, ImageList, ImageUploader,
  getLangValue, setLangValue,
} from './shared'

export function GalleryForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  const images = (c.images ?? []) as Array<{ src: string; alt: string; caption?: string }>

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <Field label="Kicker (nhãn nhỏ phía trên)">
          <Input
            value={getLangValue(c.kicker, activeLang)}
            onChange={(e) => set('kicker', setLangValue(c.kicker, activeLang, e.target.value))}
            placeholder="BỘ SƯU TẬP"
          />
        </Field>
      </div>
    )
  }

  if (tab === 'media') {
    return (
      <div className="space-y-4">
        <ImageList
          images={images}
          onChange={(imgs) => set('images', imgs)}
          fancyboxGroup="gallery"
          activeLang={activeLang}
        />
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
            <Input value={(c.id as string) ?? ''} onChange={(e) => set('id', e.target.value)} placeholder="gallery" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ảnh nền (tuỳ chọn)">
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
