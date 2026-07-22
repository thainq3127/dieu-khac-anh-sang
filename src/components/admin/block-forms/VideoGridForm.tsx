'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import {
  C, SetFn, Field, SectionTitle, Select,
  getLangValue, setLangValue, addItem, removeItem, updateItem, ImageUploader, VideoUploader
} from './shared'

export function VideoGridForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  const videos = (c.videos ?? []) as Array<{ id: string; tag?: string; title: string; desc: string; thumbnail?: string }>

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <Field label="Eyebrow">
          <Input value={getLangValue(c.eyebrow, activeLang)} onChange={(e) => set('eyebrow', setLangValue(c.eyebrow, activeLang, e.target.value))} placeholder="THƯ VIỆN VIDEO" />
        </Field>
        <Field label="Tiêu đề" required={activeLang === 'vi'}>
          <Input value={getLangValue(c.title, activeLang)} onChange={(e) => set('title', setLangValue(c.title, activeLang, e.target.value))} placeholder="Thư viện Video" />
        </Field>
        <Field label="Subtitle">
          <Input value={getLangValue(c.subtitle, activeLang)} onChange={(e) => set('subtitle', setLangValue(c.subtitle, activeLang, e.target.value))} />
        </Field>
      </div>
    )
  }

  if (tab === 'media') {
    return (
      <div className="space-y-4">
        <SectionTitle>Danh sách video</SectionTitle>
        <div className="space-y-3">
          {videos.map((v, i) => {
            const isLocalVideo = typeof v.id === 'string' && (v.id.startsWith('uploads/') || v.id.startsWith('/uploads/') || v.id.includes('/storage/'));
            return (
              <div key={i} className="p-3.5 border border-border bg-muted/10 rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Video {i + 1}</span>
                  <Button type="button" variant="ghost" size="icon" className="w-6 h-6 hover:bg-destructive/10 text-destructive" onClick={() => set('videos', removeItem(videos, i))}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Tải tệp video lên máy chủ (MP4, WebM...)">
                    <VideoUploader
                      value={isLocalVideo ? v.id : ''}
                      onChange={(url) => set('videos', updateItem(videos, i, 'id', url))}
                      placeholder="Bấm để tải video..."
                    />
                  </Field>
                  <Field label="Hoặc YouTube Video ID">
                    <Input
                      value={!isLocalVideo ? v.id : ''}
                      placeholder="Ví dụ: dQw4w9WgXcQ"
                      onChange={(e) => set('videos', updateItem(videos, i, 'id', e.target.value.trim()))}
                      className="text-xs h-10"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Tag hiển thị (Ví dụ: YouTube, Video...)">
                    <Input
                      value={getLangValue(v.tag, activeLang)}
                      placeholder="Ví dụ: YouTube"
                      onChange={(e) => set('videos', updateItem(videos, i, 'tag', setLangValue(v.tag, activeLang, e.target.value)))}
                      className="text-xs"
                    />
                  </Field>
                  <Field label="Ảnh đại diện Video (Thumbnail)">
                    <ImageUploader
                      value={v.thumbnail ?? ''}
                      onChange={(url) => set('videos', updateItem(videos, i, 'thumbnail', url))}
                      placeholder="Bấm để chọn ảnh đại diện..."
                    />
                  </Field>
                </div>

                <Field label="Tiêu đề video" required={activeLang === 'vi'}>
                  <Input
                    value={getLangValue(v.title, activeLang)}
                    placeholder="Tiêu đề video"
                    onChange={(e) => set('videos', updateItem(videos, i, 'title', setLangValue(v.title, activeLang, e.target.value)))}
                    className="text-sm"
                  />
                </Field>

                <Field label="Mô tả ngắn">
                  <Textarea
                    value={getLangValue(v.desc, activeLang)}
                    placeholder="Mô tả ngắn về video..."
                    onChange={(e) => set('videos', updateItem(videos, i, 'desc', setLangValue(v.desc, activeLang, e.target.value)))}
                    rows={2}
                    className="text-xs"
                  />
                </Field>
              </div>
            )
          })}
          <Button type="button" variant="outline" size="sm" onClick={() => set('videos', addItem(videos, { id: '', tag: 'YouTube', title: '', desc: '', thumbnail: '' }))} className="border-dashed hover:border-amber-500/50 hover:text-amber-500">
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm video mới
          </Button>
        </div>
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
          <Field label="Số cột hiển thị (Columns)">
            <Select value={String(c.columns ?? 2)} onChange={(v) => set('columns', Number(v))}
              options={[{ value: '2', label: '2 cột' }, { value: '3', label: '3 cột' }]} />
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
