'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, AlertCircle, Save, Check, Languages } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { getAdminPostById, getPostCategories, updatePost } from '@/lib/admin-actions'
import { revalidatePosts, revalidatePost } from '@/lib/actions'
import ImageUploader from '@/components/admin/ImageUploader'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { translateText, translateHTML } from '@/lib/auto-translate'
import { getTargetLangs } from '@/lib/languages'
import { showToast } from '@/lib/toast'
import { resolveAssetUrl } from '@/lib/assets'

type Lang = 'vi' | 'en' | 'ru' | 'zh'
type I18nText = Record<Lang, string>

const languages: { code: Lang; name: string }[] = [
  { code: 'vi', name: 'Tiếng Việt (Gốc)' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
]

function emptyI18n(): I18nText {
  return { vi: '', en: '', ru: '', zh: '' }
}

function toLocalDatetimeString(isoString: string | null | undefined): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''

  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

export default function EditPostPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [translating, setTranslating] = useState(false)

  const [activeLang, setActiveLang] = useState<Lang>('vi')
  const [title, setTitle] = useState<I18nText>(emptyI18n())
  const [summary, setSummary] = useState<I18nText>(emptyI18n())
  const [content, setContent] = useState<I18nText>(emptyI18n())

  const [slug, setSlug] = useState('')
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [isPublished, setIsPublished] = useState(false)
  const [publishedAt, setPublishedAt] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [categories, setCategories] = useState<{ id: string; name: { vi: string } }[]>([])

  useEffect(() => {
    let active = true

    async function init() {
      try {
        const [postResult, catResult] = await Promise.all([
          getAdminPostById(id),
          getPostCategories(),
        ])

        if (!active) return

        setCategories((catResult ?? []) as { id: string; name: { vi: string } }[])

        if (!postResult) {
          throw new Error('Bài viết không tồn tại.')
        }

        const data = postResult
        setSlug(data.slug || '')
        setCoverImage(data.cover_image || null)
        setIsPublished(data.is_published || false)
        setPublishedAt(toLocalDatetimeString(data.published_at))
        setCategoryId(data.category_id || '')

        setTitle({
          vi: data.title?.vi || '',
          en: data.title?.en || '',
          ru: data.title?.ru || '',
          zh: data.title?.zh || '',
        })
        setSummary({
          vi: data.summary?.vi || '',
          en: data.summary?.en || '',
          ru: data.summary?.ru || '',
          zh: data.summary?.zh || '',
        })
        setContent({
          vi: data.content?.vi || '',
          en: data.content?.en || '',
          ru: data.content?.ru || '',
          zh: data.content?.zh || '',
        })
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Có lỗi khi tải bài viết.')
      } finally {
        if (active) setLoading(false)
      }
    }

    init()
    return () => {
      active = false
    }
  }, [id])

  const handleFieldChange = (field: 'title' | 'summary' | 'content', value: string) => {
    if (field === 'title') setTitle((prev) => ({ ...prev, [activeLang]: value }))
    if (field === 'summary') setSummary((prev) => ({ ...prev, [activeLang]: value }))
    if (field === 'content') setContent((prev) => ({ ...prev, [activeLang]: value }))
    setSuccess(false)
  }

  const handleAutoTranslate = async () => {
    if (!title.vi.trim()) {
      setError('Vui lòng nhập tiêu đề Tiếng Việt trước khi dịch tự động.')
      return
    }

    setTranslating(true)
    setError(null)

    try {
      const targets = getTargetLangs('vi') as Lang[]
      const newTitle = { ...title }
      const newSummary = { ...summary }
      const newContent = { ...content }

      for (const lang of targets) {
        if (title.vi.trim()) newTitle[lang] = await translateText(title.vi, 'vi', lang, 'gemini')
        if (summary.vi.trim()) newSummary[lang] = await translateText(summary.vi, 'vi', lang, 'gemini')
        if (content.vi.trim()) newContent[lang] = await translateHTML(content.vi, 'vi', lang, 'gemini')
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      setTitle(newTitle)
      setSummary(newSummary)
      setContent(newContent)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error('Auto-translate error:', err)
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('GEMINI_RATE_LIMIT')) {
        showToast('Gemini API đã đạt giới hạn cuộc gọi (Rate Limit). Vui lòng thử lại sau.', 'error')
      } else {
        setError('Có lỗi xảy ra khi dịch tự động. Vui lòng thử lại.')
      }
    } finally {
      setTranslating(false)
    }
  }

  const handleSave = async () => {
    if (!title.vi.trim()) {
      setError('Tiêu đề Tiếng Việt không được để trống.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const pubDate = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString()

      await updatePost(id, {
        title,
        summary,
        content,
        cover_image: coverImage,
        category_id: categoryId || null,
        is_published: isPublished,
        published_at: pubDate,
      })

      await revalidatePosts()
      if (slug) await revalidatePost(slug)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu bài viết.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0" onClick={() => router.push('/admin/blogs')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight truncate">{title.vi || 'Biên tập bài viết'}</h1>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">Chỉnh sửa nội dung đa ngôn ngữ cho bài viết blog</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" onClick={() => router.push('/admin/blogs')} disabled={saving} className="text-xs sm:text-sm">Hủy</Button>
          <Button className="bg-amber-600 hover:bg-amber-500 text-black font-semibold gap-1.5 text-xs sm:text-sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-md">
          <Check className="w-4 h-4 shrink-0" />
          Đã lưu bài viết thành công và cập nhật cache!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Nội dung bài viết</CardTitle>
                  <CardDescription>Nhập tiêu đề, tóm tắt và nội dung chi tiết theo từng ngôn ngữ.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={translating || !title.vi.trim()}
                  onClick={handleAutoTranslate}
                  className="h-8 text-xs gap-1.5 font-semibold border-amber-500/30 text-amber-600 self-start sm:self-auto"
                >
                  {translating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang dịch...</> : <><Languages className="w-3.5 h-3.5" /> Tự động dịch</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    type="button"
                    variant={activeLang === lang.code ? 'secondary' : 'ghost'}
                    size="sm"
                    className="flex-1 text-xs py-1.5 h-auto whitespace-nowrap"
                    onClick={() => setActiveLang(lang.code)}
                  >
                    <span className="hidden sm:inline">{lang.name}</span>
                    <span className="sm:hidden">{lang.code.toUpperCase()}</span>
                  </Button>
                ))}
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="post-title" className="text-sm font-medium">
                    Tiêu đề bài viết ({activeLang.toUpperCase()}) {activeLang === 'vi' && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="post-title"
                    value={title[activeLang] || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="Nhập tiêu đề bài viết..."
                    className="w-full text-sm placeholder:text-muted-foreground/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="post-summary" className="text-sm font-medium">Tóm tắt bài viết ({activeLang.toUpperCase()})</Label>
                  <Textarea
                    id="post-summary"
                    value={summary[activeLang] || ''}
                    onChange={(e) => handleFieldChange('summary', e.target.value)}
                    placeholder="Nhập tóm tắt ngắn cho bài viết..."
                    rows={3}
                    className="w-full text-sm placeholder:text-muted-foreground/40 resize-none bg-background border border-input rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nội dung chi tiết ({activeLang.toUpperCase()})</Label>
                  <RichTextEditor
                    key={activeLang}
                    value={content[activeLang] || ''}
                    onChange={(val) => handleFieldChange('content', val)}
                    placeholder="Viết nội dung bài viết..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin chung</CardTitle>
              <CardDescription>Cài đặt cấu hình hiển thị bài viết.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="post-slug" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Đường dẫn bài viết (Slug)</Label>
                <Input id="post-slug" value={slug} readOnly disabled className="bg-muted/50 cursor-not-allowed font-mono text-xs text-muted-foreground" />
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Danh mục</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">-- Không có danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name?.vi || '–'}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hình ảnh bìa</Label>
                <ImageUploader
                  value={coverImage || ''}
                  onChange={(path) => setCoverImage(path)}
                  placeholder="Tải ảnh bìa bài viết lên..."
                />
                {coverImage && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted mt-2">
                    <Image
                      src={resolveAssetUrl(coverImage)}
                      alt="Cover preview"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="publish-switch" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Đăng bài viết</Label>
                    <p className="text-[11px] text-muted-foreground">Công khai bài viết ra trang chủ</p>
                  </div>
                  <Switch id="publish-switch" checked={isPublished} onCheckedChange={setIsPublished} className="data-[state=checked]:bg-amber-500" />
                </div>

                <div className="space-y-2 pt-1">
                  <Label htmlFor="publish-date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ngày xuất bản</Label>
                  <Input
                    id="publish-date"
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="w-full text-xs text-muted-foreground bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
