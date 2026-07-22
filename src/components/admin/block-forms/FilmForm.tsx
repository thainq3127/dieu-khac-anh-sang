'use client'

import { Input } from '@/components/ui/input'
import { C, SetFn, Field, Select, VideoUploader, getLangValue, setLangValue } from './shared'

export function FilmForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <Field label="Kicker">
          <Input
            value={getLangValue(c.kicker, activeLang)}
            onChange={(e) => set('kicker', setLangValue(c.kicker, activeLang, e.target.value))}
            placeholder="THƯỚC PHIM"
          />
        </Field>
        <Field label="Tiêu đề">
          <Input
            value={getLangValue(c.title, activeLang)}
            onChange={(e) => set('title', setLangValue(c.title, activeLang, e.target.value))}
            placeholder="Câu chuyện ánh sáng"
          />
        </Field>
      </div>
    )
  }

  if (tab === 'media') {
    const videoUrl = (c.videoUrl as string) ?? ''
    const isLocal = videoUrl.startsWith('uploads/') || videoUrl.startsWith('/uploads/') || videoUrl.includes('/storage/')
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tải video lên máy chủ (MP4, WebM...)">
            <VideoUploader value={isLocal ? videoUrl : ''} onChange={(url) => set('videoUrl', url)} placeholder="Bấm để tải video..." />
          </Field>
          <Field label="Hoặc dán link YouTube">
            <Input
              value={!isLocal ? videoUrl : ''}
              onChange={(e) => set('videoUrl', e.target.value.trim())}
              placeholder="https://youtube.com/watch?v=..."
              className="text-xs h-10"
            />
          </Field>
        </div>
      </div>
    )
  }

  if (tab === 'ui') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Theme">
            <Select value={(c.theme as string) ?? 'dark'} onChange={(v) => set('theme', v)}
              options={[{ value: 'light', label: 'Sáng (Light)' }, { value: 'dark', label: 'Tối (Dark)' }]} />
          </Field>
          <Field label="Section ID (Anchor)">
            <Input value={(c.id as string) ?? ''} onChange={(e) => set('id', e.target.value)} placeholder="film" />
          </Field>
        </div>
      </div>
    )
  }

  return null
}
