import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'
import DataDiffViewer from './DataDiffViewer'
import { ActivityLog } from './types'

type ActivityLogDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedLog: ActivityLog | null
}

export default function ActivityLogDetailsDialog({
  open,
  onOpenChange,
  selectedLog
}: ActivityLogDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-amber-600 flex items-center gap-2 text-lg font-semibold">
            <Activity className="w-5 h-5" />
            Chi tiết thay đổi dữ liệu
          </DialogTitle>
          <DialogDescription className="text-xs">
            Mã nhật ký: {selectedLog?.id}
          </DialogDescription>
        </DialogHeader>

        {selectedLog && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-muted/40 p-3 rounded-lg border">
              <div>
                <div className="text-muted-foreground uppercase font-semibold">Tài khoản</div>
                <div className="font-mono mt-0.5 break-all">{selectedLog.user_email}</div>
              </div>
              <div>
                <div className="text-muted-foreground uppercase font-semibold">Hành động</div>
                <div className="mt-1">
                  {selectedLog.action === 'INSERT' && <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">INSERT</Badge>}
                  {selectedLog.action === 'UPDATE' && <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">UPDATE</Badge>}
                  {selectedLog.action === 'DELETE' && <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">DELETE</Badge>}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground uppercase font-semibold">Bảng dữ liệu</div>
                <div className="font-mono mt-0.5 break-all">{selectedLog.target_table}</div>
              </div>
              <div>
                <div className="text-muted-foreground uppercase font-semibold">Thời gian</div>
                <div className="mt-0.5 font-mono">{new Date(selectedLog.created_at).toLocaleString('vi-VN')}</div>
              </div>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Đối tượng tác động: </span>
              <span className="font-semibold text-amber-600 font-mono">{selectedLog.target_name || '(Không rõ tên)'}</span>
              <span className="text-xs text-muted-foreground block font-mono">ID đối tượng: {selectedLog.target_id || 'system'}</span>
            </div>

            {/* Data Diff */}
            <div className="border-t pt-3">
              <DataDiffViewer oldData={selectedLog.old_data} newData={selectedLog.new_data} />
            </div>
          </div>
        )}

        <div className="border-t pt-3 flex justify-end">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
