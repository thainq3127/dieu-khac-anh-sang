import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CanvasDropZoneProps {
  id: string
  children: React.ReactNode
  isEmpty: boolean
  placeholderText?: string
  subText?: string
  className?: string
}

export default function CanvasDropZone({
  id,
  children,
  isEmpty,
  placeholderText,
  subText,
  className,
}: CanvasDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  // Determine if it is a nested drop zone (not root)
  const isRoot = id === 'root-canvas' || id === 'canvas-drop-zone'

  return (
    <div ref={setNodeRef} className={cn('min-h-16 transition-all duration-200', className)}>
      {isEmpty ? (
        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 p-6',
            isRoot ? 'min-h-64' : 'min-h-16 py-8 bg-muted/20 border-muted-foreground/20',
            isOver ? 'border-amber-500 bg-amber-500/5 scale-[1.01]' : 'border-border',
          )}
        >
          <Inbox
            className={cn(
              'mb-2 transition-colors shrink-0',
              isRoot ? 'w-10 h-10' : 'w-6 h-6',
              isOver ? 'text-amber-500' : 'text-muted-foreground/30',
            )}
          />
          <p
            className={cn(
              'font-medium transition-colors text-center leading-tight',
              isRoot ? 'text-sm' : 'text-xs',
              isOver ? 'text-amber-600' : 'text-muted-foreground',
            )}
          >
            {isOver
              ? 'Thả element vào đây'
              : placeholderText || (isRoot ? 'Kéo element vào đây' : 'Thả nội dung vào cột')}
          </p>
          {isRoot && (
            <p className="text-xs text-muted-foreground/60 mt-1.5 text-center">
              {subText || 'hoặc nhấn element từ palette bên trái'}
            </p>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'min-h-16 rounded-2xl transition-all duration-200 p-1',
            isOver && 'ring-2 ring-amber-500/30 ring-inset bg-amber-500/3',
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}
