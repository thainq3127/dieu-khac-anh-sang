import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { deleteAccount } from '@/lib/admin-actions'
import { Profile } from './types'

type DeleteAccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  deleteTarget: Profile | null
  onSuccess: () => void
}

export default function DeleteAccountDialog({
  open,
  onOpenChange,
  deleteTarget,
  onSuccess
}: DeleteAccountDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteError(null)
    setDeleting(true)

    try {
      const res = await deleteAccount(deleteTarget.id)
      if (res.error) {
        setDeleteError(res.error)
      } else {
        onOpenChange(false)
        onSuccess()
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi khi xóa tài khoản.'
      setDeleteError(errMsg)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="w-5 h-5" />
            Xác nhận xóa tài khoản
          </DialogTitle>
          <DialogDescription>
            Hành động này <strong className="text-destructive">không thể phục hồi</strong>. Tài khoản đăng nhập storage Auth và hồ sơ liên quan của người dùng này sẽ bị xóa vĩnh viễn.
          </DialogDescription>
        </DialogHeader>

        {deleteError && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {deleteError}
          </div>
        )}

        {deleteTarget && (
          <div className="bg-muted p-3 rounded-lg border text-sm space-y-1.5">
            <div>Tên hiển thị: <span className="font-semibold">{deleteTarget.display_name || '(Chưa đặt)'}</span></div>
            <div>Email: <span className="font-mono">{deleteTarget.email}</span></div>
            <div>Quyền hạn: <span className="font-semibold text-amber-600 capitalize">{deleteTarget.role === 'admin' ? 'Quản trị viên (admin)' : 'Biên tập viên (edit)'}</span></div>
          </div>
        )}

        <DialogFooter className="pt-2 gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Quay lại
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="destructive"
          >
            {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Thực hiện xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
