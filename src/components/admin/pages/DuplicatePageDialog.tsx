'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Languages } from 'lucide-react'
import { revalidateCMS } from '@/lib/actions'
import { translateText } from '@/lib/auto-translate'
import { showToast } from '@/lib/toast'
import { duplicatePage, getAdminPages } from '@/lib/admin-actions'

interface Page {
  id: string
  slug: string
  title: { vi: string; en: string; ru?: string; zh?: string }
  description?: { vi: string; en: string; ru?: string; zh?: string }
  seo_image?: string | null
  audio_url?: string | null
  is_published: boolean
  sort_order: number
}

interface DuplicatePageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: Page | null
  onDuplicated: () => void
}

export default function DuplicatePageDialog({ open, onOpenChange, page, onDuplicated }: DuplicatePageDialogProps) {
  const [dupSlug, setDupSlug] = useState('')
  const [dupTitleVi, setDupTitleVi] = useState(page?.title?.vi ? `${page.title.vi} (Bản sao)` : '')
  const [dupTitleEn, setDupTitleEn] = useState(page?.title?.en ? `${page.title.en} (Copy)` : '')
  const [dupTitleRu, setDupTitleRu] = useState(page?.title?.ru ? `${page.title.ru} (Copy)` : '')
  const [dupTitleZh, setDupTitleZh] = useState(page?.title?.zh ? `${page.title.zh} (Copy)` : '')
  const [dupError, setDupError] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState(false)
  const [translatingTitle, setTranslatingTitle] = useState(false)

  useEffect(() => {
    if (!page) return
    let active = true
    let candidateSlug = `${page.slug}-copy`
    let counter = 1

    const findUniqueSlug = async () => {
      while (true) {
        const pages = await getAdminPages()
        const existingPage = pages.find((item: { slug: string }) => item.slug === candidateSlug)

        if (!active) return
        if (!existingPage) break
        candidateSlug = `${page.slug}-copy-${counter}`
        counter++
      }
      setDupSlug(candidateSlug)
    }

    findUniqueSlug()
    return () => {
      active = false
    }
  }, [page])

  if (!page) return null

  async function handleAutoTranslateTitle() {
    if (!dupTitleVi.trim()) return
    setTranslatingTitle(true)
    setDupError(null)
    try {
      const [en, ru, zh] = await Promise.all([
        translateText(dupTitleVi, 'vi', 'en', 'gemini'),
        translateText(dupTitleVi, 'vi', 'ru', 'gemini'),
        translateText(dupTitleVi, 'vi', 'zh', 'gemini'),
      ])
      setDupTitleEn(en)
      setDupTitleRu(ru)
      setDupTitleZh(zh)
    } catch (err) {
      console.error('Failed to auto-translate title:', err)
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('GEMINI_RATE_LIMIT')) {
        showToast('Gemini API đã đạt giới hạn cuộc gọi (Rate Limit). Vui lòng thử lại sau.', 'error')
      } else {
        setDupError('Có lỗi xảy ra khi dịch tiêu đề. Vui lòng thử lại.')
      }
    } finally {
      setTranslatingTitle(false)
    }
  }

  async function handleConfirmDuplicatePage(e: React.FormEvent) {
    e.preventDefault()
    if (!page) return

    const cleanSlug = dupSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
    if (!cleanSlug) {
      setDupError('Slug không hợp lệ. Vui lòng chỉ sử dụng chữ thường không dấu, số, dấu gạch ngang hoặc gạch dưới.')
      return
    }

    setDuplicating(true)
    setDupError(null)

    try {
      // 1. Check if slug already exists
      const pages = await getAdminPages()
      const existingPage = pages.find((item: { slug: string }) => item.slug === cleanSlug)

      if (existingPage) {
        setDupError(`Slug /${cleanSlug} đã tồn tại. Vui lòng chọn slug khác.`)
        setDuplicating(false)
        return
      }

      // 2. Set multilingual titles
      const newTitle = {
        vi: dupTitleVi.trim(),
        en: dupTitleEn.trim(),
        ru: dupTitleRu.trim(),
        zh: dupTitleZh.trim(),
      }

      await duplicatePage(page.id, {
        slug: cleanSlug,
        title: newTitle,
      })

      await revalidateCMS()
      onDuplicated()
      onOpenChange(false)
    } catch (err: unknown) {
      console.error('Failed to duplicate page:', err)
      setDupError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi nhân bản trang.')
    } finally {
      setDuplicating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nhân bản trang</DialogTitle>
          <DialogDescription>
            Tạo bản sao của trang này cùng với tất cả các khối nội dung bên trong nó.
          </DialogDescription>
        </DialogHeader>

        {dupError && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded">
            {dupError}
          </div>
        )}

        <form onSubmit={handleConfirmDuplicatePage} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="dup-slug" className="text-xs text-muted-foreground">
              Slug mới <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dup-slug"
              value={dupSlug}
              onChange={(e) => setDupSlug(e.target.value)}
              placeholder="Nhập đường dẫn mới (slug)..."
              required
            />
            <p className="text-[11px] text-muted-foreground">Đường dẫn trang web không được trùng lặp</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="dup-titleVi" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tiêu đề (VI) <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] gap-1 px-1.5 border-amber-500/30 text-amber-600 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all font-semibold"
                  disabled={translatingTitle || !dupTitleVi.trim()}
                  onClick={() => handleAutoTranslateTitle()}
                >
                  {translatingTitle ? (
                    <><Loader2 className="w-2.5 h-2.5 animate-spin" /> ...</>
                  ) : (
                    <><Languages className="w-2.5 h-2.5" /> Dịch tự động</>
                  )}
                </Button>
              </div>
            </div>
            <Input
              id="dup-titleVi"
              value={dupTitleVi}
              onChange={(e) => setDupTitleVi(e.target.value)}
              placeholder="Nhập tiêu đề Tiếng Việt..."
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dup-titleEn" className="text-xs text-muted-foreground">
                Tiêu đề (EN)
              </Label>
              <Input
                id="dup-titleEn"
                value={dupTitleEn}
                onChange={(e) => setDupTitleEn(e.target.value)}
                placeholder="Nhập tiêu đề Tiếng Anh..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dup-titleRu" className="text-xs text-muted-foreground">
                Tiêu đề (RU)
              </Label>
              <Input
                id="dup-titleRu"
                value={dupTitleRu}
                onChange={(e) => setDupTitleRu(e.target.value)}
                placeholder="Nhập tiêu đề Tiếng Nga..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dup-titleZh" className="text-xs text-muted-foreground">
                Tiêu đề (ZH)
              </Label>
              <Input
                id="dup-titleZh"
                value={dupTitleZh}
                onChange={(e) => setDupTitleZh(e.target.value)}
                placeholder="Nhập tiêu đề Tiếng Trung..."
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={duplicating}
              className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
            >
              {duplicating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xác nhận nhân bản
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
