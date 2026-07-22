import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle } from 'lucide-react'
import { saveAccount } from '@/lib/admin-actions'
import { Profile } from './types'

type AddEditAccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingAccount: Profile | null
  currentEmail: string | null
  onSuccess: () => void
}

export default function AddEditAccountDialog({
  open,
  onOpenChange,
  editingAccount,
  currentEmail,
  onSuccess
}: AddEditAccountDialogProps) {
  const [emailInput, setEmailInput] = useState(editingAccount?.email || '')
  const [displayNameInput, setDisplayNameInput] = useState(editingAccount?.display_name || '')
  const [passwordInput, setPasswordInput] = useState('')
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('')
  const [roleInput, setRoleInput] = useState<'admin' | 'edit'>(editingAccount?.role || 'edit')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!displayNameInput.trim()) {
      setSubmitError('Vui lòng nhập tên hiển thị.')
      return
    }

    if (!emailInput.trim()) {
      setSubmitError('Vui lòng nhập email.')
      return
    }

    if (!editingAccount) {
      if (!passwordInput) {
        setSubmitError('Mật khẩu là bắt buộc khi tạo tài khoản.')
        return
      }
      if (passwordInput.length < 6) {
        setSubmitError('Mật khẩu phải có độ dài tối thiểu 6 ký tự.')
        return
      }
      if (passwordInput !== confirmPasswordInput) {
        setSubmitError('Mật khẩu nhập lại không khớp.')
        return
      }
    } else {
      if (passwordInput) {
        if (passwordInput.length < 6) {
          setSubmitError('Mật khẩu mới phải có độ dài tối thiểu 6 ký tự.')
          return
        }
        if (passwordInput !== confirmPasswordInput) {
          setSubmitError('Mật khẩu nhập lại không khớp.')
          return
        }
      }
    }

    try {
      setSubmitting(true)
      const res = await saveAccount({
        id: editingAccount?.id,
        email: emailInput.trim(),
        displayName: displayNameInput.trim(),
        password: passwordInput || undefined,
        role: roleInput
      })

      if (res.error) {
        setSubmitError(res.error)
      } else {
        onOpenChange(false)
        onSuccess()
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi hệ thống khi lưu tài khoản.'
      setSubmitError(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editingAccount ? 'Cập nhật thông tin tài khoản' : 'Thêm tài khoản Biên tập viên'}
          </DialogTitle>
          <DialogDescription>
            {editingAccount
              ? `Chỉnh sửa thông tin cơ bản cho tài khoản ${editingAccount.email}`
              : 'Tạo tài khoản mới cho Biên tập viên (edit). Mật khẩu sẽ được lưu dạng thô trong hồ sơ để Admin xem lại.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {submitError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="displayNameInput" className="text-xs font-semibold">Tên hiển thị <span className="text-destructive">*</span></Label>
            <Input
              id="displayNameInput"
              type="text"
              required
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emailInput" className="text-xs font-semibold">Email đăng nhập <span className="text-destructive">*</span></Label>
            <Input
              id="emailInput"
              type="email"
              required
              disabled={!!editingAccount} 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="admin@vanhoacham.vn"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="roleInput" className="text-xs font-semibold">Quyền hạn</Label>
            <select
              id="roleInput"
              value={roleInput}
              disabled={editingAccount?.email === currentEmail}
              onChange={(e) => setRoleInput(e.target.value as 'admin' | 'edit')}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <option value="edit">Biên tập viên (edit)</option>
              <option value="admin">Quản trị viên (admin)</option>
            </select>
          </div>

          <div className="border-t border-border pt-3 space-y-3">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              {editingAccount ? 'Đặt lại mật khẩu (Để trống nếu giữ nguyên)' : 'Thiết lập mật khẩu'}
            </p>
            
            <div className="space-y-1.5">
              <Label htmlFor="passwordInput" className="text-xs">
                Mật khẩu {!editingAccount && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="passwordInput"
                type="password"
                required={!editingAccount}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={editingAccount ? "Mật khẩu mới (tối thiểu 6 ký tự)" : "Nhập mật khẩu (tối thiểu 6 ký tự)"}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPasswordInput" className="text-xs">
                Nhập lại mật khẩu {!editingAccount && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="confirmPasswordInput"
                type="password"
                required={!editingAccount}
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Xác nhận lại mật khẩu"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingAccount ? 'Cập nhật' : 'Tạo tài khoản'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
