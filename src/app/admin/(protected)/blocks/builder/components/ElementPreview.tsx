import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Image as ImgIcon, Play, Globe, Map, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CanvasElement } from '../types'
import { getStyleObject, COLUMN_LAYOUTS, newId, getDefaultAnimation, getDefaultStyles } from '../constants'

interface ElementPreviewProps {
  element: CanvasElement
  isPreviewMode?: boolean
  renderElement?: (el: CanvasElement, index: number, parentId: string) => React.ReactNode
  onUpdateProps?: (props: Record<string, unknown>, children?: CanvasElement[]) => void
  isLocked?: boolean
}

export default function ElementPreview({
  element,
  isPreviewMode = false,
  renderElement,
  onUpdateProps,
  isLocked = false,
}: ElementPreviewProps) {
  const { kind, props, styles } = element
  const styleObject = getStyleObject(styles)
  const [resizingItem, setResizingItem] = useState<{ id: string; startCol: number; startRow: number } | null>(null)

  const columnsList = useMemo(() => element.children || [], [element.children])

  const handleDeleteCell = useCallback((colId: string) => {
    const nextChildren = columnsList.filter(item => item.id !== colId)
    onUpdateProps?.(props, nextChildren)
  }, [columnsList, props, onUpdateProps])

  useEffect(() => {
    const handleStartResize = (e: Event) => {
      const { colId, startCol, startRow } = (e as CustomEvent).detail
      if (columnsList.some(child => child.id === colId)) {
        setResizingItem({ id: colId, startCol, startRow })
      }
    }
    const handleDeleteColumn = (e: Event) => {
      const { colId } = (e as CustomEvent).detail
      if (columnsList.some(child => child.id === colId)) {
        handleDeleteCell(colId)
      }
    }
    window.addEventListener('start-column-resize', handleStartResize)
    window.addEventListener('delete-column-item', handleDeleteColumn)
    return () => {
      window.removeEventListener('start-column-resize', handleStartResize)
      window.removeEventListener('delete-column-item', handleDeleteColumn)
    }
  }, [columnsList, handleDeleteCell])

  useEffect(() => {
    if (!resizingItem) return
    const handleMouseUp = () => setResizingItem(null)
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [resizingItem])

  switch (kind) {
    case 'heading': {
      const level = (props.level as string) || 'h2'
      const alignMap: Record<string, string> = { left: 'text-left', center: 'text-center', right: 'text-right' }
      const Tag = level as React.ElementType
      
      // Default classes for fallback sizing if styles doesn't define size
      const defaultSizes: Record<string, string> = {
        h1: 'text-4xl',
        h2: 'text-3xl',
        h3: 'text-2xl',
        h4: 'text-xl',
        h5: 'text-lg',
        h6: 'text-base',
      }

      return (
        <Tag
          className={cn(
            'font-bold leading-tight text-foreground transition-all duration-150',
            !styles?.fontSize && defaultSizes[level],
            !styles?.textAlign && alignMap[(props.align as string) ?? 'left']
          )}
          style={styleObject}
        >
          {(props.text as string) || 'Tiêu đề'}
        </Tag>
      )
    }

    case 'paragraph': {
      const alignMap: Record<string, string> = { left: 'text-left', center: 'text-center', right: 'text-right' }
      return (
        <div
          className={cn(
            'text-base leading-relaxed text-foreground/75 transition-all duration-150',
            !styles?.textAlign && alignMap[(props.align as string) ?? 'left']
          )}
          style={styleObject}
        >
          {(props.text as string) || 'Đoạn văn bản...'}
        </div>
      )
    }

    case 'quote': {
      const author = props.author as string | undefined
      return (
        <div
          className="border-l-4 border-amber-500 pl-5 py-1 space-y-1 transition-all duration-150"
          style={styleObject}
        >
          <p className="text-base italic text-foreground/80">&ldquo;{(props.text as string) || 'Trích dẫn...'}&rdquo;</p>
          {!!author && <p className="text-sm font-semibold not-italic text-foreground/60">— {author}</p>}
        </div>
      )
    }

    case 'list': {
      const items = (props.items as string[]) || []
      return (
        <ul
          className={cn(
            'space-y-1.5 transition-all duration-150',
            props.style === 'ordered' ? 'list-decimal list-inside' : 'list-disc list-inside'
          )}
          style={styleObject}
        >
          {items.map((item, i) => (
            <li key={i} className="text-sm text-foreground/75 inline-block w-full">
              <span className="mr-2 opacity-55">{props.style === 'ordered' ? `${i + 1}.` : '•'}</span>
              {item}
            </li>
          ))}
        </ul>
      )
    }

    case 'image': {
      const aspectClass =
        props.aspectRatio === '1/1'
          ? 'aspect-square'
          : props.aspectRatio === '4/3'
          ? 'aspect-4/3'
          : props.aspectRatio === 'auto'
          ? 'h-auto'
          : 'aspect-video'

      const { marginTop, marginBottom, ...frameStyles } = styleObject
      const hasCustomBorder = !!styles?.borderColor || !!styles?.borderWidth
      const hasCustomRadius = styles?.borderRadius !== undefined

      return (
        <div className="space-y-1.5" style={{ marginTop, marginBottom }}>
          <div
            className={cn(
              'relative bg-muted overflow-hidden flex items-center justify-center',
              !hasCustomRadius && 'rounded-xl',
              !hasCustomBorder && 'border',
              aspectClass
            )}
            style={frameStyles}
          >
            {props.src ? (
              <img src={props.src as string} alt={(props.alt as string) || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground/40">
                <ImgIcon className="w-10 h-10" />
                <span className="text-xs font-medium">Hình ảnh</span>
              </div>
            )}
            {!!(props.caption as string | undefined) && (
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-2 text-center backdrop-blur-xs">
                {props.caption as string}
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'video':
      return (
        <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center border" style={styleObject}>
          {props.youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${props.youtubeId as string}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={(props.title as string) || 'YouTube video'}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/30 py-8">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Play className="w-6 h-6 ml-0.5 text-white/80" />
              </div>
              <span className="text-xs">Video YouTube</span>
            </div>
          )}
        </div>
      )

    case 'button': {
      const variantClass: Record<string, string> = {
        primary: 'bg-amber-600 text-black hover:bg-amber-500 shadow-sm border border-amber-600',
        secondary: 'border-2 border-amber-600 text-amber-700 bg-transparent hover:bg-amber-500/5',
        ghost: 'text-amber-700 underline underline-offset-4 bg-transparent hover:bg-amber-500/5 border-transparent',
      }
      const sizeClass: Record<string, string> = {
        sm: 'px-4 py-1.5 text-sm',
        md: 'px-6 py-2.5 text-base',
        lg: 'px-8 py-3.5 text-lg',
      }
      const alignClass: Record<string, string> = { left: 'justify-start', center: 'justify-center', right: 'justify-end' }
      
      const { marginTop, marginBottom, ...buttonStyles } = styleObject
      const hasCustomRadius = styles?.borderRadius !== undefined

      return (
        <div
          className={cn('flex w-full', !styles?.textAlign && alignClass[(props.align as string) ?? 'left'])}
          style={{
            textAlign: styles?.textAlign,
            marginTop,
            marginBottom,
          }}
        >
          <button
            className={cn(
              'font-semibold transition-all duration-150',
              !hasCustomRadius && 'rounded-lg',
              variantClass[(props.variant as string) ?? 'primary'],
              sizeClass[(props.size as string) ?? 'md']
            )}
            style={buttonStyles}
          >
            {(props.text as string) || 'Nút bấm'}
          </button>
        </div>
      )
    }

    case 'badge': {
      const { marginTop, marginBottom, ...badgeStyles } = styleObject
      const hasCustomRadius = styles?.borderRadius !== undefined
      return (
        <div style={{ marginTop, marginBottom }}>
          <span
            className={cn(
              'inline-flex items-center px-3 py-1 text-xs font-bold tracking-widest uppercase bg-amber-500/15 text-amber-700 border border-amber-500/25',
              !hasCustomRadius && 'rounded-full'
            )}
            style={badgeStyles}
          >
            {(props.text as string) || 'NHÃN'}
          </span>
        </div>
      )
    }

    case 'divider': {
      const dividerStyle = props.style === 'dashed' ? 'border-dashed' : props.style === 'dotted' ? 'border-dotted' : 'border-solid'
      const { marginTop, marginBottom, borderWidth, ...lineStyles } = styleObject
      const borderTopWidth = borderWidth !== undefined ? borderWidth : undefined
      return (
        <div className="py-2 w-full" style={{ marginTop, marginBottom }}>
          <div
            className={cn('w-full border-t border-border', dividerStyle)}
            style={{
              ...lineStyles,
              borderTopWidth,
            }}
          />
        </div>
      )
    }

    case 'spacer':
      return (
        <div
          className={cn(
            'flex items-center justify-center text-muted-foreground/30 rounded-lg',
            !isPreviewMode && 'border border-dashed border-border'
          )}
          style={{ height: `${Math.min((props.height as number) || 48, 400)}px`, ...styleObject }}
        >
          {!isPreviewMode && (
            <>
              <span className="text-[10px] font-mono">Spacer: {(props.height as number) || 48}px</span>
            </>
          )}
        </div>
      )

    case 'card': {
      const cardImg = props.image as string | undefined
      const cardTag = props.tag as string | undefined
      return (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm max-w-sm transition-all" style={styleObject}>
          {cardImg ? (
            <div className="aspect-video bg-muted overflow-hidden border-b">
              <img src={cardImg} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground/30 border-b">
              <ImgIcon className="w-8 h-8" />
            </div>
          )}
          <div className="p-4 space-y-1.5">
            {!!cardTag && <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase">{cardTag}</span>}
            <h3 className="font-semibold text-sm">{(props.title as string) || 'Tiêu đề thẻ'}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{(props.body as string) || 'Nội dung...'}</p>
          </div>
        </div>
      )
    }

    case 'icon-feature':
      return (
        <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card transition-all" style={styleObject}>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shrink-0">
            {(props.icon as string) || '⭐'}
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">{(props.title as string) || 'Tiêu đề'}</h4>
            <p className="text-xs text-muted-foreground">{(props.body as string) || 'Mô tả...'}</p>
          </div>
        </div>
      )

    case 'container':
      return (
        <div
          className={cn(
            'w-full transition-all duration-150',
            !isPreviewMode && 'border border-dashed border-muted-foreground/30 min-h-16'
          )}
          style={styleObject}
        >
          {renderElement && element.children && element.children.length > 0 ? (
            <div className="space-y-2">
              {element.children.map((child, index) => renderElement(child, index, element.id))}
            </div>
          ) : (
            !isPreviewMode && (
              <div className="text-[10px] text-muted-foreground/50 py-4 text-center select-none font-mono">
                Container Box trống (Thả elements vào đây)
              </div>
            )
          )}
        </div>
      )

    case 'columns': {
      const gap = (props.gap as number) || 16
      const hasChildren = element.children && element.children.length > 0
      const columnsList = element.children || []

      // 1. Create a 4x5 grid representation
      const grid: (string | null)[][] = Array(4).fill(null).map(() => Array(5).fill(null))
      columnsList.forEach(col => {
        const colStart = (col.props.colStart as number) || 1
        const colSpan = (col.props.colSpan as number) || 1
        const rowStart = (col.props.rowStart as number) || 1
        const rowSpan = (col.props.rowSpan as number) || 1
        
        for (let r = rowStart; r < rowStart + rowSpan; r++) {
          for (let c = colStart; c < colStart + colSpan; c++) {
            if (r >= 1 && r <= 4 && c >= 1 && c <= 5) {
              grid[r - 1][c - 1] = col.id
            }
          }
        }
      })

      // Resize logic
      const handleCellMouseEnter = (c: number, r: number) => {
        if (!resizingItem) return
        const { id, startCol, startRow } = resizingItem
        
        const newColSpan = Math.max(1, c - startCol + 1)
        const newRowSpan = Math.max(1, r - startRow + 1)
        
        let hasOverlap = false
        for (let row = startRow; row < startRow + newRowSpan; row++) {
          for (let col = startCol; col < startCol + newColSpan; col++) {
            if (row >= 1 && row <= 4 && col >= 1 && col <= 5) {
              const occupant = grid[row - 1][col - 1]
              if (occupant && occupant !== id) {
                hasOverlap = true
                break
              }
            }
          }
          if (hasOverlap) break
        }
        
        if (!hasOverlap) {
          const nextChildren = columnsList.map(item => {
            if (item.id === id) {
              return {
                ...item,
                props: {
                  ...item.props,
                  colSpan: newColSpan,
                  rowSpan: newRowSpan,
                }
              }
            }
            return item
          })
          onUpdateProps?.(props, nextChildren)
        }
      }

      const handleAddCell = (c: number, r: number) => {
        const nextLabel = (columnsList.length + 1).toString()
        const newCol: CanvasElement = {
          id: newId(),
          kind: 'column',
          props: {
            colStart: c,
            colSpan: 1,
            rowStart: r,
            rowSpan: 1,
            label: nextLabel
          },
          animation: getDefaultAnimation(),
          styles: getDefaultStyles('column'),
          visible: true,
          children: [],
        }
        const nextChildren = [...columnsList, newCol]
        onUpdateProps?.({ ...props, layout: 'custom-grid' }, nextChildren)
      }

      const handleLayoutSelect = (layoutId: string) => {
        const selectedLayout = COLUMN_LAYOUTS.find(l => l.id === layoutId)
        if (!selectedLayout) return

        const nextChildren: CanvasElement[] = []
        if (selectedLayout.grid) {
          selectedLayout.grid.forEach((g, idx) => {
            nextChildren.push({
              id: newId(),
              kind: 'column',
              props: {
                colStart: g.colStart,
                colSpan: g.colSpan,
                rowStart: g.rowStart,
                rowSpan: g.rowSpan,
                label: (idx + 1).toString()
              },
              animation: getDefaultAnimation(),
              styles: getDefaultStyles('column'),
              visible: true,
              children: [],
            })
          })
        }
        onUpdateProps?.(
          {
            ...props,
            layout: layoutId,
            columns: selectedLayout.cols,
          },
          nextChildren,
        )
      }

      const handleStartCustomGrid = () => {
        onUpdateProps?.(
          {
            ...props,
            layout: 'custom-grid',
            columns: 0,
          },
          [],
        )
      }

      // Dynamic styles for desktop placement
      const colStyles = columnsList.map(col => {
        const colStart = (col.props.colStart as number) || 1
        const colSpan = (col.props.colSpan as number) || 1
        const rowStart = (col.props.rowStart as number) || 1
        const rowSpan = (col.props.rowSpan as number) || 1
        return `
          @media (min-width: 768px) {
            .col-grid-${col.id} {
              grid-column: ${colStart} / span ${colSpan} !important;
              grid-row: ${rowStart} / span ${rowSpan} !important;
            }
          }
        `
      }).join('\n')

      if (!isPreviewMode && !hasChildren && props.layout !== 'custom-grid') {
        return (
          <div className="flex flex-col w-full transition-all duration-150 border-2 border-dashed border-amber-500/30 rounded-2xl bg-amber-500/[0.02] p-6 text-center select-none">
            <div className="flex flex-col items-center justify-center space-y-2 mb-5">
              <div className="p-3 bg-amber-500/10 rounded-full text-amber-600">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Chọn bố cục chia cột</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Chọn một bố cục mẫu có sẵn hoặc click thiết kế tự do để bắt đầu vẽ lưới.
              </p>
            </div>

            {/* Presets grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto w-full mb-6">
              {COLUMN_LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => handleLayoutSelect(layout.id)}
                  className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-border bg-background hover:border-amber-500 hover:ring-2 hover:ring-amber-500/10 text-left transition-all shadow-xs group/btn cursor-pointer"
                >
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-semibold text-foreground truncate">
                      {layout.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-border/60 max-w-xl mx-auto w-full flex justify-center">
              <button
                type="button"
                onClick={handleStartCustomGrid}
                className="h-9 px-6 rounded-lg bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Thiết kế tự do (Lưới 5x4)
              </button>
            </div>
          </div>
        )
      }

      const isLocked = props.isLocked !== false

      if (!isPreviewMode && isLocked && !hasChildren) {
        return (
          <div className="flex flex-col w-full border border-dashed border-muted-foreground/30 p-4 rounded-xl text-center text-xs text-muted-foreground bg-muted/5 gap-2">
            <span>Bố cục trống (Chưa có cột nào)</span>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onUpdateProps?.({ ...props, isLocked: false })}
                className="h-7 px-3 rounded-lg border border-amber-500/25 bg-amber-500/[0.02] hover:bg-amber-500/10 text-amber-700 text-[10px] font-bold transition-all cursor-pointer"
              >
                ⚙ Thiết kế lại (Mở khóa lưới)
              </button>
            </div>
          </div>
        )
      }

      return (
        <div className="relative w-full flex flex-col gap-3">
          <div
            className={cn(
              'grid grid-cols-1 md:grid-cols-5 w-full transition-all duration-150 relative',
              !isPreviewMode && !isLocked
                ? 'md:grid-rows-4 border border-dashed border-amber-500/35 p-3 rounded-2xl bg-amber-500/[0.01] min-h-[300px]'
                : 'border border-transparent'
            )}
            style={{ gap: `${gap}px`, ...styleObject }}
          >
            <style dangerouslySetInnerHTML={{ __html: colStyles }} />

            {/* Render active columns */}
            {hasChildren && element.children!.map((col, index) => {
              return renderElement ? renderElement(col, index, element.id) : null
            })}

            {/* Render empty cells in edit mode when unlocked */}
            {!isPreviewMode && !isLocked && Array.from({ length: 4 }).map((_, rIdx) => {
              const r = rIdx + 1
              return Array.from({ length: 5 }).map((_, cIdx) => {
                const c = cIdx + 1
                const occupant = grid[r - 1][c - 1]
                if (occupant === null) {
                  return (
                    <div
                      key={`empty-${c}-${r}`}
                      className="h-16 border border-dashed border-muted-foreground/15 hover:border-amber-500/40 bg-muted/[0.03] hover:bg-amber-500/[0.02] rounded-lg flex items-center justify-center transition-all cursor-pointer group"
                      style={{
                        gridColumn: `${c} / span 1`,
                        gridRow: `${r} / span 1`,
                      }}
                      onClick={() => handleAddCell(c, r)}
                    >
                      <span className="text-muted-foreground/30 group-hover:text-amber-600 text-[10px] font-bold font-mono">+</span>
                    </div>
                  )
                }
                return null
              })
            })}

            {/* Transparent resize targets overlay when dragging */}
            {!isPreviewMode && !isLocked && resizingItem && (
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 gap-3 z-50 pointer-events-auto bg-amber-500/[0.01] cursor-se-resize">
                {Array.from({ length: 4 }).map((_, rIdx) => {
                  const r = rIdx + 1
                  return Array.from({ length: 5 }).map((_, cIdx) => {
                    const c = cIdx + 1
                    return (
                      <div
                        key={`resize-target-${c}-${r}`}
                        onMouseEnter={() => handleCellMouseEnter(c, r)}
                        className="w-full h-full border border-dashed border-amber-500/[0.03] hover:bg-amber-500/[0.03]"
                        style={{
                          gridColumn: `${c} / span 1`,
                          gridRow: `${r} / span 1`,
                        }}
                      />
                    )
                  })
                })}
              </div>
            )}
          </div>

          {/* Lock / Unlock controls */}
          {!isPreviewMode && (
            <div className="flex justify-end gap-2 text-right">
              {isLocked ? (
                <button
                  type="button"
                  onClick={() => onUpdateProps?.({ ...props, isLocked: false })}
                  className="h-7 px-3 rounded-lg border border-amber-500/25 bg-amber-500/[0.02] hover:bg-amber-500/10 text-amber-700 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>⚙</span> Thiết kế lại (Mở khóa lưới)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onUpdateProps?.({ ...props, isLocked: true })}
                  className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>✓</span> Xác nhận bố cục (Chốt lưới)
                </button>
              )}
            </div>
          )}
        </div>
      )
    }
    case 'column': {
      const colStart = (props.colStart as number) || 1
      const rowStart = (props.rowStart as number) || 1

      const startResize = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        const event = new CustomEvent('start-column-resize', {
          detail: { colId: element.id, startCol: colStart, startRow: rowStart }
        })
        window.dispatchEvent(event)
      }

      const deleteCol = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        const event = new CustomEvent('delete-column-item', {
          detail: { colId: element.id }
        })
        window.dispatchEvent(event)
      }

      return (
        <div
          className={cn(
            'w-full h-full transition-all duration-150 relative col-grid-item-inner',
            `col-grid-${element.id}`,
            !isPreviewMode && 'min-h-16 border border-dashed border-amber-500/25 bg-amber-500/[0.01] hover:bg-amber-500/[0.03] rounded-lg'
          )}
          style={styleObject}
        >
          {/* Active column label/number */}
          {!isPreviewMode && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 pointer-events-none">
              <span className="w-5 h-5 bg-amber-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {(props.label as string) || ''}
              </span>
            </div>
          )}

          {/* Delete button (pink X at top-right) */}
          {!isPreviewMode && !isLocked && (
            <button
              type="button"
              onClick={deleteCol}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md border border-white transition-all z-30 select-none cursor-pointer"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" className="fill-current text-white font-bold">
                <path d="M7 1L6 0 4 2 2 0 1 1 3 3 1 5 2 6 4 4 6 6 7 5 5 3z" />
              </svg>
            </button>
          )}

          {/* Render children elements inside column */}
          {renderElement && element.children && element.children.length > 0 ? (
            <div className="space-y-2 p-3">
              {element.children.map((child, index) => renderElement(child, index, element.id))}
            </div>
          ) : (
            !isPreviewMode && (
              <div className="text-[10px] text-muted-foreground/30 py-5 text-center select-none font-mono">
                Cột trống
              </div>
            )
          )}

          {/* Resize handle (L-shaped handle at bottom-right) */}
          {!isPreviewMode && !isLocked && (
            <div
              className="absolute bottom-1.5 right-1.5 w-4 h-4 cursor-se-resize flex items-center justify-center text-muted-foreground hover:text-foreground active:text-foreground z-30 select-none"
              onMouseDown={startResize}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" className="fill-current text-muted-foreground hover:text-foreground">
                <path d="M6 0v6H0v2h8V0z" />
              </svg>
            </div>
          )}
        </div>
      )
    }

    case 'marquee': {
      const MarqueeTag = 'marquee' as unknown as React.ComponentType<{
        scrollAmount?: number
        direction?: string
        className?: string
        children?: React.ReactNode
        style?: React.CSSProperties
      }>
      const { marginTop, marginBottom, ...marqueeStyles } = styleObject
      const hasCustomRadius = styles?.borderRadius !== undefined
      return (
        <div style={{ marginTop, marginBottom }} className="w-full overflow-hidden">
          <MarqueeTag
            scrollAmount={props.speed as number || 5}
            direction={props.direction as string || 'left'}
            className={cn(
              'w-full py-1.5 px-3 bg-amber-500/10 border-y border-amber-500/20 text-amber-700 font-medium text-xs block',
              !hasCustomRadius && 'rounded'
            )}
            style={marqueeStyles}
          >
            {(props.text as string) || 'Dòng chữ chạy...'}
          </MarqueeTag>
        </div>
      )
    }

    case 'iframe':
      return (
        <div
          className="relative border rounded-xl overflow-hidden bg-muted"
          style={{ height: `${props.height as number || 350}px`, ...styleObject }}
        >
          {props.src ? (
            <iframe
              src={props.src as string}
              className="w-full h-full border-0"
              allowFullScreen
              title="Iframe Embed"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 gap-2">
              <Globe className="w-10 h-10" />
              <span className="text-xs font-semibold">Chưa cấu hình URL Iframe</span>
            </div>
          )}
        </div>
      )

    case 'image-banner': {
      const { marginTop, marginBottom, ...bannerStyles } = styleObject
      const hasCustomBorder = !!styles?.borderColor || !!styles?.borderWidth
      const hasCustomRadius = styles?.borderRadius !== undefined
      return (
        <div className="w-full" style={{ marginTop, marginBottom }}>
          <div
            className={cn(
              'relative w-full bg-muted flex items-center justify-center transition-all overflow-hidden',
              !hasCustomRadius && 'rounded-xl',
              !hasCustomBorder && 'border'
            )}
            style={{ height: `${props.height as number || 300}px`, ...bannerStyles }}
          >
            {props.src ? (
              <img src={props.src as string} alt={(props.alt as string) || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                <ImgIcon className="w-10 h-10" />
                <span className="text-sm font-medium">Banner Ảnh (Full Width)</span>
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'heritage-map':
      return (
        <div
          className="relative rounded-xl border overflow-hidden bg-emerald-500/5 border-emerald-500/20 p-5 flex flex-col gap-3 min-h-[192px]"
          style={styleObject}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700">
              <Map className="w-5 h-5" />
              <span className="font-semibold text-sm">{(props.title as string) || 'Bản đồ di sản'}</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 font-semibold">
              Zoom: {props.zoom as number || 12}
            </span>
          </div>
          <div className="flex-1 bg-muted/40 border border-dashed border-emerald-500/20 rounded-lg flex flex-col items-center justify-center p-6 text-center text-emerald-800/40 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]" />
            <Map className="w-10 h-10 mb-2 opacity-50 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700/80">Bản đồ Di sản Tương tác</span>
            <span className="text-[10px] text-muted-foreground/60 mt-1 max-w-[240px]">
              Hiển thị các địa điểm di sản văn hóa Chăm dựa trên cơ sở dữ liệu
            </span>
          </div>
        </div>
      )

    default:
      return <div className="h-16 bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-sm">Unknown element</div>
  }
}
