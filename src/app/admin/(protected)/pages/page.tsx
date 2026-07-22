'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Loader2, AlertCircle, FileText, Pencil, Plus, Copy, Trash2, Settings, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { revalidateCMS } from '@/lib/actions'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { deletePage, getAdminPages, updatePage } from '@/lib/admin-actions'

// Subcomponents
import AddPageDialog from '@/components/admin/pages/AddPageDialog'
import DuplicatePageDialog from '@/components/admin/pages/DuplicatePageDialog'
import EditPageSettingsDialog from '@/components/admin/pages/EditPageSettingsDialog'

type Page = {
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

export default function PagesPage() {
  const { role, loading: authLoading } = useAdminAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Action menu dropdown state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Selected records
  const [pageToDuplicate, setPageToDuplicate] = useState<Page | null>(null)
  const [pageToEdit, setPageToEdit] = useState<Page | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminPages()
      setPages(data as Page[])
    } catch (err) {
      console.error('Error loading pages:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) {
      const t = setTimeout(() => {
        load()
      }, 0)
      return () => clearTimeout(t)
    }
  }, [load, authLoading])

  useEffect(() => {
    if (!openMenuId) return
    const handleClose = () => setOpenMenuId(null)
    window.addEventListener('click', handleClose)
    return () => window.removeEventListener('click', handleClose)
  }, [openMenuId])

  async function togglePublish(page: Page) {
    setTogglingId(page.id)
    try {
      await updatePage(page.id, { is_published: !page.is_published })
      await revalidateCMS()
      await load()
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error))
    }
    setTogglingId(null)
  }

  async function handleDeletePage(id: string, slug: string) {
    if (slug === 'home') {
      alert('Không thể xoá trang chủ.')
      return
    }
    if (!confirm('Bạn có chắc chắn muốn xoá trang này và tất cả các blocks của nó không?')) return
    setDeletingId(id)
    try {
      await deletePage(id)
      await revalidateCMS()
      await load()
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error))
    }
    setDeletingId(null)
  }

  function openAddPage() {
    setAddDialogOpen(true)
  }

  function openDuplicatePage(page: Page) {
    setPageToDuplicate(page)
    setDuplicateDialogOpen(true)
  }

  function openEditPageSettings(page: Page) {
    setPageToEdit(page)
    setEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nội dung trang</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các trang và trạng thái xuất bản
          </p>
        </div>
        <Button onClick={openAddPage} className="bg-amber-600 hover:bg-amber-500 text-black font-semibold shrink-0 self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1.5" /> Thêm trang mới
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
          <CardTitle className="text-base">Danh sách trang</CardTitle>
          <CardDescription>Bật/tắt để kiểm soát trang hiển thị trên website</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Chưa có trang nào. Hãy kiểm tra dữ liệu khởi tạo trong PostgreSQL.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trang</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="w-16 text-center">Thứ tự</TableHead>
                  <TableHead className="w-32 text-right">Xuất bản</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <p className="font-medium">{page.title?.vi || '–'}</p>
                      <p className="text-xs text-muted-foreground">{page.title?.en}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        /{page.slug}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground text-sm">
                      {page.sort_order}
                    </TableCell>
                    <TableCell className="text-right w-48">
                      <div className="flex items-center justify-end gap-2.5">
                        <Link href={`/admin/pages/${page.slug}`}>
                          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs border-amber-600/30 text-amber-600 hover:text-amber-500 hover:bg-amber-500/10 font-medium px-2.5" title="Chỉnh sửa blocks">
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
                              setOpenMenuId(openMenuId === page.id ? null : page.id);
                            }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>

                          {openMenuId === page.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-popover border border-border rounded-md shadow-lg py-1.5 z-50 text-left animate-in fade-in-50 slide-in-from-top-1 duration-150">
                              {/* Publish Toggle option */}
                              <div
                                className="w-full flex items-center justify-between px-3 py-2 text-xs text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePublish(page);
                                  setOpenMenuId(null);
                                }}
                              >
                                <span>{page.is_published ? 'Gỡ xuất bản' : 'Xuất bản'}</span>
                                {togglingId === page.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                                ) : (
                                  <Switch
                                    checked={page.is_published}
                                    onCheckedChange={() => { }}
                                    className="scale-75 data-[state=checked]:bg-amber-500 pointer-events-none"
                                  />
                                )}
                              </div>

                              {/* Duplicate option */}
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted/80 transition-colors text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDuplicatePage(page);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Copy className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                <span>Nhân bản trang</span>
                              </button>

                              {/* Settings option */}
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted/80 transition-colors text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditPageSettings(page);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Settings className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                <span>Cài đặt trang</span>
                              </button>

                              {/* Delete option (Admin only) */}
                              {role === 'admin' && (
                                <button
                                  type="button"
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors border-t border-border/40 text-left mt-1 pt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePage(page.id, page.slug);
                                    setOpenMenuId(null);
                                  }}
                                  disabled={deletingId === page.id || page.slug === 'home'}
                                >
                                  {deletingId === page.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                  )}
                                  <span>Xóa trang</span>
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

      {/* Sub Dialog Components */}
      {addDialogOpen && (
        <AddPageDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          pagesCount={pages.length}
          onCreated={load}
        />
      )}

      {duplicateDialogOpen && pageToDuplicate && (
        <DuplicatePageDialog
          key={`duplicate-${pageToDuplicate.id}`}
          open={duplicateDialogOpen}
          onOpenChange={setDuplicateDialogOpen}
          page={pageToDuplicate}
          onDuplicated={load}
        />
      )}

      {editDialogOpen && pageToEdit && (
        <EditPageSettingsDialog
          key={`edit-${pageToEdit.id}`}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          page={pageToEdit}
          onSaved={load}
        />
      )}
    </div>
  )
}
