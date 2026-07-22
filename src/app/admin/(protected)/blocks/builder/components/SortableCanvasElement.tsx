import React, { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { CanvasElement, DragData } from '../types'
import ElementPreview from './ElementPreview'

interface SortableCanvasElementProps {
  element: CanvasElement
  isSelected: boolean
  isFirst: boolean
  isLast: boolean
  isPreviewMode: boolean
  parentId: string | null
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleVis: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onUpdateProps?: (props: Record<string, unknown>, children?: CanvasElement[]) => void
  renderElement?: (el: CanvasElement, index: number, parentId: string) => React.ReactNode
  isLocked?: boolean
}

const SortableCanvasElement = memo(function SortableCanvasElement({
  element,
  isSelected,
  isFirst,
  isLast,
  isPreviewMode,
  parentId,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVis,
  onMoveUp,
  onMoveDown,
  onUpdateProps,
  renderElement,
  isLocked = false,
}: SortableCanvasElementProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    data: { source: 'canvas', elementId: element.id, parentId } as DragData,
  })

  const isColumn = element.kind === 'column'

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (!element.visible && isPreviewMode) return null

  // Columns are layout structural columns. Their drag/selection and sizing are custom.
  const isStructural = element.kind === 'columns' || element.kind === 'column' || element.kind === 'container'

  // If in preview mode, just render the element preview without toolbars and borders
  if (isPreviewMode) {
    return (
      <ElementPreview
        element={element}
        isLocked={isLocked}
        isPreviewMode={true}
        renderElement={renderElement}
        onUpdateProps={onUpdateProps}
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'canvas-element-group group relative rounded-xl border transition-all duration-150 cursor-pointer',
        isColumn
          ? cn('w-full border-dashed border-muted-foreground/20 hover:border-amber-500/30', `col-grid-${element.id}`)
          : 'w-full border-transparent hover:border-border/70',
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]'
          : '',
        isDragging && 'opacity-30 z-50',
        !element.visible && 'opacity-50',
      )}
      onClick={e => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {/* Floating toolbar */}
      <div
        className={cn(
          'canvas-element-toolbar absolute -top-9 left-0 right-0 flex items-center gap-0.5 px-1.5 py-1',
          'bg-background border border-border rounded-lg shadow-md z-20',
          'opacity-0 transition-opacity duration-150 pointer-events-none',
          isSelected && 'opacity-100 pointer-events-auto',
        )}
      >
        {/* Drag handle */}
        <div
          {...listeners}
          {...attributes}
          className="p-1 rounded cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          title="Kéo để di chuyển"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <Separator orientation="vertical" className="h-4 mx-0.5 shrink-0" />

        {/* Up/Down buttons for quick movement (hide for column since columns layout order is structured horizontally) */}
        {!isColumn && (
          <>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onMoveUp()
              }}
              disabled={isFirst}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-25 text-xs font-bold shrink-0"
              title="Lên"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onMoveDown()
              }}
              disabled={isLast}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-25 text-xs font-bold shrink-0"
              title="Xuống"
            >
              ↓
            </button>
            <Separator orientation="vertical" className="h-4 mx-0.5 shrink-0" />
          </>
        )}

        <div className="flex-1" />

        {/* Visibility Toggle */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            onToggleVis()
          }}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          title={element.visible ? 'Ẩn' : 'Hiện'}
        >
          {element.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Duplicate (hide for column to prevent breaking layout column counts unexpectedly - they are managed by column properties) */}
        {!isColumn && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onDuplicate()
            }}
            className="p-1 rounded text-muted-foreground hover:text-amber-500 hover:bg-amber-50 transition-colors shrink-0"
            title="Nhân bản"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Delete */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          title="Xoá"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Kind badge */}
      <Badge
        variant="secondary"
        className={cn(
          'absolute top-2 right-2 z-10 text-[9px] px-1.5 py-0.5 uppercase tracking-wider pointer-events-none',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          isSelected && 'opacity-100',
        )}
      >
        {element.kind}
        {element.animation.effect !== 'none' && <Sparkles className="w-2.5 h-2.5 ml-1 text-amber-500" />}
      </Badge>

      {/* Element content container */}
      <div className={cn(isStructural ? 'p-2' : 'p-5')}>
        <ElementPreview
          element={element}
          isLocked={isLocked}
          isPreviewMode={false}
          renderElement={renderElement}
          onUpdateProps={onUpdateProps}
        />
      </div>
    </div>
  )
})

export default SortableCanvasElement
