'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Loader2, AlertCircle, BookOpen, Pencil, Plus, Trash2, Copy, Settings, Globe, Languages, Check, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { revalidatePosts, revalidateCMS } from '@/lib/actions'
import Image from 'next/image'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { translateText } from '@/lib/auto-translate'
import { getTargetLangs } from '@/lib/languages'
import {
  createPost,
  createPostCategory,
  deletePost,
  deletePostCategory,
  duplicatePost,
  getAdminBlogSettings,
  getAdminPostById,
  getAdminPostBySlug,
  getAdminPosts,
  getPostCategories,
  setAdminBlogSettings,
  updatePost,
} from '@/lib/admin-actions'

type PostCategory = {
  id: string
  name: { vi: string; en: string; ru: string; zh: string }
  slug: string | null
  description: { vi: string; en: string; ru: string; zh: string } | null
  sort_order: number
}

type PostRecord = {
  id: string
  slug: string
  title: { vi: string; en: string; ru: string; zh: string }
  cover_image: string | null
  is_published: boolean
  published_at: string
  category_id?: string | null
  post_categories?: { id: string; name: { vi: string; en: string; ru: string; zh: string } } | null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogsPage() {
  const { role, loading: authLoading } = useAdminAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<PostRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

  // Action menu dropdown state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Add new post states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newSlug, setNewSlug] = useState('')
  const [newTitleVi, setNewTitleVi] = useState('')
  const [newTitleEn, setNewTitleEn] = useState('')
  const [newTitleRu, setNewTitleRu] = useState('')
  const [newTitleZh, setNewTitleZh] = useState('')
  const [creating, setCreating] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [newCategoryId, setNewCategoryId] = useState<string>('')

  // Categories management states
  const [categories, setCategories] = useState<PostCategory[]>([])
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [catName, setCatName] = useState({ vi: '', en: '', ru: '', zh: '' })
  const [catSlug, setCatSlug] = useState('')
  const [catDescription, setCatDescription] = useState({ vi: '', en: '', ru: '', zh: '' })
  const [catSaving, setCatSaving] = useState(false)
  const [catTranslating, setCatTranslating] = useState(false)
  const [catDeletingId, setCatDeletingId] = useState<string | null>(null)

  // Blog header edit states
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false)
  const [headerActiveLang, setHeaderActiveLang] = useState<'vi' | 'en' | 'ru' | 'zh'>('vi')
  const [headerLabel, setHeaderLabel] = useState<Record<string, string>>({ vi: '', en: '', ru: '', zh: '' })
  const [headerTitle, setHeaderTitle] = useState<Record<string, string>>({ vi: '', en: '', ru: '', zh: '' })
  const [headerSubtitle, setHeaderSubtitle] = useState<Record<string, string>>({ vi: '', en: '', ru: '', zh: '' })
  const [headerSaving, setHeaderSaving] = useState(false)
  const [headerTranslating, setHeaderTranslating] = useState(false)
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [headerSuccess, setHeaderSuccess] = useState(false)

  const loadBlogSettings = useCallback(async () => {
    try {
      const val = await getAdminBlogSettings() as Record<string, Record<string, string>> | null
      if (val) {
        setHeaderLabel({
          vi: val.list_label?.vi || '',
          en: val.list_label?.en || '',
          ru: val.list_label?.ru || '',
          zh: val.list_label?.zh || ''
        })
        setHeaderTitle({
          vi: val.list_title?.vi || '',
          en: val.list_title?.en || '',
          ru: val.list_title?.ru || '',
          zh: val.list_title?.zh || ''
        })
        setHeaderSubtitle({
          vi: val.list_subtitle?.vi || '',
          en: val.list_subtitle?.en || '',
          ru: val.list_subtitle?.ru || '',
          zh: val.list_subtitle?.zh || ''
        })
      }
    } catch (err) {
      console.error('Error loading blog settings:', err)
    }
  }, [])

  function openEditHeader() {
    setHeaderActiveLang('vi')
    setHeaderError(null)
    setHeaderSuccess(false)
    setHeaderDialogOpen(true)
  }

  const handleHeaderFieldChange = (field: 'label' | 'title' | 'subtitle', value: string) => {
    if (field === 'label') {
      setHeaderLabel((prev) => ({ ...prev, [headerActiveLang]: value }))
    } else if (field === 'title') {
      setHeaderTitle((prev) => ({ ...prev, [headerActiveLang]: value }))
    } else if (field === 'subtitle') {
      setHeaderSubtitle((prev) => ({ ...prev, [headerActiveLang]: value }))
    }
  }

  async function handleHeaderAutoTranslate() {
    const viLabel = headerLabel.vi
    const viTitle = headerTitle.vi
    const viSubtitle = headerSubtitle.vi

    if (!viTitle.trim()) {
      setHeaderError('Vui lòng nhập Tiêu đề Tiếng Việt trước khi dịch tự động.')
      return
    }

    setHeaderTranslating(true)
    setHeaderError(null)

    try {
      const targets = getTargetLangs('vi')
      const newLabel = { ...headerLabel }
      const newTitle = { ...headerTitle }
      const newSubtitle = { ...headerSubtitle }

      for (const lang of targets) {
        if (viLabel.trim()) {
          newLabel[lang] = await translateText(viLabel, 'vi', lang, 'gemini')
        }
        if (viTitle.trim()) {
          newTitle[lang] = await translateText(viTitle, 'vi', lang, 'gemini')
        }
        if (viSubtitle.trim()) {
          newSubtitle[lang] = await translateText(viSubtitle, 'vi', lang, 'gemini')
        }
        await new Promise((r) => setTimeout(r, 200))
      }

      setHeaderLabel(newLabel)
      setHeaderTitle(newTitle)
      setHeaderSubtitle(newSubtitle)
    } catch (err) {
      console.error('Auto-translate header error:', err)
      setHeaderError('Có lỗi xảy ra khi dịch tự động. Vui lòng thử lại.')
    } finally {
      setHeaderTranslating(false)
    }
  }

  async function handleSaveHeader(e: React.FormEvent) {
    e.preventDefault()
    setHeaderSaving(true)
    setHeaderError(null)
    setHeaderSuccess(false)

    try {
      await setAdminBlogSettings({
        list_label: headerLabel,
        list_title: headerTitle,
        list_subtitle: headerSubtitle
      })

      await revalidateCMS()
      setHeaderSuccess(true)
      setTimeout(() => {
        setHeaderSuccess(false)
        setHeaderDialogOpen(false)
      }, 1500)
    } catch (err: unknown) {
      setHeaderError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu cấu hình.')
    } finally {
      setHeaderSaving(false)
    }
  }

  const loadCategories = useCallback(async () => {
    const data = await getPostCategories()
    setCategories((data ?? []) as PostCategory[])
  }, [])

  async function handleCatAutoTranslate() {
    if (!catName.vi.trim()) return
    setCatTranslating(true)
    try {
      const [en, ru, zh] = await Promise.all([
        translateText(catName.vi, 'vi', 'en'),
        translateText(catName.vi, 'vi', 'ru'),
        translateText(catName.vi, 'vi', 'zh'),
      ])
      setCatName((prev) => ({ ...prev, en, ru, zh }))
    } catch (err) {
      console.error('Auto translate category error:', err)
    } finally {
      setCatTranslating(false)
    }
  }

  async function handleCreateCategory() {
    if (!catName.vi.trim()) return
    setCatSaving(true)
    try {
      const autoSlug = catSlug.trim() || slugify(catName.vi.trim())
      await createPostCategory({
        name: { vi: catName.vi.trim(), en: catName.en.trim(), ru: catName.ru.trim(), zh: catName.zh.trim() },
        slug: autoSlug,
        description: {
          vi: catDescription.vi.trim(),
          en: catDescription.en.trim(),
          ru: catDescription.ru.trim(),
          zh: catDescription.zh.trim(),
        },
        sort_order: categories.length,
      })
      setCatName({ vi: '', en: '', ru: '', zh: '' })
      setCatSlug('')
      setCatDescription({ vi: '', en: '', ru: '', zh: '' })
      await loadCategories()
    } finally {
      setCatSaving(false)
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Xóa danh mục này? Các bài viết thuộc danh mục sẽ không bị xóa.')) return
    setCatDeletingId(id)
    await deletePostCategory(id)
    await loadCategories()
    setCatDeletingId(null)
  }

  function openAddPost() {
    setNewSlug('')
    setNewTitleVi('')
    setNewTitleEn('')
    setNewTitleRu('')
    setNewTitleZh('')
    setNewCategoryId('')
    setAddError(null)
    setAddDialogOpen(true)
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()

    const cleanSlug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
    if (!cleanSlug) {
      setAddError('Slug không hợp lệ. Vui lòng chỉ sử dụng chữ thường không dấu, số, dấu gạch ngang hoặc gạch dưới.')
      return
    }

    setCreating(true)
    setAddError(null)

    // Check if slug already exists
    const existingPost = await getAdminPostBySlug(cleanSlug)

    if (existingPost) {
      setAddError(`Slug /${cleanSlug} đã tồn tại. Vui lòng chọn slug khác.`)
      setCreating(false)
      return
    }

    try {
      const newPost = await createPost({
          slug: cleanSlug,
          title: {
            vi: newTitleVi.trim(),
            en: newTitleEn.trim(),
            ru: newTitleRu.trim(),
            zh: newTitleZh.trim()
          },
          summary: { vi: '', en: '', ru: '', zh: '' },
          content: { vi: '', en: '', ru: '', zh: '' },
          category_id: newCategoryId || null,
          is_published: false,
          published_at: new Date().toISOString()
        })
      await revalidatePosts()
      setAddDialogOpen(false)
      setCreating(false)
      router.push(`/admin/blogs/${newPost.id}`)
    } catch (error) {
      setAddError(error instanceof Error ? error.message : String(error))
      setCreating(false)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminPosts()
      setPosts((data ?? []) as unknown as PostRecord[])
    } catch (err) {
      console.error('Error loading posts:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    const t = setTimeout(() => {
      load()
    }, 0)
    return () => clearTimeout(t)
  }, [authLoading, load])

  useEffect(() => {
    if (!authLoading) {
      const t = setTimeout(() => {
        loadBlogSettings()
        loadCategories()
      }, 0)
      return () => clearTimeout(t)
    }
  }, [authLoading, loadBlogSettings, loadCategories])

  useEffect(() => {
    if (!openMenuId) return
    const handleClose = () => setOpenMenuId(null)
    window.addEventListener('click', handleClose)
    return () => window.removeEventListener('click', handleClose)
  }, [openMenuId])

  async function togglePublish(post: PostRecord) {
    setTogglingId(post.id)
    await updatePost(post.id, { is_published: !post.is_published })
    await revalidatePosts()
    await load()
    setTogglingId(null)
  }

  async function handleDeletePost(id: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return
    setDeletingId(id)
    try {
      await deletePost(id)
      await revalidatePosts()
      await load()
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error))
    }
    setDeletingId(null)
  }

  async function handleDuplicatePost(post: PostRecord) {
    if (!confirm(`Bạn có chắc chắn muốn nhân bản bài viết "${post.title?.vi || 'này'}" không?`)) return
    setDuplicatingId(post.id)
    setError(null)

    try {
      // 1. Fetch full post details
      const postDetails = await getAdminPostById(post.id)

      if (!postDetails) {
        throw new Error('Không tìm thấy bài viết gốc')
      }

      // 2. Generate a unique slug
      let candidateSlug = `${postDetails.slug}-copy`
      let counter = 1
      while (true) {
        const existingPost = await getAdminPostBySlug(candidateSlug)

        if (!existingPost) break
        candidateSlug = `${postDetails.slug}-copy-${counter}`
        counter++
      }

      // 3. Generate suffix titles
      const newTitle = {
        vi: postDetails.title?.vi ? `${postDetails.title.vi} (Bản sao)` : '',
        en: postDetails.title?.en ? `${postDetails.title.en} (Copy)` : '',
        ru: postDetails.title?.ru ? `${postDetails.title.ru} (Copy)` : '',
        zh: postDetails.title?.zh ? `${postDetails.title.zh} (Copy)` : '',
      }

      await duplicatePost(post.id, candidateSlug, newTitle)

      await revalidatePosts()
      await load()
    } catch (err: unknown) {
      console.error('Failed to duplicate post:', err)
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi nhân bản bài viết.')
    } finally {
      setDuplicatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quản lý Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Viết và biên tập bài viết chia sẻ về văn hóa di sản
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button onClick={() => setCatDialogOpen(true)} variant="outline" className="border-amber-600/30 text-amber-500 hover:bg-amber-500/10 text-xs sm:text-sm">
            <Globe className="w-4 h-4 mr-1.5" /> Danh mục
          </Button>
          <Button onClick={openEditHeader} variant="outline" className="border-amber-600/30 text-amber-500 hover:bg-amber-500/10 text-xs sm:text-sm">
            <Settings className="w-4 h-4 mr-1.5" /> Cấu hình Header
          </Button>
          <Button onClick={openAddPost} className="bg-amber-600 hover:bg-amber-500 text-black font-semibold text-xs sm:text-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Thêm bài viết mới
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bài viết</CardTitle>
          <CardDescription>Bật/tắt để đăng tải bài viết lên trang blog công cộng</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Chưa có bài viết nào. Bắt đầu bằng cách thêm một bài viết mới!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Ảnh bìa</TableHead>
                  <TableHead className="max-w-[250px] md:max-w-[400px]">Tiêu đề bài viết</TableHead>
                  <TableHead className="w-32">Danh mục</TableHead>
                  <TableHead className="max-w-[200px] md:max-w-[300px]">Slug</TableHead>
                  <TableHead className="w-28">Ngày đăng</TableHead>
                  <TableHead className="w-48 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      {post.cover_image ? (
                        <div className="relative w-12 h-8 rounded overflow-hidden border">
                          <Image
                            src={post.cover_image}
                            alt="Cover"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-8 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground border">
                          No Pic
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[250px] md:max-w-[400px]">
                      <p className="font-medium text-sm line-clamp-1" title={post.title?.vi}>{post.title?.vi || '–'}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1" title={post.title?.en}>{post.title?.en || 'No english title'}</p>
                    </TableCell>
                    <TableCell className="w-32">
                      {post.post_categories ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-semibold dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
                          {post.post_categories.name?.vi || '–'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">–</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] md:max-w-[300px]">
                      <Badge title={post.slug} variant="outline" className="font-mono text-[10px] line-clamp-1 break-all whitespace-normal leading-normal py-0.5 max-h-[60px] overflow-y-auto">
                        {post.slug}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs w-28 whitespace-nowrap">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('vi-VN') : '–'}
                    </TableCell>
                    <TableCell className="text-right w-48">
                      <div className="flex items-center justify-end gap-2.5">
                        <Link href={`/admin/blogs/${post.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs border-amber-600/30 text-amber-600 hover:text-amber-500 hover:bg-amber-500/10 font-medium px-2.5">
                            <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa
                          </Button>
                        </Link>

                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === post.id ? null : post.id);
                            }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>

                          {openMenuId === post.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-popover border border-border rounded-md shadow-lg py-1.5 z-50 text-left animate-in fade-in-50 slide-in-from-top-1 duration-150">
                              {/* Publish Toggle option */}
                              <div
                                className="w-full flex items-center justify-between px-3 py-2 text-xs text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePublish(post);
                                  setOpenMenuId(null);
                                }}
                              >
                                <span>{post.is_published ? 'Gỡ xuất bản' : 'Xuất bản'}</span>
                                {togglingId === post.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                                ) : (
                                  <Switch
                                    checked={post.is_published}
                                    onCheckedChange={() => { }}
                                    className="scale-75 data-[state=checked]:bg-amber-500 pointer-events-none"
                                  />
                                )}
                              </div>

                              {/* Duplicate option */}
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50 text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicatePost(post);
                                  setOpenMenuId(null);
                                }}
                                disabled={duplicatingId === post.id}
                              >
                                {duplicatingId === post.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                )}
                                <span>Nhân bản</span>
                              </button>

                              {/* Delete option (Admin only) */}
                              {role === 'admin' && (
                                <button
                                  type="button"
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors border-t border-border/40 text-left mt-1 pt-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePost(post.id);
                                    setOpenMenuId(null);
                                  }}
                                  disabled={deletingId === post.id}
                                >
                                  {deletingId === post.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                  )}
                                  <span>Xóa bài viết</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Thêm bài viết mới */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm bài viết mới</DialogTitle>
            <DialogDescription>
              Tạo tiêu đề và đường dẫn bài viết. Các nội dung chi tiết sẽ chỉnh sửa ở bước sau.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePost} className="space-y-4 py-2">
            {addError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {addError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="titleVi" className="text-xs text-muted-foreground">
                Tiêu đề (Tiếng Việt) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="titleVi"
                value={newTitleVi}
                onChange={(e) => {
                  setNewTitleVi(e.target.value)
                  setNewSlug(slugify(e.target.value))
                }}
                placeholder="Lễ hội Katê năm 2026 tại Khánh Hòa"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleEn" className="text-xs text-muted-foreground">
                Tiêu đề (Tiếng Anh - English)
              </Label>
              <Input
                id="titleEn"
                value={newTitleEn}
                onChange={(e) => setNewTitleEn(e.target.value)}
                placeholder="Kate Festival 2026 in Khanh Hoa"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleRu" className="text-xs text-muted-foreground">
                Tiêu đề (Tiếng Nga - Русский)
              </Label>
              <Input
                id="titleRu"
                value={newTitleRu}
                onChange={(e) => setNewTitleRu(e.target.value)}
                placeholder="Фестиваль Кате 2026 в Кханьхоа"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleZh" className="text-xs text-muted-foreground">
                Tiêu đề (Tiếng Trung - 中文)
              </Label>
              <Input
                id="titleZh"
                value={newTitleZh}
                onChange={(e) => setNewTitleZh(e.target.value)}
                placeholder="2026年庆和省卡特节"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newCategory" className="text-xs text-muted-foreground">
                Danh mục
              </Label>
              <select
                id="newCategory"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
              >
                <option value="">-- Chọn danh mục (Tùy chọn) --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name?.vi || '–'}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug" className="text-xs text-muted-foreground">
                Slug / Đường dẫn (Tự động chuẩn SEO)
              </Label>
              <Input
                id="slug"
                value={newSlug}
                disabled
                placeholder="le-hoi-kate-2026"
                className="bg-muted font-mono text-xs cursor-not-allowed"
              />
              {newSlug && (
                <p className="text-[11px] text-muted-foreground">
                  Xem thử: <span className="font-mono bg-muted/50 px-1 py-0.5 rounded text-amber-500">/blog/{newSlug}</span>
                </p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Huỷ</Button>
              <Button
                type="submit"
                disabled={creating}
                className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
              >
                {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Tạo & Biên tập
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Quản lý danh mục */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quản lý danh mục bài viết</DialogTitle>
            <DialogDescription>
              Thêm hoặc xóa danh mục. Tên sẽ được tự động dịch sang các ngôn ngữ khác.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Category list */}
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Chưa có danh mục nào.</p>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-3 py-2 rounded-md border border-border bg-muted/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{cat.name?.vi || '–'}</p>
                        <p className="text-xs text-muted-foreground font-mono">{cat.slug || '–'}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
                      disabled={catDeletingId === cat.id}
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      {catDeletingId === cat.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new category form */}
            <div className="space-y-2.5 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thêm danh mục mới</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCatAutoTranslate}
                  disabled={catTranslating || !catName.vi.trim()}
                  className="h-7 text-[11px] gap-1.5 px-2.5 text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:hover:bg-amber-950/30"
                >
                  {catTranslating ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Đang dịch...</>
                  ) : (
                    <><Languages className="w-3 h-3" /> Tự động dịch</>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <Input
                  value={catName.vi}
                  onChange={(e) => {
                    setCatName((p) => ({ ...p, vi: e.target.value }))
                    setCatSlug(slugify(e.target.value))
                  }}
                  placeholder="Tên (Tiếng Việt) *"
                />
                <Input value={catName.en} onChange={(e) => setCatName((p) => ({ ...p, en: e.target.value }))} placeholder="Name (English)" />
                <Input value={catName.ru} onChange={(e) => setCatName((p) => ({ ...p, ru: e.target.value }))} placeholder="Название (Русский)" />
                <Input value={catName.zh} onChange={(e) => setCatName((p) => ({ ...p, zh: e.target.value }))} placeholder="名称 (中文)" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Slug (tự động)</Label>
                <Input value={catSlug} onChange={(e) => setCatSlug(e.target.value)} placeholder="le-hoi" className="font-mono text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Mô tả ngắn (Tiếng Việt)</Label>
                <Input value={catDescription.vi} onChange={(e) => setCatDescription((p) => ({ ...p, vi: e.target.value }))} placeholder="Mô tả ngắn về danh mục này..." />
              </div>
              <Button
                type="button"
                onClick={handleCreateCategory}
                disabled={catSaving || !catName.vi.trim()}
                className="w-full bg-amber-600 hover:bg-amber-500 text-black font-semibold gap-1.5"
              >
                {catSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Thêm danh mục
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Cấu hình Header Blog */}
      <Dialog open={headerDialogOpen} onOpenChange={setHeaderDialogOpen}>
        <DialogContent className="max-w-[600px] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Cấu hình Header trang Blog</DialogTitle>
            <DialogDescription>
              Cập nhật tiêu đề, nhãn danh mục và mô tả ngắn hiển thị trên đầu trang lưu trữ bài viết.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveHeader} className="space-y-4 py-2">
            {headerError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {headerError}
              </div>
            )}
            {headerSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-md">
                <Check className="w-4 h-4 shrink-0" />
                Cập nhật cấu hình thành công!
              </div>
            )}

            {/* Language Tab Selector */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
              {[
                { code: 'vi', name: 'Tiếng Việt (Gốc)' },
                { code: 'en', name: 'English' },
                { code: 'ru', name: 'Русский' },
                { code: 'zh', name: '中文' }
              ].map((lang) => (
                <Button
                  key={lang.code}
                  type="button"
                  variant={headerActiveLang === lang.code ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`flex-1 text-xs py-1.5 h-auto transition-all ${headerActiveLang === lang.code
                    ? 'bg-background font-semibold shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                  onClick={() => setHeaderActiveLang(lang.code as 'vi' | 'en' | 'ru' | 'zh')}
                >
                  {lang.name}
                </Button>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="headerLabel" className="text-xs text-muted-foreground">
                    Nhãn danh mục (Label) ({headerActiveLang.toUpperCase()})
                  </Label>
                  {headerActiveLang === 'vi' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={headerTranslating || !headerTitle.vi.trim()}
                      onClick={handleHeaderAutoTranslate}
                      className="h-6 text-[10px] gap-1 px-2 border-amber-500/30 text-amber-600 hover:text-amber-500 hover:bg-amber-500/10"
                    >
                      {headerTranslating ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Đang dịch...</>
                      ) : (
                        <><Languages className="w-3 h-3" /> Tự động dịch</>
                      )}
                    </Button>
                  )}
                </div>
                <Input
                  id="headerLabel"
                  value={headerLabel[headerActiveLang] || ''}
                  onChange={(e) => handleHeaderFieldChange('label', e.target.value)}
                  placeholder="Ví dụ: BÀI VIẾT & TƯ LIỆU"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="headerTitle" className="text-xs text-muted-foreground">
                  Tiêu đề chính (Title) ({headerActiveLang.toUpperCase()}) {headerActiveLang === 'vi' && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="headerTitle"
                  value={headerTitle[headerActiveLang] || ''}
                  onChange={(e) => handleHeaderFieldChange('title', e.target.value)}
                  placeholder="Ví dụ: Di sản văn hoá Chăm"
                  required={headerActiveLang === 'vi'}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="headerSubtitle" className="text-xs text-muted-foreground">
                  Mô tả ngắn (Subtitle) ({headerActiveLang.toUpperCase()})
                </Label>
                <Textarea
                  id="headerSubtitle"
                  value={headerSubtitle[headerActiveLang] || ''}
                  onChange={(e) => handleHeaderFieldChange('subtitle', e.target.value)}
                  placeholder="Ví dụ: Hành trình khám phá những câu chuyện, nghệ thuật..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setHeaderDialogOpen(false)}>Huỷ</Button>
              <Button
                type="submit"
                disabled={headerSaving}
                className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
              >
                {headerSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
