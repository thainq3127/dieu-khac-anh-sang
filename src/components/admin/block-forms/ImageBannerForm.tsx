'use client'

import { Input } from '@/components/ui/input'
import { C, SetFn, Field, Select, getLangValue, setLangValue, ImageUploader } from './shared'

export function ImageBannerForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <Field label="Chú thích (Caption - Tùy chọn)">
          <Input
            value={getLangValue(c.caption, activeLang)}
            onChange={(e) => set('caption', setLangValue(c.caption, activeLang, e.target.value))}
            placeholder="Quần thể tháp nhìn từ trên cao"
          />
        </Field>
      </div>
    )
  }

  if (tab === 'media') {
    return (
      <div className="space-y-4">
        <Field label="Tải ảnh lên (Banner)" required>
          <ImageUploader value={(c.src as string) ?? ''} onChange={(url) => set('src', url)} />
        </Field>
        <Field label="Alt Text (Mô tả ảnh)">
          <Input
            value={getLangValue(c.alt, activeLang)}
            onChange={(e) => set('alt', setLangValue(c.alt, activeLang, e.target.value))}
            placeholder="Banner phong cảnh..."
          />
        </Field>
      </div>
    )
  }

  if (tab === 'ui') {
    const layout = (c.layout as string) ?? 'full'
    const height = (c.height as string) ?? 'auto'
    const isCustomHeight = !['auto', 'short', 'medium', 'tall', 'full'].includes(height)

    return (
      <div className="space-y-4">
        <Field label="Bố cục (Layout)">
          <Select
            value={layout}
            onChange={(v) => set('layout', v)}
            options={[
              { value: 'full', label: 'Toàn chiều rộng' },
              { value: 'shell', label: 'Trong container' },
              { value: 'narrow', label: 'Hẹp (Narrow)' },
            ]}
          />
        </Field>

        <Field label="Chiều cao (Height)">
          <Select
            value={isCustomHeight ? 'custom' : height}
            onChange={(v) => {
              if (v === 'custom') set('height', '400px')
              else set('height', v)
            }}
            options={[
              { value: 'auto', label: 'Tự động (theo tỉ lệ ảnh)' },
              { value: 'short', label: 'Thấp (~300px)' },
              { value: 'medium', label: 'Vừa (~480px)' },
              { value: 'tall', label: 'Cao (~640px)' },
              { value: 'full', label: 'Toàn màn hình' },
              { value: 'custom', label: 'Tuỳ chỉnh...' },
            ]}
          />
          {isCustomHeight && (
            <Input
              className="mt-2"
              value={height}
              onChange={(e) => set('height', e.target.value)}
              placeholder="400px, 50vh, ..."
            />
          )}
        </Field>

        <Field label="Vị trí ảnh (Object Position)">
          <Input
            value={(c.objectPosition as string) ?? ''}
            onChange={(e) => set('objectPosition', e.target.value || undefined)}
            placeholder="center, top, 50% 20%, ..."
          />
        </Field>

        <Field label="Section ID (Anchor)">
          <Input
            value={(c.id as string) ?? ''}
            onChange={(e) => set('id', e.target.value)}
            placeholder="banner-di-san"
          />
        </Field>
      </div>
    )
  }

  return null
}
