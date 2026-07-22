'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Languages, Plus, Trash2, QrCode } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'
import AudioUploader from '@/components/admin/AudioUploader'
import { revalidateCMS, revalidatePage } from '@/lib/actions'
import { translateText } from '@/lib/auto-translate'
import { showToast } from '@/lib/toast'
import QRCode from 'qrcode'
import { getAdminPageBySlug, getAdminPages, updatePage } from '@/lib/admin-actions'

interface Page {
  id: string
  slug: string
  title: { vi: string; en: string; ru?: string; zh?: string }
  description?: { vi: string; en: string; ru?: string; zh?: string }
  seo_image?: string | null
  audio_url?: string | null
  is_published: boolean
  sort_order: number
  sub_nav?: Array<{ anchor: string; label: { vi: string; en: string; ru?: string; zh?: string } }>
}

interface PageBlock {
  id: string
  block_type: string
  sort_order: number
  label?: string | null
  content?: Record<string, unknown>
}

interface EditPageSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: Page | null
  onSaved: () => void
}

export default function EditPageSettingsDialog({ open, onOpenChange, page, onSaved }: EditPageSettingsDialogProps) {
  const [editSlug, setEditSlug] = useState(page?.slug || '')
  const [editTitleVi, setEditTitleVi] = useState(page?.title?.vi || '')
  const [editTitleEn, setEditTitleEn] = useState(page?.title?.en || '')
  const [editTitleRu, setEditTitleRu] = useState(page?.title?.ru || '')
  const [editTitleZh, setEditTitleZh] = useState(page?.title?.zh || '')
  const [editDescriptionVi, setEditDescriptionVi] = useState(page?.description?.vi || '')
  const [editDescriptionEn, setEditDescriptionEn] = useState(page?.description?.en || '')
  const [editDescriptionRu, setEditDescriptionRu] = useState(page?.description?.ru || '')
  const [editDescriptionZh, setEditDescriptionZh] = useState(page?.description?.zh || '')
  const [editSeoImage, setEditSeoImage] = useState<string>(page?.seo_image || '')
  const [editAudioUrl, setEditAudioUrl] = useState<string>(page?.audio_url || '')
  const [editSortOrder, setEditSortOrder] = useState<number>(page?.sort_order || 0)
  const [editIsPublished, setEditIsPublished] = useState(page?.is_published || false)
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [translatingEditTitle, setTranslatingEditTitle] = useState(false)
  const [translatingEditDesc, setTranslatingEditDesc] = useState(false)
  const [editSubNav, setEditSubNav] = useState<Array<{ anchor: string; label: { vi: string; en: string; ru?: string; zh?: string } }>>(page?.sub_nav || [])
  const [translatingAllSubNav, setTranslatingAllSubNav] = useState(false)
  const [editPageBlocks, setEditPageBlocks] = useState<PageBlock[]>([])
  const [qrLocale, setQrLocale] = useState<'vi' | 'en' | 'ru' | 'zh'>('vi')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [isCopied, setIsCopied] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)

  const getBlockLabel = (block: PageBlock) => {
    const typeLabel = (() => {
      const meta: Record<string, string> = {
        hero: 'Hero',
        split: 'Split',
        split_cards: 'Split Cards',
        marquee: 'Marquee',
        quote_break: 'Quote',
        card_grid: 'Card Grid',
        video_grid: 'Video Grid',
        features_strip: 'Features',
        intro: 'Intro',
        map: 'Bản đồ',
        iframe: 'Iframe Embed',
        image_banner: 'Banner ảnh',
      }
      return meta[block.block_type] || block.block_type.toUpperCase()
    })()

    if (block.label) {
      return `[${block.sort_order}] ${typeLabel} - ${block.label}`
    }

    const content = block.content || {}
    const titleVal = content.title as string | Record<string, string> | undefined
    const titleStr = typeof titleVal === 'object' && titleVal !== null ? (titleVal as Record<string, string>).vi : (titleVal || '')

    const eyebrowVal = content.eyebrow as string | Record<string, string> | undefined
    const eyebrowStr = typeof eyebrowVal === 'object' && eyebrowVal !== null ? (eyebrowVal as Record<string, string>).vi : (eyebrowVal || '')

    const textVal = content.text as string | Record<string, string> | undefined
    const textStr = typeof textVal === 'object' && textVal !== null ? (textVal as Record<string, string>).vi : (textVal || '')

    let displayTitle = titleStr || eyebrowStr || textStr || ''
    if (typeof displayTitle === 'string' && displayTitle.length > 50) {
      displayTitle = displayTitle.slice(0, 50) + '...'
    }
    return `[${block.sort_order}] ${typeLabel}${displayTitle ? ` - ${displayTitle}` : ''}`
  }

  // Fetch blocks for this page to use as anchor targets
  useEffect(() => {
    if (!page) return
    const fetchPageBlocks = async () => {
      try {
        const data = await getAdminPageBySlug(page.slug)
        setEditPageBlocks((data.blocks || []) as PageBlock[])
      } catch (err) {
        console.error('Failed to load blocks for page settings:', err)
        setEditPageBlocks([])
      }
    }

    fetchPageBlocks()
  }, [page])

  const getPageUrl = (locale: string) => {
    if (typeof window === 'undefined') return ''
    const host = window.location.origin
    const currentSlug = editSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '') || page?.slug || ''
    const path = currentSlug === 'home' ? `/${locale}` : `/${locale}/${currentSlug}`
    return `${host}${path}?utm_source=qr&qr_id=${currentSlug}`
  }

  useEffect(() => {
    if (!page) return
    const url = getPageUrl(qrLocale)
    QRCode.toDataURL(url, {
      width: 1000,
      margin: 2,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      }
    })
      .then(setQrCodeDataUrl)
      .catch(err => console.error('Failed to generate QR code:', err))
  }, [page, qrLocale, editSlug])

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return
    const currentSlug = editSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '') || page?.slug || ''
    const link = document.createElement('a')
    link.href = qrCodeDataUrl
    link.download = `qr-${currentSlug}-${qrLocale}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyUrl = () => {
    const url = getPageUrl(qrLocale)
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  if (!page) return null

  async function handleAutoTranslateEditTitle() {
    if (!editTitleVi.trim()) return
    setTranslatingEditTitle(true)
    setEditError(null)
    try {
      const [en, ru, zh] = await Promise.all([
        translateText(editTitleVi, 'vi', 'en', 'gemini'),
        translateText(editTitleVi, 'vi', 'ru', 'gemini'),
        translateText(editTitleVi, 'vi', 'zh', 'gemini'),
      ])
      setEditTitleEn(en)
      setEditTitleRu(ru)
      setEditTitleZh(zh)
    } catch (err) {
      console.error('Failed to auto-translate edit title:', err)
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('GEMINI_RATE_LIMIT')) {
        showToast('Gemini API đã đạt giới hạn cuộc gọi (Rate Limit). Vui lòng thử lại sau.', 'error')
      } else {
        setEditError('Có lỗi xảy ra khi dịch tiêu đề. Vui lòng thử lại.')
      }
    } finally {
      setTranslatingEditTitle(false)
    }
  }

  async function handleAutoTranslateEditDesc() {
    if (!editDescriptionVi.trim()) return
    setTranslatingEditDesc(true)
    setEditError(null)
    try {
      const [en, ru, zh] = await Promise.all([
        translateText(editDescriptionVi, 'vi', 'en', 'gemini'),
        translateText(editDescriptionVi, 'vi', 'ru', 'gemini'),
        translateText(editDescriptionVi, 'vi', 'zh', 'gemini'),
      ])
      setEditDescriptionEn(en)
      setEditDescriptionRu(ru)
      setEditDescriptionZh(zh)
    } catch (err) {
      console.error('Failed to auto-translate edit description:', err)
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('GEMINI_RATE_LIMIT')) {
        showToast('Gemini API đã đạt giới hạn cuộc gọi (Rate Limit). Vui lòng thử lại sau.', 'error')
      } else {
        setEditError('Có lỗi xảy ra khi dịch mô tả. Vui lòng thử lại.')
      }
    } finally {
      setTranslatingEditDesc(false)
    }
  }

  async function handleTranslateAllSubNavItems() {
    if (editSubNav.length === 0) return
    setTranslatingAllSubNav(true)
    try {
      const updated = [...editSubNav]
      for (let i = 0; i < updated.length; i++) {
        const item = updated[i]
        if (item.label.vi.trim()) {
          const [en, ru, zh] = await Promise.all([
            translateText(item.label.vi, 'vi', 'en', 'gemini'),
            translateText(item.label.vi, 'vi', 'ru', 'gemini'),
            translateText(item.label.vi, 'vi', 'zh', 'gemini'),
          ])
          updated[i].label = {
            vi: item.label.vi,
            en: en,
            ru: ru,
            zh: zh,
          }
          setEditSubNav([...updated])
          await new Promise((r) => setTimeout(r, 200))
        }
      }
    } catch (err) {
      console.error('Failed to translate all sub nav items:', err)
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('GEMINI_RATE_LIMIT')) {
        showToast('Gemini API đã đạt giới hạn cuộc gọi (Rate Limit). Vui lòng thử lại sau.', 'error')
      } else {
        showToast('Có lỗi xảy ra khi dịch danh mục menu.', 'error')
      }
    } finally {
      setTranslatingAllSubNav(false)
    }
  }

  function handleAddSubNavItem() {
    setEditSubNav([
      ...editSubNav,
      { anchor: '', label: { vi: '', en: '', ru: '', zh: '' } }
    ])
  }

  function handleRemoveSubNavItem(idx: number) {
    setEditSubNav(editSubNav.filter((_, i) => i !== idx))
  }

  function handleUpdateSubNavItem(idx: number, field: string, value: string) {
    const updated = [...editSubNav]
    if (field === 'anchor') {
      updated[idx].anchor = value
    } else if (field.startsWith('label.')) {
      const lang = field.split('.')[1] as 'vi' | 'en' | 'ru' | 'zh'
      updated[idx].label = {
        ...updated[idx].label,
        [lang]: value
      }
    }
    setEditSubNav(updated)
  }

  async function handleSavePageSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!page) return

    const cleanSlug = editSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
    if (!cleanSlug) {
      setEditError('Slug không hợp lệ. Vui lòng chỉ sử dụng chữ thường không dấu, số, dấu gạch ngang hoặc gạch dưới.')
      return
    }

    if (!editTitleVi.trim()) {
      setEditError('Tiêu đề Tiếng Việt không được để trống.')
      return
    }

    setEditing(true)
    setEditError(null)

    try {
      // If slug has changed, check if new slug already exists
      if (cleanSlug !== page.slug) {
        const pages = await getAdminPages()
        const existingPage = pages.find((item: { slug: string }) => item.slug === cleanSlug)

        if (existingPage) {
          setEditError(`Slug /${cleanSlug} đã tồn tại. Vui lòng chọn slug khác.`)
          setEditing(false)
          return
        }
      }

      await updatePage(page.id, {
        slug: cleanSlug,
        title: {
          vi: editTitleVi.trim(),
          en: editTitleEn.trim(),
          ru: editTitleRu.trim(),
          zh: editTitleZh.trim(),
        },
        description: {
          vi: editDescriptionVi.trim(),
          en: editDescriptionEn.trim(),
          ru: editDescriptionRu.trim(),
          zh: editDescriptionZh.trim(),
        },
        seo_image: editSeoImage || null,
        audio_url: editAudioUrl || null,
        is_published: editIsPublished,
        sort_order: editSortOrder,
        sub_nav: editSubNav,
      })

      await revalidatePage(cleanSlug)
      await revalidateCMS()
      onSaved()
      onOpenChange(false)
    } catch (err: unknown) {
      console.error('Failed to update page settings:', err)
      setEditError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật cài đặt trang.')
    } finally {
      setEditing(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <DialogTitle>Cài đặt trang: {page?.title?.vi || page?.slug}</DialogTitle>
            <DialogDescription>Cấu hình các thông tin cơ bản, SEO, và menu liên kết của trang.</DialogDescription>
          </DialogHeader>

          {editError && (
            <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded">
              {editError}
            </div>
          )}

          <form onSubmit={handleSavePageSettings} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Cột trái: Cài đặt cơ bản */}
              <div className="space-y-4 pr-0 md:pr-4 md:border-r">
                <h3 className="font-semibold text-sm border-b pb-1 text-amber-600 uppercase tracking-wider">Thông tin cơ bản</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-slug" className="text-xs text-muted-foreground">
                      Slug <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-slug"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      placeholder="Nhập đường dẫn trang (slug)..."
                      required
                      disabled={editSlug === 'home'}
                      className="disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-sortOrder" className="text-xs text-muted-foreground">
                      Thứ tự sắp xếp
                    </Label>
                    <Input
                      id="edit-sortOrder"
                      type="number"
                      value={editSortOrder}
                      onChange={(e) => setEditSortOrder(Number(e.target.value))}
                      placeholder="Nhập thứ tự sắp xếp..."
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-titleVi" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tiêu đề (VI) <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] gap-1 px-1.5 border-amber-500/30 text-amber-600 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all font-semibold"
                        disabled={translatingEditTitle || !editTitleVi.trim()}
                        onClick={() => handleAutoTranslateEditTitle()}
                      >
                        {translatingEditTitle ? (
                          <><Loader2 className="w-2.5 h-2.5 animate-spin" /> ...</>
                        ) : (
                          <><Languages className="w-2.5 h-2.5" /> Dịch tự động</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Input
                    id="edit-titleVi"
                    value={editTitleVi}
                    onChange={(e) => setEditTitleVi(e.target.value)}
                    placeholder="Nhập tiêu đề Tiếng Việt..."
                    required
                  />

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-titleEn" className="text-xs text-muted-foreground">
                        Tiêu đề (EN)
                      </Label>
                      <Input
                        id="edit-titleEn"
                        value={editTitleEn}
                        onChange={(e) => setEditTitleEn(e.target.value)}
                        placeholder="Nhập tiêu đề Tiếng Anh..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-titleRu" className="text-xs text-muted-foreground">
                        Tiêu đề (RU)
                      </Label>
                      <Input
                        id="edit-titleRu"
                        value={editTitleRu}
                        onChange={(e) => setEditTitleRu(e.target.value)}
                        placeholder="Nhập tiêu đề Tiếng Nga..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-titleZh" className="text-xs text-muted-foreground">
                        Tiêu đề (ZH)
                      </Label>
                      <Input
                        id="edit-titleZh"
                        value={editTitleZh}
                        onChange={(e) => setEditTitleZh(e.target.value)}
                        placeholder="Nhập tiêu đề Tiếng Trung..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="edit-isPublished"
                    checked={editIsPublished}
                    onCheckedChange={editIsPublished => setEditIsPublished(editIsPublished)}
                    className="data-[state=checked]:bg-amber-500"
                  />
                  <Label htmlFor="edit-isPublished" className="text-xs cursor-pointer text-muted-foreground">Xuất bản trang</Label>
                </div>

                {/* Mã QR của trang */}
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-amber-600" /> Mã QR của trang (GA4 Tracking)
                  </Label>
                  <div className="flex flex-col gap-4 items-center bg-muted/20 p-4 rounded-lg border border-border/40">
                    {/* QR image — centered, large, clickable */}
                    <button
                      type="button"
                      onClick={() => qrCodeDataUrl && setQrModalOpen(true)}
                      className="bg-white p-2.5 rounded-lg border border-border/20 shadow-sm cursor-pointer hover:shadow-md hover:border-amber-400/40 transition-all group relative"
                      title="Click để xem to"
                      disabled={!qrCodeDataUrl}
                    >
                      {qrCodeDataUrl ? (
                        <>
                          <img src={qrCodeDataUrl} alt="QR Code" className="w-52 h-52 block animate-in fade-in-30" />
                          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/10 transition-colors">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] font-semibold px-2 py-1 rounded">
                              Xem to
                            </span>
                          </span>
                        </>
                      ) : (
                        <div className="w-52 h-52 flex items-center justify-center bg-muted/50 rounded">
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </button>

                    {/* Controls below QR */}
                    <div className="w-full space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Ngôn ngữ đường dẫn</span>
                        <div className="flex gap-1.5">
                          {([
                            { code: 'vi', name: 'VI' },
                            { code: 'en', name: 'EN' },
                            { code: 'ru', name: 'RU' },
                            { code: 'zh', name: 'ZH' }
                          ] as const).map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => setQrLocale(lang.code)}
                              className={`flex-1 py-1 text-[11px] rounded border transition-all font-semibold cursor-pointer ${qrLocale === lang.code
                                ? 'bg-amber-500/15 border-amber-500/50 text-amber-600'
                                : 'bg-background border-border text-muted-foreground hover:text-foreground'
                                }`}
                            >
                              {lang.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Đường dẫn kèm tracking</span>
                        <input
                          type="text"
                          readOnly
                          value={getPageUrl(qrLocale)}
                          className="w-full h-7 rounded border border-input bg-background/50 px-2 py-1 text-[10px] text-muted-foreground select-all outline-none"
                        />
                        <div className="flex gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyUrl}
                            className="flex-1 h-8 text-xs border-border font-medium hover:bg-muted"
                          >
                            {isCopied ? 'Đã chép' : 'Sao chép URL'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadQr}
                            className="flex-1 h-8 text-xs border-amber-500/20 text-amber-600 hover:text-amber-500 hover:bg-amber-500/10 font-semibold"
                          >
                            Tải QR (.png)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải: Cấu hình SEO */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm border-b pb-1 text-amber-600 uppercase tracking-wider">Cấu hình SEO</h3>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-descVi" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Mô tả (VI)</Label>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] gap-1 px-1.5 border-amber-500/30 text-amber-600 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all font-semibold"
                          disabled={translatingEditDesc || !editDescriptionVi.trim()}
                          onClick={() => handleAutoTranslateEditDesc()}
                        >
                          {translatingEditDesc ? (
                            <><Loader2 className="w-2.5 h-2.5 animate-spin" /> ...</>
                          ) : (
                            <><Languages className="w-2.5 h-2.5" /> Dịch tự động</>
                          )}
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      id="edit-descVi"
                      value={editDescriptionVi}
                      onChange={(e) => setEditDescriptionVi(e.target.value)}
                      rows={2}
                      placeholder="Nhập mô tả SEO Tiếng Việt..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-descEn" className="text-xs text-muted-foreground font-medium">Mô tả (EN)</Label>
                    <Textarea
                      id="edit-descEn"
                      value={editDescriptionEn}
                      onChange={(e) => setEditDescriptionEn(e.target.value)}
                      rows={2}
                      placeholder="Nhập mô tả SEO Tiếng Anh..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-descRu" className="text-xs text-muted-foreground font-medium">Mô tả (RU)</Label>
                    <Textarea
                      id="edit-descRu"
                      value={editDescriptionRu}
                      onChange={(e) => setEditDescriptionRu(e.target.value)}
                      rows={2}
                      placeholder="Nhập mô tả SEO Tiếng Nga..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-descZh" className="text-xs text-muted-foreground font-medium">Mô tả (ZH)</Label>
                    <Textarea
                      id="edit-descZh"
                      value={editDescriptionZh}
                      onChange={(e) => setEditDescriptionZh(e.target.value)}
                      rows={2}
                      placeholder="Nhập mô tả SEO Tiếng Trung..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Ảnh chia sẻ SEO (SEO Image)</Label>
                  <Label className="text-[11px] text-muted-foreground block mb-2">Ảnh xem trước hiển thị khi chia sẻ (1200×630px)</Label>
                  <ImageUploader value={editSeoImage} onChange={setEditSeoImage} />
                </div>

                <div className="space-y-1.5 pt-4 border-t border-border/40">
                  <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Nhạc nền trang (Audio)</Label>
                  <Label className="text-[11px] text-muted-foreground block mb-2">Tải lên file âm thanh (.mp3) làm nhạc nền tự động phát cho trang này</Label>
                  <AudioUploader value={editAudioUrl} onChange={setEditAudioUrl} />
                </div>
              </div>
            </div>

            {/* Menu Neo (Sub Navigation) Editor */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-amber-600 uppercase tracking-wider">Menu liên kết (Sub Navigation)</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleTranslateAllSubNavItems()}
                    disabled={translatingAllSubNav || editSubNav.length === 0 || editSubNav.every(item => !item.label.vi.trim())}
                    className="h-7 text-xs border-amber-500/30 text-amber-600 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all font-semibold gap-1"
                  >
                    {translatingAllSubNav ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> ...</>
                    ) : (
                      <><Languages className="w-3 h-3" /> Dịch tự động</>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSubNavItem}
                    className="h-7 text-xs border-amber-500/30 text-amber-600 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all font-semibold"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Thêm mục
                  </Button>
                </div>
              </div>

              {editSubNav.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Chưa cấu hình menu liên kết cho trang này (Click vào menu sẽ không scroll đến section tương ứng).</p>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {editSubNav.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-muted/30 p-2.5 rounded border">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                        <div className="space-y-1 sm:col-span-1">
                          <Label className="text-[10px] text-muted-foreground">Vị trí cuộn tới (Block)</Label>
                          <select
                            value={item.anchor}
                            onChange={(e) => handleUpdateSubNavItem(idx, 'anchor', e.target.value)}
                            disabled={editPageBlocks.length === 0}
                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                          >
                            {editPageBlocks.length === 0 ? (
                              <option value="">-- Chưa có block --</option>
                            ) : (
                              <>
                                <option value="">-- Chọn block --</option>
                                {item.anchor && !editPageBlocks.some((b) => b.id === item.anchor) && (
                                  <option value={item.anchor} className="italic text-amber-600 font-mono">
                                    [Legacy] {item.anchor}
                                  </option>
                                )}
                                {editPageBlocks.map((block) => (
                                  <option key={block.id} value={block.id}>
                                    {getBlockLabel(block)}
                                  </option>
                                ))}
                              </>
                            )}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Nhãn VI</Label>
                          <Input
                            value={item.label.vi}
                            onChange={(e) => handleUpdateSubNavItem(idx, 'label.vi', e.target.value)}
                            placeholder="Nhập nhãn Tiếng Việt..."
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Nhãn EN</Label>
                          <Input
                            value={item.label.en}
                            onChange={(e) => handleUpdateSubNavItem(idx, 'label.en', e.target.value)}
                            placeholder="Nhập nhãn Tiếng Anh..."
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Nhãn RU</Label>
                          <Input
                            value={item.label.ru || ''}
                            onChange={(e) => handleUpdateSubNavItem(idx, 'label.ru', e.target.value)}
                            placeholder="Nhập nhãn Tiếng Nga..."
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Nhãn ZH</Label>
                          <Input
                            value={item.label.zh || ''}
                            onChange={(e) => handleUpdateSubNavItem(idx, 'label.zh', e.target.value)}
                            placeholder="Nhập nhãn Tiếng Trung..."
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSubNavItem(idx)}
                        className="w-8 h-8 text-muted-foreground hover:text-destructive shrink-0 mt-4"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button
                type="submit"
                disabled={editing}
                className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
              >
                {editing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lưu cài đặt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code full-size modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-600" /> Mã QR trang
            </DialogTitle>
            <DialogDescription>
              {getPageUrl(qrLocale)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {qrCodeDataUrl && (
              <div className="bg-white p-4 rounded-xl border border-border/20 shadow-md">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-96 h-96 block" />
              </div>
            )}
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="flex-1 h-9 text-xs border-border font-medium hover:bg-muted"
              >
                {isCopied ? 'Đã chép' : 'Sao chép URL'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadQr}
                className="flex-1 h-9 text-xs border-amber-500/20 text-amber-600 hover:text-amber-500 hover:bg-amber-500/10 font-semibold"
              >
                Tải QR (.png)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
