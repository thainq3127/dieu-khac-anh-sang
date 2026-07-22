'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import {
  C, SetFn, Field, SectionTitle, Select, ImageUploader,
  getLangValue, setLangValue, addItem, removeItem, updateItem,
} from './shared'

export function OfferForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  const contacts = (c.contacts ?? []) as Array<{ name: string; phone: string }>

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <Field label="Tiêu đề chính (Headline)" required={activeLang === 'vi'}>
          <Input
            value={getLangValue(c.headline, activeLang)}
            onChange={(e) => set('headline', setLangValue(c.headline, activeLang, e.target.value))}
            placeholder="Sở hữu tác phẩm"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Giá (chỉ số)" required>
            <Input
              value={(c.price as string) ?? ''}
              onChange={(e) => set('price', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="250000000"
            />
          </Field>
          <Field label="Đơn vị tiền tệ">
            <Input value={(c.currency as string) ?? 'VNĐ'} onChange={(e) => set('currency', e.target.value)} placeholder="VNĐ" />
          </Field>
        </div>
        <Field label="Ghi chú">
          <Input
            value={getLangValue(c.note, activeLang)}
            onChange={(e) => set('note', setLangValue(c.note, activeLang, e.target.value))}
            placeholder="Đã bao gồm vận chuyển & lắp đặt"
          />
        </Field>
        <Field label="Gợi ý nhỏ (Hint)">
          <Input
            value={getLangValue(c.hint, activeLang)}
            onChange={(e) => set('hint', setLangValue(c.hint, activeLang, e.target.value))}
            placeholder="Số lượng có hạn"
          />
        </Field>

        <SectionTitle>Liên hệ đặt hàng</SectionTitle>
        <div className="space-y-3">
          {contacts.map((contact, i) => (
            <div key={i} className="p-3.5 border border-border bg-muted/10 rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Liên hệ {i + 1}</span>
                <Button type="button" variant="ghost" size="icon" className="w-6 h-6 hover:bg-destructive/10 text-destructive" onClick={() => set('contacts', removeItem(contacts, i))}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input value={contact.name} placeholder="Tên liên hệ" onChange={(e) => set('contacts', updateItem(contacts, i, 'name', e.target.value))} className="text-sm" />
                <Input value={contact.phone} placeholder="Số điện thoại" onChange={(e) => set('contacts', updateItem(contacts, i, 'phone', e.target.value))} className="text-sm" />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set('contacts', addItem(contacts, { name: '', phone: '' }))} className="border-dashed hover:border-amber-500/50 hover:text-amber-500">
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm liên hệ
          </Button>
        </div>
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
            <Input value={(c.id as string) ?? ''} onChange={(e) => set('id', e.target.value)} placeholder="offer" />
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
