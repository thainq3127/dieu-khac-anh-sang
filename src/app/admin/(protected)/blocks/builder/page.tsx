'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import {
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Save,
  Wand2,
  Sliders,
  Eye,
  Copy,
  Plus,
  Check,
  Palette as PaletteIcon,
  Sparkles,
  EyeOff,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { CanvasElement, ElementKind, AnimationConfig, ElementStyles, DragData } from './types'
import {
  PALETTE_GROUPS,
  ALL_PALETTE_ITEMS,
  createElement,
} from './constants'
import {
  findElementAndParent,
  findElementInTree,
  removeElementFromTree,
  updateElementInTree,
  cloneElementWithNewIds,
  addOrMoveElementInTree,
} from './treeUtils'

import PaletteItem from './components/PaletteItem'
import CanvasDropZone from './components/CanvasDropZone'
import SortableCanvasElement from './components/SortableCanvasElement'
import ContentPropertiesForm from './components/ContentPropertiesForm'
import StylePropertiesForm from './components/StylePropertiesForm'
import AnimationPanel from './components/AnimationPanel'
import ElementPreview from './components/ElementPreview'

export default function BlockBuilderPage() {
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [blockName, setBlockName] = useState('Block mới')
  const [rightTab, setRightTab] = useState<'content' | 'style' | 'animation'>('content')
  const [activeDrag, setActiveDrag] = useState<{ id: string; source: 'palette' | 'canvas'; kind?: ElementKind } | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [previewMode, setPreviewMode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true)
    })
  }, [])

  const selectedElement = selectedId ? findElementInTree(elements, selectedId) : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addElement = useCallback((kind: ElementKind) => {
    const newEl = createElement(kind)
    setElements(prev => [...prev, newEl])
    setSelectedId(newEl.id)
    setRightTab('content')
  }, [])

  const removeElement = useCallback((id: string) => {
    setElements(prev => removeElementFromTree(prev, id))
    setSelectedId(prev => (prev === id ? null : prev))
  }, [])

  const duplicateElement = useCallback((id: string) => {
    let newClonedId = ''
    setElements(prev => {
      const activeInfo = findElementAndParent(prev, id)
      if (!activeInfo) return prev
      const cloned = cloneElementWithNewIds(activeInfo.element)
      newClonedId = cloned.id

      const { parent, index } = activeInfo
      if (parent) {
        const newChildren = [...(parent.children || [])]
        newChildren.splice(index + 1, 0, cloned)
        return updateElementInTree(prev, parent.id, { children: newChildren })
      } else {
        const next = [...prev]
        next.splice(index + 1, 0, cloned)
        return next
      }
    })
    if (newClonedId) {
      setTimeout(() => setSelectedId(newClonedId), 0)
    }
  }, [])

  const toggleVisibility = useCallback((id: string) => {
    setElements(prev => {
      const el = findElementInTree(prev, id)
      if (!el) return prev
      return updateElementInTree(prev, id, { visible: !el.visible })
    })
  }, [])

  const moveElement = useCallback((id: string, dir: 'up' | 'down') => {
    setElements(prev => {
      const activeInfo = findElementAndParent(prev, id)
      if (!activeInfo) return prev
      const { parent, index } = activeInfo
      const list = parent ? parent.children || [] : prev
      const targetIndex = dir === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= list.length) return prev

      const newList = [...list]
      const [moved] = newList.splice(index, 1)
      newList.splice(targetIndex, 0, moved)

      if (parent) {
        return updateElementInTree(prev, parent.id, { children: newList })
      } else {
        return newList
      }
    })
  }, [])

  const updateProps = useCallback((id: string, props: Record<string, unknown>, children?: CanvasElement[]) => {
    setElements(prev => {
      const updates: Partial<CanvasElement> = { props }
      if (children !== undefined) {
        updates.children = children
      }
      return updateElementInTree(prev, id, updates)
    })
  }, [])

  const updateStyles = useCallback((id: string, styles: ElementStyles) => {
    setElements(prev => updateElementInTree(prev, id, { styles }))
  }, [])

  const updateAnimation = useCallback((id: string, animation: AnimationConfig) => {
    setElements(prev => updateElementInTree(prev, id, { animation }))
  }, [])

  // ── DnD handlers ───────────────────────────────────────────────────────────

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    const data = active.data.current as DragData
    setActiveDrag({
      id: active.id as string,
      source: data.source,
      kind: data.source === 'palette' ? data.kind : undefined,
    })
  }, [])

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    const data = active.data.current as DragData

    if (over) {
      const paletteKind = data.source === 'palette' ? data.kind : undefined
      setElements(prev => addOrMoveElementInTree(prev, active.id as string, over.id as string, paletteKind))
    }

    setActiveDrag(null)
  }, [])

  // ── Export ─────────────────────────────────────────────────────────────────

  const handleExport = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify({ name: blockName, elements }, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [blockName, elements])

  // ── Recursive Node Renderer ──

  const renderElementNode = useCallback(
    (el: CanvasElement, index: number, parentId: string | null) => {
      const parentElements = parentId ? findElementInTree(elements, parentId)?.children || [] : elements
      const parent = parentId ? findElementInTree(elements, parentId) : null
      const isParentLocked = parent?.kind === 'columns' ? parent.props.isLocked !== false : false

      return (
        <SortableCanvasElement
          key={el.id}
          element={el}
          isSelected={selectedId === el.id}
          isFirst={index === 0}
          isLast={index === parentElements.length - 1}
          isPreviewMode={previewMode}
          parentId={parentId}
          isLocked={isParentLocked}
          onSelect={() => {
            setSelectedId(el.id)
            setRightTab('content')
          }}
          onDelete={() => removeElement(el.id)}
          onDuplicate={() => duplicateElement(el.id)}
          onToggleVis={() => toggleVisibility(el.id)}
          onMoveUp={() => moveElement(el.id, 'up')}
          onMoveDown={() => moveElement(el.id, 'down')}
          onUpdateProps={(props, children) => updateProps(el.id, props, children)}
          renderElement={(child, idx, pId) => renderElementNode(child, idx, pId)}
        />
      )
    },
    [elements, selectedId, previewMode, removeElement, duplicateElement, toggleVisibility, moveElement, updateProps],
  )

  if (!mounted) return null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="-mx-6 -my-6 lg:-mx-8 lg:-my-8 h-screen flex flex-col overflow-hidden bg-background">
        <style dangerouslySetInnerHTML={{ __html: `
          .canvas-element-group:hover:not(:has(.canvas-element-group:hover)) > .canvas-element-toolbar {
            opacity: 1 !important;
            pointer-events: auto !important;
          }
        `}} />
        {/* ── Header ── */}
        <header className="shrink-0 h-14 border-b border-border bg-background/95 backdrop-blur-sm px-4 flex items-center gap-3 z-30">
          <Link
            href="/admin/blocks"
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Input
            value={blockName}
            onChange={e => setBlockName(e.target.value)}
            className="h-8 w-48 text-sm font-semibold bg-transparent border-transparent hover:border-border focus:border-border transition-colors"
          />
          <Badge variant="outline" className="text-[10px] shrink-0">
            {elements.length} elements
          </Badge>
          <div className="flex-1" />
          <Button
            variant={previewMode ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => {
              setPreviewMode(p => !p)
              if (!previewMode) setSelectedId(null)
            }}
            className="h-8 gap-1.5 text-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            {previewMode ? 'Thoát Preview' : 'Preview'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="h-8 gap-1.5 text-xs">
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" /> Đã copy!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Export
              </>
            )}
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-black font-semibold">
            <Save className="w-3.5 h-3.5" />
            Lưu block
          </Button>
        </header>

        {/* ── 3-Column Main ── */}
        <div
          className="flex-1 overflow-hidden"
          style={{ display: 'grid', gridTemplateColumns: previewMode ? '1fr' : '256px 1fr 304px' }}
        >
          {/* ── Left: Palette ── */}
          {!previewMode && (
            <aside className="border-r border-border overflow-y-auto bg-sidebar">
              <div className="p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] px-1 mb-3">
                  Elements
                </p>
                <div className="space-y-4">
                  {PALETTE_GROUPS.map(group => {
                    const collapsed = collapsedGroups.has(group.id)
                    return (
                      <div key={group.id}>
                        <button
                          type="button"
                          className="flex items-center justify-between w-full px-1 mb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                          onClick={() =>
                            setCollapsedGroups(prev => {
                              const s = new Set(prev)
                              if (s.has(group.id)) {
                                s.delete(group.id)
                              } else {
                                s.add(group.id)
                              }
                              return s
                            })
                          }
                        >
                          {group.label}
                          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {!collapsed && (
                          <div className="space-y-1">
                            {group.items.map(item => (
                              <PaletteItem key={item.kind} {...item} />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <Separator className="my-4" />

                {/* Quick-add via click */}
                <p className="text-[10px] text-muted-foreground px-1 mb-2">Hoặc nhấn để thêm nhanh:</p>
                <div className="space-y-1">
                  {[
                    { kind: 'heading' as const, label: 'Thêm Tiêu đề' },
                    { kind: 'paragraph' as const, label: 'Thêm Đoạn văn' },
                    { kind: 'image' as const, label: 'Thêm Hình ảnh' },
                    { kind: 'button' as const, label: 'Thêm Nút bấm' },
                  ].map(({ kind, label }) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => addElement(kind)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-amber-600 hover:bg-amber-500/5 transition-all"
                    >
                      <Plus className="w-3 h-3 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* ── Center: Canvas ── */}
          <main className="overflow-y-auto bg-muted/15 relative" onClick={() => setSelectedId(null)}>
            <div className="max-w-3xl mx-auto px-6 py-8">
              {/* Block name label */}
              {!previewMode && (
                <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  <span className="px-2 font-mono">{blockName}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}

              <SortableContext items={elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
                <CanvasDropZone id="root-canvas" isEmpty={elements.length === 0}>
                  <div className="space-y-2">
                    {elements.map((el, i) => renderElementNode(el, i, null))}
                  </div>
                </CanvasDropZone>
              </SortableContext>

              {/* Bottom add button */}
              {!previewMode && elements.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => addElement('paragraph')}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-amber-600 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm element
                  </button>
                </div>
              )}
            </div>
          </main>

          {/* ── Right: Properties ── */}
          {!previewMode && (
            <aside className="border-l border-border overflow-hidden flex flex-col bg-sidebar">
              {selectedElement ? (
                <>
                  {/* Tab switcher */}
                  <div className="shrink-0 flex border-b border-border">
                    {[
                      { id: 'content' as const, label: 'Nội dung', icon: Sliders },
                      { id: 'style' as const, label: 'Kiểu dáng', icon: PaletteIcon },
                      { id: 'animation' as const, label: 'Hiệu ứng', icon: Sparkles },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setRightTab(id)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2',
                          rightTab === id
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30',
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Element identity */}
                  <div className="shrink-0 px-4 py-2.5 border-b border-border bg-muted/20 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-bold">
                      {selectedElement.kind}
                    </Badge>
                    {selectedElement.animation.effect !== 'none' && (
                      <Badge
                        variant="outline"
                        className="text-[9px] text-amber-700 border-amber-500/30 bg-amber-500/8 gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {selectedElement.animation.effect}
                      </Badge>
                    )}
                    {!selectedElement.visible && (
                      <Badge variant="outline" className="text-[9px] text-muted-foreground ml-auto">
                        <EyeOff className="w-2.5 h-2.5 mr-1" />
                        Ẩn
                      </Badge>
                    )}
                  </div>

                  {/* Tab content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {rightTab === 'content' && (
                      <ContentPropertiesForm
                        element={selectedElement}
                        onChange={(props, children) => updateProps(selectedElement.id, props, children)}
                      />
                    )}
                    {rightTab === 'style' && (
                      <StylePropertiesForm
                        element={selectedElement}
                        onChange={styles => updateStyles(selectedElement.id, styles)}
                      />
                    )}
                    {rightTab === 'animation' && (
                      <AnimationPanel
                        config={selectedElement.animation}
                        onChange={anim => updateAnimation(selectedElement.id, anim)}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-border flex items-center justify-center mb-4">
                    <Wand2 className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">Chọn một element</p>
                  <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-[180px] leading-relaxed">
                    để chỉnh sửa nội dung và thêm kiểu dáng
                  </p>
                  <div className="mt-6 space-y-1.5 w-full">
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">
                      Gợi ý
                    </p>
                    {[
                      { icon: '✦', text: 'Kéo element từ trái vào canvas' },
                      { icon: '🎨', text: 'Chọn tab Kiểu dáng để đổi màu & viền' },
                      { icon: '⊕', text: 'Kéo thả lồng nhau vào cột hoặc Container' },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-start gap-2 text-left px-2 py-1.5 rounded-lg bg-muted/40">
                        <span className="text-amber-600 text-xs shrink-0 mt-px">{icon}</span>
                        <span className="text-[11px] text-muted-foreground">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>

      {/* ── Drag Overlay ── */}
      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeDrag?.source === 'palette' && activeDrag.kind ? (
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-background border border-amber-500 rounded-xl shadow-2xl text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {ALL_PALETTE_ITEMS.find(i => i.kind === activeDrag.kind)?.label ?? activeDrag.kind}
          </div>
        ) : activeDrag?.source === 'canvas' ? (
          (() => {
            const el = findElementInTree(elements, activeDrag.id)
            if (!el) return null
            return (
              <div className="p-4 bg-background border border-border rounded-xl shadow-2xl opacity-95 max-w-2xl">
                <ElementPreview element={el} isPreviewMode={false} />
              </div>
            )
          })()
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
