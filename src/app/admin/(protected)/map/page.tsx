'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { MapPin, Plus, Pencil, Trash2, Loader2, AlertCircle, Wand2 } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { translateText } from '@/lib/auto-translate'
import { createLocationCategory, createMapLocation, deleteMapLocation, getAdminMapData, getLocationCategories, updateMapLocation } from '@/lib/admin-actions'

type MapLocation = {
  id: string
  name: { vi: string; en: string; ru: string; zh: string }
  description: { vi: string; en: string; ru: string; zh: string }
  lat: number
  lng: number
  icon_color: string
  sort_order: number
  is_published: boolean
  google_maps_url?: string
  category_id?: string | null
  page_id?: string | null
  location_categories?: {
    id: string
    name: { vi: string; en: string; ru: string; zh: string }
  } | null
  pages?: { id: string; slug: string; title: Record<string, string> } | null
}

const COLORS = [
  { label: 'Vàng gold', value: '#c8920c' },
  { label: 'Đỏ terra', value: '#b85030' },
  { label: 'Xanh rừng', value: '#1b6b5d' },
]

const EMPTY: Omit<MapLocation, 'id'> = {
  name: { vi: '', en: '', ru: '', zh: '' },
  description: { vi: '', en: '', ru: '', zh: '' },
  lat: 12.5,
  lng: 108.5,
  icon_color: '#c8920c',
  sort_order: 0,
  is_published: true,
  google_maps_url: '',
  category_id: null,
  page_id: null,
}

export default function MapPage() {
  const { role } = useAdminAuth()
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [categories, setCategories] = useState<{ id: string; name: { vi: string; en: string; ru: string; zh: string } }[]>([])
  const [pages, setPages] = useState<{ id: string; slug: string; title: Record<string, string> }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'add' | 'edit'>('add')
  const [current, setCurrent] = useState<Partial<MapLocation>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [translating, setTranslating] = useState(false)

  const [categoryOpen, setCategoryOpen] = useState(false)
  const [newCatName, setNewCatName] = useState({ vi: '', en: '', ru: '', zh: '' })
  const [catSaving, setCatSaving] = useState(false)
  const [catTranslating, setCatTranslating] = useState(false)

  async function load() {
    const data = await getAdminMapData()
    setCategories((data.categories as typeof categories) ?? [])
    setPages((data.pages as typeof pages) ?? [])
    setLocations((data.locations as MapLocation[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      load()
    })
  }, [])

  function openAdd() {
    setCurrent(EMPTY)
    setMode('add')
    setOpen(true)
  }

  function openEdit(loc: MapLocation) {
    const name = { vi: '', en: '', ru: '', zh: '' }
    const description = { vi: '', en: '', ru: '', zh: '' }
    Object.assign(name, loc.name)
    Object.assign(description, loc.description)

    setCurrent({
      ...loc,
      name,
      description,
    })
    setMode('edit')
    setOpen(true)
  }

  function setField(path: string, value: string | number | boolean | null) {
    setCurrent((prev) => {
      if (!path.includes('.')) return { ...prev, [path]: value }
      const [key, sub] = path.split('.')
      return { ...prev, [key]: { ...(prev[key as keyof typeof prev] as object), [sub]: value } }
    })
  }

  async function handleAutoTranslate() {
    const viName = current.name?.vi
    if (!viName) return
    setTranslating(true)
    try {
      const LANGS = ['en', 'ru', 'zh'] as const
      const viDesc = current.description?.vi ?? ''
      const [nameResults, descResults] = await Promise.all([
        Promise.all(LANGS.map((l) => translateText(viName, 'vi', l))),
        viDesc
          ? Promise.all(LANGS.map((l) => translateText(viDesc, 'vi', l)))
          : Promise.resolve(['', '', '']),
      ])
      setCurrent((prev) => ({
        ...prev,
        name: { vi: viName, en: nameResults[0], ru: nameResults[1], zh: nameResults[2] },
        description: {
          vi: prev.description?.vi ?? '',
          en: descResults[0],
          ru: descResults[1],
          zh: descResults[2],
        },
      }))
    } catch (err) {
      console.error('Auto translate error:', err)
    } finally {
      setTranslating(false)
    }
  }

  async function handleCatAutoTranslate() {
    if (!newCatName.vi) return
    setCatTranslating(true)
    try {
      const LANGS = ['en', 'ru', 'zh'] as const
      const results = await Promise.all(LANGS.map((l) => translateText(newCatName.vi, 'vi', l)))
      setNewCatName((prev) => ({ vi: prev.vi, en: results[0], ru: results[1], zh: results[2] }))
    } catch (err) {
      console.error('Auto translate category error:', err)
    } finally {
      setCatTranslating(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      name: current.name,
      description: current.description,
      lat: Number(current.lat),
      lng: Number(current.lng),
      icon_color: current.icon_color,
      sort_order: Number(current.sort_order),
      is_published: current.is_published,
      google_maps_url: current.google_maps_url || null,
      category_id: current.category_id || null,
      page_id: current.page_id || null,
      updated_at: new Date().toISOString(),
    }
    try {
      if (mode === 'add') await createMapLocation(payload)
      else await updateMapLocation(current.id!, payload)
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
      setSaving(false)
      return
    }
    await load()
    setOpen(false)
    setSaving(false)
  }

  async function handleSaveCategory() {
    if (!newCatName.vi) return
    setCatSaving(true)
    let data: { id?: string } | null = null
    try {
      data = await createLocationCategory({ name: newCatName })
    } catch (error) {
      alert('Lỗi tạo danh mục: ' + (error instanceof Error ? error.message : String(error)))
      setCatSaving(false)
      return
    }

    // Reload categories list
    const catList = await getLocationCategories()
    setCategories(catList ?? [])

    if (data?.id) {
      setField('category_id', data.id)
    }

    setNewCatName({ vi: '', en: '', ru: '', zh: '' })
    setCategoryOpen(false)
    setCatSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Xoá địa điểm này?')) return
    setDeletingId(id)
    await deleteMapLocation(id)
    await load()
    setDeletingId(null)
  }

  async function togglePublish(loc: MapLocation) {
    await updateMapLocation(loc.id, { is_published: !loc.is_published })
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Địa điểm di sản</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý địa điểm hiển thị trên bản đồ (Hỗ trợ 4 ngôn ngữ)
          </p>
        </div>
        <Button onClick={openAdd} className="bg-amber-600 hover:bg-amber-500 text-black font-semibold shrink-0 self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Thêm địa điểm
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danh sách địa điểm</CardTitle>
          <CardDescription>{locations.length} địa điểm</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MapPin className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Chưa có địa điểm nào.</p>
              <Button variant="link" onClick={openAdd} className="mt-1 text-amber-500">
                Thêm địa điểm đầu tiên
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Tọa độ</TableHead>
                  <TableHead className="w-16">Màu</TableHead>
                  <TableHead className="w-20 text-center">Thứ tự</TableHead>
                  <TableHead className="w-32 text-right">Hiển thị</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{loc.name?.vi || '(Trống)'}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {loc.location_categories && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-semibold dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
                            {loc.location_categories.name?.vi || 'Danh mục không tên'}
                          </Badge>
                        )}
                        {loc.name?.en && <Badge variant="secondary" className="text-[10px] px-1 py-0 font-normal">EN: {loc.name.en}</Badge>}
                        {loc.name?.ru && <Badge variant="secondary" className="text-[10px] px-1 py-0 font-normal">RU: {loc.name.ru}</Badge>}
                        {loc.name?.zh && <Badge variant="secondary" className="text-[10px] px-1 py-0 font-normal">ZH: {loc.name.zh}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground">
                        {Number(loc.lat).toFixed(4)}, {Number(loc.lng).toFixed(4)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div
                        className="w-5 h-5 rounded-full border border-border"
                        style={{ backgroundColor: loc.icon_color }}
                      />
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {loc.sort_order}
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={loc.is_published}
                        onCheckedChange={() => togglePublish(loc)}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => openEdit(loc)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {role === 'admin' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-muted-foreground hover:text-destructive"
                            disabled={deletingId === loc.id}
                            onClick={() => handleDelete(loc.id)}
                          >
                            {deletingId === loc.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'add' ? 'Thêm địa điểm mới' : 'Chỉnh sửa địa điểm'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Điền Tiếng Việt rồi nhấn nút để tự động dịch sang các ngôn ngữ còn lại.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoTranslate}
                disabled={translating || !current.name?.vi}
                className="shrink-0 gap-1.5 text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:hover:bg-amber-950/30"
              >
                {translating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                {translating ? 'Đang dịch...' : 'Tự động dịch'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên địa điểm */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm border-b pb-1 text-amber-500 uppercase tracking-wider">Tên địa điểm (Name)</h3>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Tiếng Việt *</Label>
                    <Input
                      value={current.name?.vi ?? ''}
                      onChange={(e) => setField('name.vi', e.target.value)}
                      placeholder="Tháp Po Nagar"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tiếng Anh (English)</Label>
                    <Input
                      value={current.name?.en ?? ''}
                      onChange={(e) => setField('name.en', e.target.value)}
                      placeholder="Po Nagar Tower"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tiếng Nga (Русский)</Label>
                    <Input
                      value={current.name?.ru ?? ''}
                      onChange={(e) => setField('name.ru', e.target.value)}
                      placeholder="Башня По Нагар"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tiếng Trung (中文)</Label>
                    <Input
                      value={current.name?.zh ?? ''}
                      onChange={(e) => setField('name.zh', e.target.value)}
                      placeholder="婆那迦占婆塔"
                    />
                  </div>
                </div>
              </div>

              {/* Mô tả địa điểm */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm border-b pb-1 text-amber-500 uppercase tracking-wider">Mô tả (Description)</h3>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Tiếng Việt</Label>
                    <Textarea
                      value={current.description?.vi ?? ''}
                      onChange={(e) => setField('description.vi', e.target.value)}
                      placeholder="Mô tả di tích lịch sử..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tiếng Anh (English)</Label>
                    <Textarea
                      value={current.description?.en ?? ''}
                      onChange={(e) => setField('description.en', e.target.value)}
                      placeholder="Historical description..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tiếng Nga (Русский)</Label>
                    <Textarea
                      value={current.description?.ru ?? ''}
                      onChange={(e) => setField('description.ru', e.target.value)}
                      placeholder="Описание исторического памятника..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tiếng Trung (中文)</Label>
                    <Textarea
                      value={current.description?.zh ?? ''}
                      onChange={(e) => setField('description.zh', e.target.value)}
                      placeholder="历史遗迹描述..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5 col-span-1">
                <Label>Vĩ độ (Lat) *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={current.lat ?? ''}
                  onChange={(e) => setField('lat', e.target.value)}
                  placeholder="12.2638"
                />
              </div>
              <div className="space-y-1.5 col-span-1">
                <Label>Kinh độ (Lng) *</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={current.lng ?? ''}
                  onChange={(e) => setField('lng', e.target.value)}
                  placeholder="109.1956"
                />
              </div>
              <div className="space-y-1.5 col-span-1">
                <Label>Thứ tự hiển thị</Label>
                <Input
                  type="number"
                  value={current.sort_order ?? 0}
                  onChange={(e) => setField('sort_order', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5 col-span-1">
                <Label>Màu marker</Label>
                <div className="flex gap-2 pt-1">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => setField('icon_color', c.value)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        current.icon_color === c.value ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label>Đường dẫn Google Maps (Google Maps URL - Tùy chọn)</Label>
              <Input
                value={current.google_maps_url ?? ''}
                onChange={(e) => setField('google_maps_url', e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
              />
              <p className="text-[11px] text-muted-foreground">
                Nếu bỏ trống, hệ thống sẽ tự động tạo liên kết Google Maps theo Tọa độ đã nhập ở trên.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label>Danh mục di sản</Label>
                <div className="flex gap-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={current.category_id ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === 'create_new') {
                        setCategoryOpen(true)
                      } else {
                        setField('category_id', val || null)
                      }
                    }}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name?.vi || 'Danh mục không tên'}
                      </option>
                    ))}
                    <option value="create_new">+ Tạo danh mục mới</option>
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setCategoryOpen(true)}
                    title="Tạo danh mục mới"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Trang chi tiết (Tùy chọn)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={current.page_id ?? ''}
                  onChange={(e) => setField('page_id', e.target.value || null)}
                >
                  <option value="">-- Không liên kết trang --</option>
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.title?.vi || page.slug}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Nếu chọn, popup bản đồ sẽ hiển thị nút &quot;Xem chi tiết&quot;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch
                id="published"
                checked={current.is_published ?? true}
                onCheckedChange={(v) => setField('is_published', v)}
                className="data-[state=checked]:bg-amber-500"
              />
              <Label htmlFor="published" className="cursor-pointer">Hiển thị trên bản đồ</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Huỷ
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !current.name?.vi}
              className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'add' ? 'Thêm địa điểm' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog tạo danh mục */}
      <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent className="w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo danh mục mới</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCatAutoTranslate}
                disabled={catTranslating || !newCatName.vi}
                className="gap-1.5 text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:hover:bg-amber-950/30"
              >
                {catTranslating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                {catTranslating ? 'Đang dịch...' : 'Tự động dịch'}
              </Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Tên danh mục (Tiếng Việt) *</Label>
                <Input
                  value={newCatName.vi}
                  onChange={(e) => setNewCatName((prev) => ({ ...prev, vi: e.target.value }))}
                  placeholder="Ví dụ: Tháp Chăm, Lễ hội"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tên danh mục (Tiếng Anh)</Label>
                <Input
                  value={newCatName.en}
                  onChange={(e) => setNewCatName((prev) => ({ ...prev, en: e.target.value }))}
                  placeholder="Po Nagar Tower"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tên danh mục (Tiếng Nga)</Label>
                <Input
                  value={newCatName.ru}
                  onChange={(e) => setNewCatName((prev) => ({ ...prev, ru: e.target.value }))}
                  placeholder="Башня По Нагар"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tên danh mục (Tiếng Trung)</Label>
                <Input
                  value={newCatName.zh}
                  onChange={(e) => setNewCatName((prev) => ({ ...prev, zh: e.target.value }))}
                  placeholder="婆那迦占婆塔"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryOpen(false)}>
              Huỷ
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={catSaving || !newCatName.vi}
              className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
            >
              {catSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tạo danh mục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
