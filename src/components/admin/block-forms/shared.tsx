'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'
import VideoUploader from '@/components/admin/VideoUploader'
export { ImageUploader, VideoUploader }

export type C = Record<string, unknown>
export type SetFn = (key: string, value: unknown) => void

// ── Language helpers ──────────────────────────────────────────────────────────

export function getLangValue(field: unknown, lang: string): string {
  if (!field) return ''
  if (typeof field === 'object' && field !== null) {
    const obj = field as Record<string, unknown>
    return (obj[lang] as string) ?? (obj['vi'] as string) ?? ''
  }
  if (lang === 'vi') return String(field)
  return ''
}

export function setLangValue(field: unknown, lang: string, value: string): Record<string, string> {
  const currentObj = (typeof field === 'object' && field !== null && !Array.isArray(field))
    ? (field as Record<string, string>)
    : {}
  
  const viVal = currentObj.vi ?? (typeof field === 'string' ? field : '')
  
  return {
    ...currentObj,
    vi: viVal,
    [lang]: value
  }
}

export function getLangArrayValue(arr: unknown[], index: number, lang: string): string {
  if (!arr || index >= arr.length) return ''
  return getLangValue(arr[index], lang)
}

export function setLangArrayValue(arr: unknown[], index: number, lang: string, value: string): unknown[] {
  const newArr = [...arr]
  newArr[index] = setLangValue(newArr[index], lang, value)
  return newArr
}

export function getLangArray(field: unknown, lang: string): string[] {
  if (!field) return []
  if (typeof field === 'object' && field !== null && !Array.isArray(field)) {
    if ('vi' in field || 'en' in field || 'ru' in field || 'zh' in field) {
      const obj = field as Record<string, unknown>
      return (obj[lang] as string[]) ?? (obj['vi'] as string[]) ?? []
    }
  }
  if (Array.isArray(field)) {
    return field.map((item) => {
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>
        return (obj[lang] as string) ?? (obj['vi'] as string) ?? ''
      }
      return String(item)
    })
  }
  return []
}

export function setLangArray(field: unknown, lang: string, value: string[]): unknown {
  if (field && typeof field === 'object' && !Array.isArray(field)) {
    const currentObj = field as Record<string, string[]>
    const viVal = currentObj.vi ?? []
    return {
      ...currentObj,
      vi: viVal,
      [lang]: value
    }
  }

  const existingArray = Array.isArray(field) ? field : []
  return value.map((str, index) => {
    const existingItem = existingArray[index]
    const currentObj = (existingItem && typeof existingItem === 'object')
      ? (existingItem as Record<string, string>)
      : {}
    const viVal = currentObj.vi ?? (typeof existingItem === 'string' ? existingItem : '')
    return {
      ...currentObj,
      vi: viVal || str,
      [lang]: str
    }
  })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-1">{children}</p>
}

export function Select({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-background text-foreground border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ── Array utilities ───────────────────────────────────────────────────────────

export function addItem<T>(arr: T[], item: T): T[] { return [...arr, item] }
export function removeItem<T>(arr: T[], i: number): T[] { return arr.filter((_, idx) => idx !== i) }
export function updateItem<T extends object>(arr: T[], i: number, key: string, value: unknown): T[] {
  return arr.map((item, idx) => idx === i ? { ...item, [key]: value } : item)
}

// ── ImageList component ───────────────────────────────────────────────────────

export function ImageList({ images, onChange, fancyboxGroup, activeLang }: {
  images: Array<{ src: string; alt: string; caption?: string; fancyboxGroup?: string }>
  onChange: (imgs: typeof images) => void
  fancyboxGroup: string
  activeLang: string
}) {
  return (
    <div className="space-y-2">
      {images.map((img, i) => (
        <div key={i} className="p-3 bg-muted/30 rounded-md space-y-2">
          <div className="flex items-center gap-1 mb-1">
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Ảnh {i + 1}</span>
            <Button type="button" variant="ghost" size="icon" className="w-6 h-6 ml-auto" onClick={() => onChange(removeItem(images, i))}>
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
          <ImageUploader
            value={img.src}
            onChange={(url) => onChange(updateItem(images, i, 'src', url))}
            placeholder="Tải hình ảnh lên..."
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={getLangValue(img.alt, activeLang)}
              placeholder="Alt text"
              onChange={(e) => onChange(updateItem(images, i, 'alt', setLangValue(img.alt, activeLang, e.target.value)))}
              className="text-xs"
            />
            <Input
              value={getLangValue(img.caption, activeLang)}
              placeholder="Caption (tuỳ chọn)"
              onChange={(e) => onChange(updateItem(images, i, 'caption', setLangValue(img.caption, activeLang, e.target.value)))}
              className="text-xs"
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange(addItem(images, { src: '', alt: '', caption: '', fancyboxGroup }))}>
        <Plus className="w-3.5 h-3.5 mr-1" /> Thêm ảnh
      </Button>
    </div>
  )
}
