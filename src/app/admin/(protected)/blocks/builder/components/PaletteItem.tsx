import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { ElementKind, DragData } from '../types'

interface PaletteItemProps {
  kind: ElementKind
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export default function PaletteItem({ kind, label, icon: Icon }: PaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${kind}`,
    data: { source: 'palette', kind } as DragData,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border select-none',
        'cursor-grab active:cursor-grabbing',
        'hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-600 transition-all duration-150',
        'text-muted-foreground text-xs font-medium bg-background',
        isDragging && 'opacity-40 scale-95',
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
    </div>
  )
}
