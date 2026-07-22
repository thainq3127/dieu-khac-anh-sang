import React from 'react'
import { Check, Trash2, Edit, ArrowRight } from 'lucide-react'

type DataDiffViewerProps = {
  oldData: Record<string, unknown> | null | undefined
  newData: Record<string, unknown> | null | undefined
}

export default function DataDiffViewer({ oldData, newData }: DataDiffViewerProps) {
  if (!oldData && !newData) {
    return <div className="text-muted-foreground text-xs italic">Không có dữ liệu thay đổi.</div>
  }

  // INSERT
  if (!oldData) {
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> Tạo mới bản ghi:
        </div>
        <pre className="text-xs bg-muted p-3.5 rounded-lg overflow-auto max-h-[350px] border font-mono leading-relaxed">
          {JSON.stringify(newData, null, 2)}
        </pre>
      </div>
    )
  }

  // DELETE
  if (!newData) {
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-destructive flex items-center gap-1">
          <Trash2 className="w-3.5 h-3.5" /> Đã xóa bản ghi:
        </div>
        <pre className="text-xs bg-muted p-3.5 rounded-lg overflow-auto max-h-[350px] border font-mono leading-relaxed">
          {JSON.stringify(oldData, null, 2)}
        </pre>
      </div>
    )
  }

  // UPDATE
  const diffKeys: string[] = []
  const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]))
  
  allKeys.forEach(key => {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      diffKeys.push(key)
    }
  })

  return (
    <div className="space-y-4">
      {diffKeys.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-amber-600 flex items-center gap-1">
            <Edit className="w-3.5 h-3.5" /> Các cột thay đổi ({diffKeys.length}):
          </div>
          <div className="border rounded-lg overflow-hidden divide-y text-xs">
            {diffKeys.map(key => {
              const oldVal = oldData[key]
              const newVal = newData[key]
              return (
                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-muted/20">
                  <div className="font-mono font-semibold text-muted-foreground break-words self-center">{key}</div>
                  
                  {/* Old Data */}
                  <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded p-2 font-mono break-all line-through decoration-destructive/50">
                    {typeof oldVal === 'object' && oldVal !== null 
                      ? JSON.stringify(oldVal, null, 1) 
                      : (oldVal === null ? 'NULL' : String(oldVal))
                    }
                  </div>
                  
                  {/* New Data */}
                  <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded p-2 font-mono break-all flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-amber-500/70" />
                    <span className="w-full">
                      {typeof newVal === 'object' && newVal !== null 
                        ? JSON.stringify(newVal, null, 1) 
                        : (newVal === null ? 'NULL' : String(newVal))
                      }
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground italic">Không phát hiện thay đổi cụ thể trên các trường.</div>
      )}

      {/* Raw Collapsible Data views */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Chi tiết dữ liệu cũ</div>
          <pre className="text-[11px] bg-muted p-3 rounded-lg overflow-auto max-h-[200px] border font-mono">
            {JSON.stringify(oldData, null, 2)}
          </pre>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Chi tiết dữ liệu mới</div>
          <pre className="text-[11px] bg-muted p-3 rounded-lg overflow-auto max-h-[200px] border font-mono">
            {JSON.stringify(newData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
