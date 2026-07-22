'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'
import {
  C, SetFn, Field, SectionTitle, Select,
  getLangValue, setLangValue, updateItem, removeItem, addItem
} from './shared'

export function HeroForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  const images = (c.images ?? []) as string[]
  const buttons = (c.buttons ?? []) as Array<{ label: string; href: string; variant: string; is3d?: boolean }>

  if (tab === 'media') {
    return (
      <div className="space-y-4">
        <SectionTitle>Ảnh slider {images.length > 0 && <Badge variant="outline" className="ml-1 text-xs">{images.length}</Badge>}</SectionTitle>
        <div className="space-y-3">
          {images.map((img, i) => (
            <div key={i} className="flex gap-2 items-center bg-muted/20 p-2 rounded-md border border-border/40">
              <div className="flex-1">
                <ImageUploader
                  value={img}
                  onChange={(url) => {
                    const newImgs = [...images]
                    newImgs[i] = url
                    set('images', newImgs)
                  }}
                  placeholder="Tải ảnh slider lên..."
                />
              </div>
              <Button type="button" variant="ghost" size="icon" className="w-8 h-8 shrink-0 hover:bg-destructive/10" onClick={() => {
                set('images', images.filter((_, idx) => idx !== i))
              }}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set('images', [...images, ''])}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm ảnh slider
          </Button>
        </div>
      </div>
    )
  }

  if (tab === 'ui') {
    const elements = [
      { key: 'titleStyle',    label: 'Tiêu đề (Title)' },
      { key: 'eyebrowStyle',  label: 'Eyebrow' },
      { key: 'subtitleStyle', label: 'Subtitle' },
      { key: 'buttonsStyle',  label: 'Nút bấm (Buttons)' },
    ] as const

    return (
      <div className="space-y-3">
        <SectionTitle>Style từng thành phần</SectionTitle>
        <p className="text-[11px] text-muted-foreground -mt-2">Cỡ chữ chỉ áp dụng trên desktop. Mobile giữ nguyên kích thước mặc định.</p>
        {elements.map(({ key, label }) => {
          const es = (c[key] ?? {}) as Record<string, string>
          const upd = (field: string, val: string) =>
            set(key, { ...es, [field]: val || undefined })
          return (
            <div key={key} className="border border-border rounded-md p-3 space-y-2 bg-muted/10">
              <div className="text-[11px] font-bold text-terra dark:text-gold-lt uppercase tracking-wider">{label}</div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Font Family">
                  <Select value={es.fontFamily ?? ''} onChange={(v) => upd('fontFamily', v)}
                    options={[
                      { value: '', label: 'Mặc định' },
                      { value: 'sans', label: 'Sans-serif (Inter)' },
                      { value: 'serif', label: 'Serif (Brygada)' },
                      { value: 'mono', label: 'Monospace' },
                    ]} />
                </Field>
                <Field label="Font Weight">
                  <Select value={es.fontWeight ?? ''} onChange={(v) => upd('fontWeight', v)}
                    options={[
                      { value: '', label: 'Mặc định' },
                      { value: 'normal', label: 'Thường' },
                      { value: 'medium', label: 'Vừa' },
                      { value: 'semibold', label: 'Hơi đậm' },
                      { value: 'bold', label: 'Đậm' },
                    ]} />
                </Field>
                <Field label="Font Style">
                  <Select value={es.fontStyle ?? ''} onChange={(v) => upd('fontStyle', v)}
                    options={[
                      { value: '', label: 'Mặc định' },
                      { value: 'normal', label: 'Thường' },
                      { value: 'italic', label: 'Nghiêng (Italic)' },
                    ]} />
                </Field>
                <Field label="Cỡ chữ (desktop)">
                  <Select value={es.fontSize ?? ''} onChange={(v) => upd('fontSize', v)}
                    options={[
                      { value: '', label: 'Mặc định' },
                      { value: 'small', label: 'Nhỏ' },
                      { value: 'medium', label: 'Vừa' },
                      { value: 'large', label: 'Lớn' },
                      { value: 'xlarge', label: 'Rất lớn' },
                      { value: 'xxlarge', label: 'Cực lớn' },
                    ]} />
                </Field>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SectionTitle>Nội dung</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tiêu đề" required={activeLang === 'vi'}>
          <Input value={getLangValue(c.title, activeLang)} onChange={(e) => set('title', setLangValue(c.title, activeLang, e.target.value))} />
        </Field>
        <Field label="Eyebrow">
          <Input value={getLangValue(c.eyebrow, activeLang)} onChange={(e) => set('eyebrow', setLangValue(c.eyebrow, activeLang, e.target.value))} placeholder="Khánh Hòa · Việt Nam · 2026" />
        </Field>
      </div>
      <Field label="Subtitle">
        <Input value={getLangValue(c.subtitle, activeLang)} onChange={(e) => set('subtitle', setLangValue(c.subtitle, activeLang, e.target.value))} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nhãn cuộn">
          <Input value={getLangValue(c.scrollLabel, activeLang)} onChange={(e) => set('scrollLabel', setLangValue(c.scrollLabel, activeLang, e.target.value))} placeholder="Cuộn xuống" />
        </Field>
        <Field label="Căn nội dung">
          <Select value={(c.contentAlign as string) ?? 'start'} onChange={(v) => set('contentAlign', v)}
            options={[{ value: 'start', label: 'Trái' }, { value: 'end', label: 'Phải' }]} />
        </Field>
      </div>

      <Separator />
      <SectionTitle>Nút bấm (tối đa 2)</SectionTitle>
      <div className="space-y-2">
        {buttons.map((btn, i) => (
          <div key={i} className="flex gap-2 items-start p-3 bg-muted/30 rounded-md">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input
                value={getLangValue(btn.label, activeLang)}
                onChange={(e) => set('buttons', updateItem(buttons, i, 'label', setLangValue(btn.label, activeLang, e.target.value)))}
                placeholder="Tên nút"
              />
              <Input value={btn.href} onChange={(e) => set('buttons', updateItem(buttons, i, 'href', e.target.value))} placeholder="https://..." />
              <Select value={btn.variant ?? 'primary'} onChange={(v) => set('buttons', updateItem(buttons, i, 'variant', v))}
                options={[{ value: 'primary', label: 'Primary' }, { value: 'outline', label: 'Outline' }]} />
              <div className="flex items-center gap-2">
                <Switch checked={!!btn.is3d} onCheckedChange={(v) => set('buttons', updateItem(buttons, i, 'is3d', v))} />
                <Label className="text-xs">Lightbox 3D</Label>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={() => set('buttons', removeItem(buttons, i))}>
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
        ))}
        {buttons.length < 2 && (
          <Button type="button" variant="outline" size="sm" onClick={() => set('buttons', addItem(buttons, { label: '', href: '', variant: 'primary' }))}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm nút
          </Button>
        )}
      </div>
    </div>
  )
}
