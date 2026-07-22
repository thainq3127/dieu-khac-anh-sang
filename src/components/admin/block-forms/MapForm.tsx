'use client'

import { useEffect, useState } from 'react'
import { getPublicMapData } from '@/lib/public-actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { C, SetFn, Field, getLangValue, setLangValue } from './shared'

export function MapForm({ c, set, activeLang, tab }: { c: C; set: SetFn; activeLang: string; tab?: 'content' | 'media' | 'ui' }) {
  const [locations, setLocations] = useState<Array<{ id: string | number; name: string }>>([])

  useEffect(() => {
    async function load() {
      const data = await getPublicMapData()

      if (data && data.length > 0) {
        const mapped = data.map((loc: { id: string | number; name: unknown }) => {
          const nameObj = typeof loc.name === 'object' && loc.name !== null ? (loc.name as Record<string, string>) : {}
          const name = nameObj[activeLang] || nameObj['vi'] || ''
          return { id: loc.id, name }
        })
        setLocations(mapped)
      } else {
        // Fallback locations mapped to localized name
        const fallbackMapped = [
          { id: 1, name: activeLang === 'vi' ? 'Tháp Bà Ponagar' : 'Po Nagar Temple' },
          { id: 2, name: activeLang === 'vi' ? 'Tháp Chàm Phan Rang (Po Klong Garai)' : 'Po Klong Garai Temple' },
          { id: 3, name: activeLang === 'vi' ? 'Di tích Tháp Chăm Hòa Lai' : 'Hoa Lai Towers' },
          { id: 4, name: activeLang === 'vi' ? 'Tháp Po Ro Me' : 'Po Rome Temple' },
          { id: 5, name: activeLang === 'vi' ? 'Trung Tâm Nghiên Cứu Văn Hóa Chăm - Phan Rang' : 'Cham Cultural Research Center' },
          { id: 6, name: activeLang === 'vi' ? 'Bảo Tàng Khánh Hòa' : 'Khanh Hoa Museum' },
          { id: 7, name: activeLang === 'vi' ? 'Bảo Tàng Ninh Thuận' : 'Ninh Thuan Museum' },
        ]
        setLocations(fallbackMapped)
      }
    }
    load()
  }, [activeLang])

  if (tab === 'ui') return null

  if (tab === 'media') {
    return (
      <div className="space-y-4">
        <Field label="Hiển thị địa điểm">
          <select
            value={Array.isArray(c.locationIds) ? 'custom' : 'all'}
            onChange={(e) => {
              const val = e.target.value
              if (val === 'all') {
                set('locationIds', null) // Clear locationIds to show all
              } else {
                set('locationIds', []) // Initialize as empty array
              }
            }}
            className="w-full bg-background text-foreground border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Tất cả địa điểm (Hiển thị danh sách như trang chủ)</option>
            <option value="custom">Chọn địa điểm cụ thể</option>
          </select>
        </Field>

        {Array.isArray(c.locationIds) && (
          <div className="space-y-2 border border-input rounded-md p-3 max-h-60 overflow-y-auto bg-muted/20">
            <p className="text-xs text-muted-foreground mb-2">Chọn các địa điểm muốn hiển thị (Nếu chọn 1 điểm sẽ tự động hiển thị dạng chi tiết):</p>
            {locations.map((loc) => {
              const checked = (c.locationIds as Array<string | number> || []).map(String).includes(String(loc.id))
              return (
                <label key={loc.id} className="flex items-center gap-2.5 text-sm cursor-pointer py-1.5 hover:bg-muted/40 rounded px-1.5 transition-colors">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const currentIds = (c.locationIds as Array<string | number> || [])
                      let newIds: Array<string | number>
                      if (e.target.checked) {
                        newIds = [...currentIds, loc.id]
                      } else {
                        newIds = currentIds.filter((id) => String(id) !== String(loc.id))
                      }
                      set('locationIds', newIds)
                    }}
                    className="rounded border-input text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="select-none">{loc.name}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Default / content tab
  return (
    <div className="space-y-4">
      <Field label="Tiêu đề phụ (Subtitle)">
        <Input
          value={getLangValue(c.subtitle, activeLang)}
          onChange={(e) => set('subtitle', setLangValue(c.subtitle, activeLang, e.target.value))}
          placeholder="BẢN ĐỒ DI SẢN"
        />
      </Field>

      <Field label="Tiêu đề chính (Title)" required={activeLang === 'vi'}>
        <Input
          value={getLangValue(c.title, activeLang)}
          onChange={(e) => set('title', setLangValue(c.title, activeLang, e.target.value))}
          placeholder="Hành trình Văn hóa Chăm"
        />
      </Field>

      <Field label="Mô tả (Description)">
        <Textarea
          value={getLangValue(c.description, activeLang)}
          onChange={(e) => set('description', setLangValue(c.description, activeLang, e.target.value))}
          placeholder="Khám phá vị trí địa lý..."
          rows={4}
        />
      </Field>
    </div>
  )
}
