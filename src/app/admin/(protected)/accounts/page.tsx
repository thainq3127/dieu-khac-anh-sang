'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { getAccounts, getActivityLogs } from '@/lib/admin-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Loader2, AlertCircle, Plus, Users, Shield, User, Calendar,
  Eye, EyeOff, Edit, Trash2, Search, Activity, Database
} from 'lucide-react'

// Import extracted components & types
import { Profile, ActivityLog } from '@/components/admin/accounts/types'
import AddEditAccountDialog from '@/components/admin/accounts/AddEditAccountDialog'
import DeleteAccountDialog from '@/components/admin/accounts/DeleteAccountDialog'
import ActivityLogDetailsDialog from '@/components/admin/accounts/ActivityLogDetailsDialog'

export default function AccountsPage() {
  const { role, email: currentEmail, loading: authLoading } = useAdminAuth()
  const router = useRouter()

  // Tab state: 'accounts' | 'logs'
  const [activeTab, setActiveTab] = useState<'accounts' | 'logs'>('accounts')

  // Accounts states
  const [accounts, setAccounts] = useState<Profile[]>([])
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [accountsError, setAccountsError] = useState<string | null>(null)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})
  const [searchAccountQuery, setSearchAccountQuery] = useState('')

  // Logs states
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsError, setLogsError] = useState<string | null>(null)
  const [searchLogQuery, setSearchLogQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)

  // Dialog state managers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Profile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && role && role !== 'admin') {
      router.push('/admin')
    }
  }, [role, authLoading, router])

  const fetchAccounts = async () => {
    try {
      setAccountsLoading(true)
      const data = await getAccounts()
      const castedData = (data || []).map((acc: {
        id: string
        email: string
        role: string
        display_name?: string | null
        raw_password?: string | null
        created_at: string
      }) => ({
        ...acc,
        role: acc.role === 'admin' ? 'admin' : 'edit'
      })) as Profile[]
      setAccounts(castedData)
    } catch (err: unknown) {
      setAccountsError(err instanceof Error ? err.message : 'Không thể tải danh sách tài khoản')
    } finally {
      setAccountsLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      setLogsLoading(true)
      const data = await getActivityLogs()
      setLogs(data as ActivityLog[])
    } catch (err: unknown) {
      setLogsError(err instanceof Error ? err.message : 'Không thể tải nhật ký hoạt động')
    } finally {
      setLogsLoading(false)
    }
  }

  useEffect(() => {
    if (role === 'admin') {
      Promise.resolve().then(() => {
        fetchAccounts()
      })
    }
  }, [role])

  useEffect(() => {
    if (role === 'admin' && activeTab === 'logs') {
      Promise.resolve().then(() => {
        fetchLogs()
      })
    }
  }, [role, activeTab])

  if (authLoading || (role && role !== 'admin')) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Handle Open Create Dialog
  const handleOpenCreate = () => {
    setEditingAccount(null)
    setDialogOpen(true)
  }

  // Handle Open Edit Dialog
  const handleOpenEdit = (acc: Profile) => {
    setEditingAccount(acc)
    setDialogOpen(true)
  }

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Filters
  const filteredAccounts = accounts.filter(acc =>
    acc.email.toLowerCase().includes(searchAccountQuery.toLowerCase()) ||
    (acc.display_name || '').toLowerCase().includes(searchAccountQuery.toLowerCase())
  )

  const filteredLogs = logs.filter(log =>
    log.user_email.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
    log.target_table.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
    (log.target_name || '').toLowerCase().includes(searchLogQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quản lý tài khoản</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản trị tài khoản biên tập viên và theo dõi lịch sử hoạt động trên hệ thống.
          </p>
        </div>

        {activeTab === 'accounts' && (
          <Button onClick={handleOpenCreate} className="bg-amber-600 hover:bg-amber-500 text-black font-semibold shadow-sm shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            Thêm tài khoản
          </Button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'accounts'
            ? 'border-amber-600 text-amber-600 bg-amber-600/5'
            : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <Users className="w-4 h-4" />
          Danh sách tài khoản ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'logs'
            ? 'border-amber-600 text-amber-600 bg-amber-600/5'
            : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <Activity className="w-4 h-4" />
          Nhật ký hoạt động ({logs.length})
        </button>
      </div>

      {/* ── TAB 1: ACCOUNTS LIST ─────────────────────────────────────────── */}
      {activeTab === 'accounts' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {accountsError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {accountsError}
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm email hoặc tên hiển thị..."
                value={searchAccountQuery}
                onChange={(e) => setSearchAccountQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                Tài khoản quản trị viên & Biên tập viên
              </CardTitle>
              <CardDescription>
                Admin có quyền hạn tối cao. Biên tập viên chỉ được phép thêm mới, cập nhật các di tích, địa điểm và bài viết.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {accountsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <User className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Không tìm thấy tài khoản nào phù hợp.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">STT</TableHead>
                      <TableHead>Tên hiển thị</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-40">Quyền hạn</TableHead>
                      <TableHead className="w-48">Mật khẩu</TableHead>
                      <TableHead className="w-48 text-right">Ngày tạo</TableHead>
                      <TableHead className="w-28 text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((acc, index) => {
                      const isVisible = visiblePasswords[acc.id] || false
                      const hasPassword = !!acc.raw_password
                      const isCurrentUser = acc.email === currentEmail

                      return (
                        <TableRow key={acc.id}>
                          <TableCell className="font-mono text-muted-foreground text-center">{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {acc.display_name || (
                              <span className="text-muted-foreground italic">Chưa đặt tên</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span>{acc.email}</span>
                              {isCurrentUser && (
                                <Badge className="bg-muted text-muted-foreground border-border ml-1">Tôi</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {acc.role === 'admin' ? (
                              <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 gap-1 hover:bg-amber-500/15">
                                <Shield className="w-3 h-3" /> Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <User className="w-3 h-3 text-muted-foreground" /> Biên tập viên
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm tracking-wide text-muted-foreground">
                                {hasPassword
                                  ? (isVisible ? acc.raw_password : '••••••••')
                                  : <span className="text-xs text-muted-foreground italic">(Không khả dụng)</span>
                                }
                              </span>
                              {hasPassword && (
                                <button
                                  onClick={() => togglePasswordVisibility(acc.id)}
                                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                  title={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                  {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-xs">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              {new Date(acc.created_at).toLocaleDateString('vi-VN')} {new Date(acc.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(acc)}
                                className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                                title="Chỉnh sửa tài khoản"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isCurrentUser}
                                onClick={() => setDeleteTarget(acc)}
                                className={`h-8 w-8 ${isCurrentUser ? 'text-muted-foreground opacity-40 cursor-not-allowed' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'}`}
                                title={isCurrentUser ? "Không thể tự xóa tài khoản của bạn" : "Xóa tài khoản"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 2: ACTIVITY LOGS ─────────────────────────────────────────── */}
      {activeTab === 'logs' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {logsError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {logsError}
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Lọc hoạt động (tài khoản, bảng, tên...)"
                value={searchLogQuery}
                onChange={(e) => setSearchLogQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-600" />
                Nhật ký thay đổi dữ liệu hệ thống
              </CardTitle>
              <CardDescription>
                Ghi lại các thay đổi dữ liệu ở tầng Backend (INSERT, UPDATE, DELETE) trên các thực thể quan trọng của website.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {logsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Activity className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Không tìm thấy bản ghi hoạt động nào.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">STT</TableHead>
                      <TableHead className="w-48">Thời gian</TableHead>
                      <TableHead>Tài khoản thực hiện</TableHead>
                      <TableHead className="w-32">Thao tác</TableHead>
                      <TableHead className="w-40">Bảng dữ liệu</TableHead>
                      <TableHead>Đối tượng tác động</TableHead>
                      <TableHead className="w-24 text-center">Chi tiết</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log, index) => {
                      let actionBadge = (
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">{log.action}</Badge>
                      )
                      if (log.action === 'INSERT') {
                        actionBadge = (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">INSERT</Badge>
                        )
                      } else if (log.action === 'UPDATE') {
                        actionBadge = (
                          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">UPDATE</Badge>
                        )
                      } else if (log.action === 'DELETE') {
                        actionBadge = (
                          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">DELETE</Badge>
                        )
                      }

                      const tableTranslations: Record<string, string> = {
                        pages: 'Trang tĩnh (pages)',
                        content_blocks: 'Khối nội dung (blocks)',
                        map_locations: 'Địa điểm bản đồ',
                        posts: 'Bài viết (posts)',
                        profiles: 'Hồ sơ tài khoản',
                        site_settings: 'Cấu hình hệ thống'
                      }

                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-muted-foreground text-center">{index + 1}</TableCell>
                          <TableCell className="text-muted-foreground text-xs font-mono">
                            {new Date(log.created_at).toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell className="font-medium font-mono text-xs">
                            {log.user_email}
                          </TableCell>
                          <TableCell>{actionBadge}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {tableTranslations[log.target_table] || log.target_table}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-amber-600">{log.target_name || '(Không rõ tên)'}</span>
                            <span className="text-muted-foreground text-[10px] block font-mono mt-0.5 max-w-xs truncate" title={log.target_id || ''}>
                              ID: {log.target_id || 'system'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedLog(log)}
                              className="h-7 px-2.5 text-xs"
                            >
                              Xem
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {/* ── SUBCOMPONENTS: DIALOGS & DIFF VIEWER ─────────────────────────── */}
      <AddEditAccountDialog
        key={dialogOpen ? (editingAccount?.id || 'new') : 'closed'}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingAccount={editingAccount}
        currentEmail={currentEmail}
        onSuccess={() => {
          fetchAccounts()
          if (activeTab === 'logs') {
            fetchLogs()
          }
        }}
      />

      <DeleteAccountDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        deleteTarget={deleteTarget}
        onSuccess={() => {
          fetchAccounts()
          if (activeTab === 'logs') {
            fetchLogs()
          }
        }}
      />

      <ActivityLogDetailsDialog
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
        selectedLog={selectedLog}
      />
    </div>
  )
}
