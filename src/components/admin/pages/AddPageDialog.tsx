'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { revalidateCMS } from '@/lib/actions'
import { createPage, getAdminPages } from '@/lib/admin-actions'

interface AddPageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
  pagesCount: number
}

export default function AddPageDialog({ open, onOpenChange, onCreated, pagesCount }: AddPageDialogProps) {
  const [newSlug, setNewSlug] = useState('')
  const [newTitleVi, setNewTitleVi] = useState('')
  const [newTitleEn, setNewTitleEn] = useState('')
  const [newTitleRu, setNewTitleRu] = useState('')
  const [newTitleZh, setNewTitleZh] = useState('')
  const [newSortOrder, setNewSortOrder] = useState<number>(pagesCount * 10 + 10)
  const [newIsPublished, setNewIsPublished] = useState(false)
  const [creating, setCreating] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  async function handleCreatePage(e: React.FormEvent) {
    e.preventDefault()

    const cleanSlug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
    if (!cleanSlug) {
      setAddError('Slug không hợp lệ. Vui lòng chỉ sử dụng chữ thường không dấu, số, dấu gạch ngang hoặc gạch dưới.')
      return
    }

    if (!newTitleVi.trim()) {
      setAddError('Tiêu đề Tiếng Việt không được để trống.')
      return
    }

    setCreating(true)
    setAddError(null)

    try {
      // Check if slug already exists
      const pages = await getAdminPages()
      const existingPage = pages.find((page: { slug: string }) => page.slug === cleanSlug)

      if (existingPage) {
        setAddError(`Slug /${cleanSlug} đã tồn tại. Vui lòng chọn slug khác.`)
        setCreating(false)
        return
      }

      await createPage({
        slug: cleanSlug,
        title: {
          vi: newTitleVi.trim(),
          en: newTitleEn.trim(),
          ru: newTitleRu.trim(),
          zh: newTitleZh.trim(),
        },
        description: { vi: '', en: '', ru: '', zh: '' },
        is_published: newIsPublished,
        sort_order: newSortOrder,
      })

      await revalidateCMS()
      onCreated()
      onOpenChange(false)
    } catch (err: unknown) {
      console.error('Failed to create page:', err)
      setAddError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo trang.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm trang mới</DialogTitle>
          <DialogDescription>
            Tạo cấu trúc trang tĩnh mới. Sau khi tạo xong, bạn có thể thiết lập các nội dung blocks bên trong.
          </DialogDescription>
        </DialogHeader>

        {addError && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded">
            {addError}
          </div>
        )}

        <form onSubmit={handleCreatePage} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-xs text-muted-foreground">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="Nhập đường dẫn trang (slug)..."
              required
            />
            <p className="text-[11px] text-muted-foreground">Đường dẫn trang web (ví dụ: nha-trang sẽ tạo trang /vi/nha-trang)</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="titleVi" className="text-xs text-muted-foreground">
                Tiêu đề (VI) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="titleVi"
                value={newTitleVi}
                onChange={(e) => setNewTitleVi(e.target.value)}
                placeholder="Nhập tiêu đề Tiếng Việt..."
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="titleEn" className="text-xs text-muted-foreground">
                Tiêu đề (EN)
              </Label>
              <Input
                id="titleEn"
                value={newTitleEn}
                onChange={(e) => setNewTitleEn(e.target.value)}
                placeholder="Nhập tiêu đề Tiếng Anh..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="titleRu" className="text-xs text-muted-foreground">
                Tiêu đề (RU)
              </Label>
              <Input
                id="titleRu"
                value={newTitleRu}
                onChange={(e) => setNewTitleRu(e.target.value)}
                placeholder="Nhập tiêu đề Tiếng Nga..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="titleZh" className="text-xs text-muted-foreground">
                Tiêu đề (ZH)
              </Label>
              <Input
                id="titleZh"
                value={newTitleZh}
                onChange={(e) => setNewTitleZh(e.target.value)}
                placeholder="Nhập tiêu đề Tiếng Trung..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sortOrder" className="text-xs text-muted-foreground">
                Thứ tự sắp xếp
              </Label>
              <Input
                id="sortOrder"
                type="number"
                value={newSortOrder}
                onChange={(e) => setNewSortOrder(Number(e.target.value))}
                placeholder="Nhập thứ tự sắp xếp..."
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Switch
                id="isPublished"
                checked={newIsPublished}
                onCheckedChange={newIsPublished => setNewIsPublished(newIsPublished)}
                className="data-[state=checked]:bg-amber-500"
              />
              <Label htmlFor="isPublished" className="text-xs cursor-pointer text-muted-foreground">Xuất bản trang</Label>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={creating}
              className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
            >
              {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tạo trang
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
