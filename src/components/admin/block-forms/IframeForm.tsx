'use client'

import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { C, SetFn, Field, SectionTitle, Select, ImageUploader, VideoUploader, getLangValue, setLangValue } from './shared'

function convertToEmbedUrl(url: string): string {
  if (!url) return ''
  let trimmed = url.trim()

  if (trimmed.startsWith('<iframe') || trimmed.includes('iframe')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i)
    if (srcMatch) {
      trimmed = srcMatch[1]
    }
  }

  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/
  const match = trimmed.match(regExp)

  if (match && match[2].length === 11) {
    const videoId = match[2]
    return `https://www.youtube.com/embed/${videoId}`
  }

  return trimmed
}

export function IframeForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  if (tab === 'content') return null

  if (tab === 'media') {
    const currentSrc = getLangValue(c.src, activeLang)
    const isUploadedVideo = currentSrc.startsWith('uploads/') || currentSrc.startsWith('/uploads/') || currentSrc.includes('/storage/')

    return (
      <div className="space-y-4">
        <Field label="Đường dẫn Iframe (YouTube, Matterport, Google Maps...)">
          <Input
            value={currentSrc}
            onChange={(e) => set('src', setLangValue(c.src, activeLang, convertToEmbedUrl(e.target.value)))}
            placeholder="https://my.matterport.com/show/?m=... hoặc link YouTube/Google Maps"
          />
        </Field>

        <div className="relative py-2 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <span className="relative bg-background px-3 text-xs text-muted-foreground uppercase font-semibold">Hoặc</span>
        </div>

        <Field label="Tải tệp video lên máy chủ (MP4, WebM...)">
          <VideoUploader
            value={isUploadedVideo ? currentSrc : ''}
            onChange={(url) => set('src', setLangValue(c.src, activeLang, url))}
            placeholder="Bấm để chọn tệp tải video lên..."
          />
        </Field>
      </div>
    )
  }

  if (tab === 'ui') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bố cục">
            <Select
              value={(c.layout as string) ?? 'contained'}
              onChange={(v) => set('layout', v)}
              options={[
                { value: 'contained', label: 'Bao khung (Khớp size trang)' },
                { value: 'full-width', label: 'Tràn viền (Full width)' }
              ]}
            />
          </Field>
          <Field label="Chiều cao Desktop (px, vh, %...)">
            <Input
              value={c.height ? String(c.height) : ''}
              onChange={(e) => {
                const val = e.target.value.trim()
                if (!val) {
                  set('height', undefined)
                } else if (/^\d+$/.test(val)) {
                  set('height', Number(val))
                } else {
                  set('height', val)
                }
              }}
              placeholder="Mặc định: 550px, ví dụ: 100vh, 80%"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Chiều cao Mobile (px, vh, %...)">
            <Input
              value={c.mobileHeight ? String(c.mobileHeight) : ''}
              onChange={(e) => {
                const val = e.target.value.trim()
                if (!val) {
                  set('mobileHeight', undefined)
                } else if (/^\d+$/.test(val)) {
                  set('mobileHeight', Number(val))
                } else {
                  set('mobileHeight', val)
                }
              }}
              placeholder="Để trống → tỉ lệ 16:9, ví dụ: 300px"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Chiều rộng (px, vw, %...)">
            <Input
              value={c.width ? String(c.width) : ''}
              onChange={(e) => {
                const val = e.target.value.trim()
                if (!val) {
                  set('width', undefined)
                } else if (/^\d+$/.test(val)) {
                  set('width', Number(val))
                } else {
                  set('width', val)
                }
              }}
              placeholder="Mặc định: 100%, ví dụ: 800px, 80vw"
            />
          </Field>
          <Field label="Theme">
            <Select
              value={(c.theme as string) ?? 'light'}
              onChange={(v) => set('theme', v)}
              options={[
                { value: 'light', label: 'Sáng' },
                { value: 'dark', label: 'Tối' }
              ]}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Section ID (Anchor)">
            <Input
              value={(c.id as string) ?? ''}
              onChange={(e) => set('id', e.target.value)}
              placeholder="virtual-tour"
            />
          </Field>
        </div>

        <Separator />
        <SectionTitle>Ảnh nền (Chỉ áp dụng khi không tràn viền)</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ảnh nền">
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
      </div>
    )
  }

  return null
}
