import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CanvasElement } from '../types'
import { COLUMN_LAYOUTS, getDefaultAnimation, getDefaultStyles, newId } from '../constants'

function convertToEmbedUrl(url: string): string {
  if (!url) return ''
  let trimmed = url.trim()
  
  if (trimmed.startsWith('<iframe') || trimmed.includes('iframe')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i)
    if (srcMatch) {
      trimmed = srcMatch[1]
    }
  }
  
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed
  }
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/
  const match = trimmed.match(regExp)
  
  if (match && match[2].length === 11) {
    const videoId = match[2]
    return `https://www.youtube.com/embed/${videoId}`
  }
  
  return trimmed
}

interface ContentPropertiesFormProps {
  element: CanvasElement
  onChange: (props: Record<string, unknown>, children?: CanvasElement[]) => void
}

export default function ContentPropertiesForm({ element, onChange }: ContentPropertiesFormProps) {
  const { props, kind } = element
  const set = (key: string, value: unknown) => onChange({ ...props, [key]: value })

  const renderAlignPicker = (field = 'align') => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">Căn lề (nhanh)</Label>
      <div className="flex gap-1 bg-background border border-border p-0.5 rounded-md">
        {[
          { v: 'left', l: '← Trái' },
          { v: 'center', l: '≡ Giữa' },
          { v: 'right', l: '→ Phải' },
        ].map(({ v, l }) => (
          <button
            key={v}
            type="button"
            onClick={() => set(field, v)}
            className={cn(
              'flex-1 py-1 text-xs rounded-sm transition-all',
              (props[field] ?? 'left') === v
                ? 'bg-amber-500/10 text-amber-700 font-semibold'
                : 'text-muted-foreground hover:bg-muted/40',
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )

  switch (kind) {
    case 'heading':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nội dung tiêu đề</Label>
            <Textarea
              value={(props.text as string) || ''}
              onChange={e => set('text', e.target.value)}
              rows={2}
              placeholder="Tiêu đề của bạn..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Cấp độ HTML (SEO)</Label>
            <div className="grid grid-cols-6 gap-1">
              {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => set('level', lvl)}
                  className={cn(
                    'py-1 text-xs font-bold rounded border transition-all',
                    props.level === lvl
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700'
                      : 'border-border text-muted-foreground hover:border-amber-500/40',
                  )}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {renderAlignPicker()}
        </div>
      )

    case 'paragraph':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nội dung</Label>
            <Textarea
              value={(props.text as string) || ''}
              onChange={e => set('text', e.target.value)}
              rows={6}
              placeholder="Nhập nội dung đoạn văn..."
            />
          </div>
          {renderAlignPicker()}
        </div>
      )

    case 'quote':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Trích dẫn</Label>
            <Textarea
              value={(props.text as string) || ''}
              onChange={e => set('text', e.target.value)}
              rows={3}
              placeholder="Nội dung trích dẫn..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tác giả (tuỳ chọn)</Label>
            <Input
              value={(props.author as string) || ''}
              onChange={e => set('author', e.target.value)}
              placeholder="Tên tác giả"
            />
          </div>
        </div>
      )

    case 'list':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Kiểu danh sách</Label>
            <div className="flex gap-1 bg-background border border-border p-0.5 rounded-md">
              {[
                { v: 'bullet', l: '• Ký hiệu' },
                { v: 'ordered', l: '1. Thứ tự' },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('style', v)}
                  className={cn(
                    'flex-1 py-1 text-xs rounded-sm transition-all',
                    (props.style || 'bullet') === v
                      ? 'bg-amber-500/10 text-amber-700 font-semibold'
                      : 'text-muted-foreground hover:bg-muted/40',
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Các mục</Label>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs text-amber-600 px-2"
                onClick={() => set('items', [...((props.items as string[]) || []), 'Mục mới'])}
              >
                <Plus className="w-3 h-3 mr-1" />
                Thêm mục
              </Button>
            </div>
            <div className="space-y-1.5">
              {((props.items as string[]) || []).map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Input
                    value={item}
                    onChange={e => {
                      const a = [...((props.items as string[]) || [])]
                      a[i] = e.target.value
                      set('items', a)
                    }}
                    className="h-8 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 shrink-0 hover:text-destructive"
                    onClick={() =>
                      set(
                        'items',
                        ((props.items as string[]) || []).filter((_, j) => j !== i),
                      )
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'image':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">URL hình ảnh</Label>
            <Input
              value={(props.src as string) || ''}
              onChange={e => set('src', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Alt text (Mô tả ảnh)</Label>
            <Input
              value={(props.alt as string) || ''}
              onChange={e => set('alt', e.target.value)}
              placeholder="Mô tả hình ảnh phục vụ SEO"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Chú thích (tuỳ chọn)</Label>
            <Input
              value={(props.caption as string) || ''}
              onChange={e => set('caption', e.target.value)}
              placeholder="Chú thích hiển thị dưới ảnh..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tỉ lệ khung hình</Label>
            <div className="flex gap-1 bg-background border border-border p-0.5 rounded-md">
              {[
                { v: '16/9', l: '16:9' },
                { v: '4/3', l: '4:3' },
                { v: '1/1', l: '1:1' },
                { v: 'auto', l: 'Tự do' },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('aspectRatio', v)}
                  className={cn(
                    'flex-1 py-1 text-xs rounded-sm transition-all',
                    (props.aspectRatio || '16/9') === v
                      ? 'bg-amber-500/10 text-amber-700 font-semibold'
                      : 'text-muted-foreground hover:bg-muted/40',
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )

    case 'video':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">YouTube Video ID</Label>
            <Input
              value={(props.youtubeId as string) || ''}
              onChange={e => set('youtubeId', e.target.value)}
              placeholder="dQw4w9WgXcQ"
            />
            <p className="text-[10px] text-muted-foreground leading-snug">
              Ví dụ: https://youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tiêu đề video</Label>
            <Input
              value={(props.title as string) || ''}
              onChange={e => set('title', e.target.value)}
              placeholder="Nhập tiêu đề video..."
            />
          </div>
        </div>
      )

    case 'button':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nội dung nút</Label>
            <Input
              value={(props.text as string) || ''}
              onChange={e => set('text', e.target.value)}
              placeholder="Nhấn vào đây"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Đường dẫn liên kết</Label>
            <Input
              value={(props.href as string) || ''}
              onChange={e => set('href', e.target.value)}
              placeholder="https://"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Kiểu nút</Label>
            <div className="flex gap-1 bg-background border border-border p-0.5 rounded-md">
              {[
                { v: 'primary', l: 'Chính' },
                { v: 'secondary', l: 'Phụ' },
                { v: 'ghost', l: 'Ghost' },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('variant', v)}
                  className={cn(
                    'flex-1 py-1 text-xs rounded-sm transition-all',
                    (props.variant || 'primary') === v
                      ? 'bg-amber-500/10 text-amber-700 font-semibold'
                      : 'text-muted-foreground hover:bg-muted/40',
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Kích thước</Label>
            <div className="flex gap-1 bg-background border border-border p-0.5 rounded-md">
              {[
                { v: 'sm', l: 'Nhỏ' },
                { v: 'md', l: 'Vừa' },
                { v: 'lg', l: 'Lớn' },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('size', v)}
                  className={cn(
                    'flex-1 py-1 text-xs rounded-sm transition-all',
                    (props.size || 'md') === v
                      ? 'bg-amber-500/10 text-amber-700 font-semibold'
                      : 'text-muted-foreground hover:bg-muted/40',
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          {renderAlignPicker()}
        </div>
      )

    case 'badge':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nội dung nhãn</Label>
            <Input
              value={(props.text as string) || ''}
              onChange={e => set('text', e.target.value)}
              placeholder="Nhập chữ nhãn..."
            />
          </div>
        </div>
      )

    case 'divider':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Kiểu đường kẻ</Label>
            <div className="flex gap-1 bg-background border border-border p-0.5 rounded-md">
              {[
                { v: 'line', l: '───' },
                { v: 'dashed', l: '- - -' },
                { v: 'dotted', l: '· · ·' },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('style', v)}
                  className={cn(
                    'flex-1 py-1 text-xs rounded-sm transition-all font-mono',
                    (props.style || 'line') === v
                      ? 'bg-amber-500/10 text-amber-700 font-bold'
                      : 'text-muted-foreground hover:bg-muted/40',
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )

    case 'spacer':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Chiều cao khoảng trống: {props.height as number}px</Label>
            <div className="flex flex-wrap gap-1">
              {[16, 24, 32, 48, 64, 80, 96, 120, 160].map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => set('height', h)}
                  className={cn(
                    'px-2 py-1 text-xs rounded border transition-all',
                    props.height === h
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-semibold'
                      : 'border-border text-muted-foreground hover:border-amber-500/40',
                  )}
                >
                  {h}px
                </button>
              ))}
            </div>
          </div>
        </div>
      )

    case 'columns': {
      const currentLayoutId = (props.layout as string) || '2-equal'

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
        onChange(
          {
            ...props,
            layout: layoutId,
            columns: selectedLayout.cols,
            isLocked: true,
          },
          nextChildren,
        )
      }

      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Bố cục chia cột mẫu</Label>
            <div className="grid grid-cols-2 gap-2">
              {COLUMN_LAYOUTS.map(layout => {
                const isActive = currentLayoutId === layout.id
                return (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => handleLayoutSelect(layout.id)}
                    className={cn(
                      'flex flex-col gap-2 p-2.5 rounded-lg border text-left transition-all cursor-pointer',
                      isActive
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-semibold shadow-sm'
                        : 'border-border text-muted-foreground hover:border-amber-500/40 hover:text-foreground',
                    )}
                  >
                    {/* Visual split bar */}
                    <div className="flex h-5 w-full gap-0.5 bg-muted-foreground/5 p-0.5 rounded border border-muted-foreground/10">
                      {layout.widths.map((w, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'h-full rounded-xs transition-colors',
                            isActive ? 'bg-amber-500/35' : 'bg-muted-foreground/25'
                          )}
                          style={{ flexBasis: w }}
                        />
                      ))}
                    </div>
                    {/* Small labels */}
                    <div className="flex flex-col leading-tight gap-0.5">
                      <span className="text-[10px] truncate font-medium">
                        {layout.label.split(' (')[0]}
                      </span>
                      <span className="text-[9px] opacity-60 font-mono">
                        {layout.widths.join(' | ')}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-border/60">
            <Label className="text-xs">Khoảng cách giữa các cột (px)</Label>
            <div className="flex gap-1.5">
              {[8, 12, 16, 24, 32].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => set('gap', g)}
                  className={cn(
                    'flex-1 py-1 text-xs rounded border transition-all cursor-pointer',
                    (props.gap === g || (!props.gap && g === 16))
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-semibold'
                      : 'border-border text-muted-foreground hover:border-amber-500/40',
                  )}
                >
                  {g}px
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-border/60">
            <Label className="text-xs font-semibold">Trạng thái bố cục</Label>
            {props.isLocked !== false ? (
              <div className="space-y-2">
                <div className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded border border-border/40 leading-relaxed">
                  🔒 Lưới đã chốt. Bạn có thể kéo thả phần tử vào các cột trên canvas hoặc đổi kiểu dáng. Để vẽ lại lưới hoặc gộp ô, hãy mở khóa.
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => set('isLocked', false)}
                  className="w-full text-xs gap-1.5 cursor-pointer"
                >
                  ⚙ Thiết kế lại (Mở khóa lưới)
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] text-amber-700 bg-amber-500/10 p-2.5 rounded border border-amber-500/20 leading-relaxed">
                  🔓 Lưới đang mở khóa. Click các ô trống `+` hoặc kéo tay cầm góc dưới phải của cột để định hình bố cục.
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => set('isLocked', true)}
                  className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 cursor-pointer"
                >
                  ✓ Xác nhận bố cục (Chốt lưới)
                </Button>
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'column': {
      const colStart = (props.colStart as number) || 1
      const colSpan = (props.colSpan as number) || 1
      const rowStart = (props.rowStart as number) || 1
      const rowSpan = (props.rowSpan as number) || 1

      const updateGrid = (key: 'colStart' | 'colSpan' | 'rowStart' | 'rowSpan', val: number) => {
        const nextProps = { ...props, [key]: val }
        const newColStart = (nextProps.colStart as number) || 1
        let newColSpan = (nextProps.colSpan as number) || 1
        const newRowStart = (nextProps.rowStart as number) || 1
        let newRowSpan = (nextProps.rowSpan as number) || 1

        if (newColStart + newColSpan - 1 > 5) {
          newColSpan = 5 - newColStart + 1
        }
        if (newRowStart + newRowSpan - 1 > 4) {
          newRowSpan = 4 - newRowStart + 1
        }

        onChange({
          ...props,
          colStart: newColStart,
          colSpan: newColSpan,
          rowStart: newRowStart,
          rowSpan: newRowSpan,
        })
      }

      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Tên/Nhãn của cột</Label>
            <Input
              type="text"
              value={(props.label as string) || ''}
              onChange={e => set('label', e.target.value)}
              placeholder="Ví dụ: Cột 1"
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-3 pt-3 border-t border-border/60">
            <span className="text-xs font-semibold text-foreground block">Vị trí và Kích thước lưới</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Cột bắt đầu</Label>
                <select
                  value={colStart}
                  onChange={e => updateGrid('colStart', parseInt(e.target.value))}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {[1, 2, 3, 4, 5].map(v => (
                    <option key={v} value={v}>Cột {v}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Độ rộng (Số ô)</Label>
                <select
                  value={colSpan}
                  onChange={e => updateGrid('colSpan', parseInt(e.target.value))}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {Array.from({ length: 6 - colStart }).map((_, idx) => {
                    const v = idx + 1
                    return <option key={v} value={v}>{v} ô</option>
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Hàng bắt đầu</Label>
                <select
                  value={rowStart}
                  onChange={e => updateGrid('rowStart', parseInt(e.target.value))}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {[1, 2, 3, 4].map(v => (
                    <option key={v} value={v}>Hàng {v}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Độ cao (Số ô)</Label>
                <select
                  value={rowSpan}
                  onChange={e => updateGrid('rowSpan', parseInt(e.target.value))}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {Array.from({ length: 5 - rowStart }).map((_, idx) => {
                    const v = idx + 1
                    return <option key={v} value={v}>{v} ô</option>
                  })}
                </select>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground/70 bg-muted/40 p-2 rounded border border-border/40 font-mono mt-1 select-none">
              Toạ độ: Cột {colStart} ➔ {colStart + colSpan - 1} | Hàng {rowStart} ➔ {rowStart + rowSpan - 1}
            </div>
          </div>

          <div className="rounded-lg bg-muted/30 border p-3">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              💡 Bạn có thể kéo thả bất kỳ element nào vào cột này từ danh sách bên trái. Bật tab{' '}
              <strong>Kiểu dáng</strong> để thêm màu nền, viền và khoảng cách đệm cho cột này.
            </p>
          </div>
        </div>
      )
    }

    case 'container':
      return (
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/30 border p-3 space-y-2">
            <h4 className="text-xs font-bold text-foreground">Hộp Container Box</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Container Box là một hộp chứa đa năng, giúp nhóm nhiều element lại với nhau theo chiều dọc.
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              💡 Bật tab <strong>Kiểu dáng</strong> bên cạnh để thiết lập màu nền, viền, bo góc, bóng đổ và khoảng
              cách đệm cho hộp chứa này.
            </p>
          </div>
        </div>
      )

    case 'card':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">URL hình ảnh</Label>
            <Input
              value={(props.image as string) || ''}
              onChange={e => set('image', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nhãn danh mục (Tag)</Label>
            <Input
              value={(props.tag as string) || ''}
              onChange={e => set('tag', e.target.value)}
              placeholder="Ví dụ: DI SẢN"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tiêu đề thẻ</Label>
            <Input
              value={(props.title as string) || ''}
              onChange={e => set('title', e.target.value)}
              placeholder="Nhập tiêu đề thẻ..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nội dung thẻ</Label>
            <Textarea
              value={(props.body as string) || ''}
              onChange={e => set('body', e.target.value)}
              rows={3}
              placeholder="Nội dung thẻ..."
            />
          </div>
        </div>
      )

    case 'icon-feature':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Emoji làm Icon</Label>
            <Input
              value={(props.icon as string) || ''}
              onChange={e => set('icon', e.target.value)}
              placeholder="🏛️"
              maxLength={4}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tiêu đề</Label>
            <Input
              value={(props.title as string) || ''}
              onChange={e => set('title', e.target.value)}
              placeholder="Nhập tiêu đề..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Mô tả ngắn</Label>
            <Textarea
              value={(props.body as string) || ''}
              onChange={e => set('body', e.target.value)}
              rows={2}
              placeholder="Mô tả..."
            />
          </div>
        </div>
      )

    case 'marquee':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nội dung chữ chạy</Label>
            <Textarea
              value={(props.text as string) || ''}
              onChange={e => set('text', e.target.value)}
              rows={3}
              placeholder="Nhập dòng chữ chạy..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tốc độ chạy ({props.speed as number || 5})</Label>
            <Input
              type="number"
              value={props.speed as number ?? 5}
              min={1}
              max={30}
              onChange={e => set('speed', parseInt(e.target.value, 10) || 5)}
              placeholder="5"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Hướng di chuyển</Label>
            <div className="flex gap-1 bg-background border border-border p-0.5 rounded-md">
              {[
                { v: 'left', l: '← Sang trái' },
                { v: 'right', l: 'Sang phải →' },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('direction', v)}
                  className={cn(
                    'flex-1 py-1 text-xs rounded-sm transition-all',
                    (props.direction || 'left') === v
                      ? 'bg-amber-500/10 text-amber-700 font-semibold'
                      : 'text-muted-foreground hover:bg-muted/40',
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )

    case 'iframe':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">URL nguồn nhúng (src)</Label>
            <Input
              value={(props.src as string) || ''}
              onChange={e => set('src', convertToEmbedUrl(e.target.value))}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Chiều cao khung (px)</Label>
            <Input
              type="number"
              value={props.height as number ?? 450}
              onChange={e => set('height', parseInt(e.target.value, 10) || 450)}
              placeholder="450"
            />
          </div>
        </div>
      )

    case 'image-banner':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">URL hình ảnh</Label>
            <Input
              value={(props.src as string) || ''}
              onChange={e => set('src', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Mô tả ảnh (Alt)</Label>
            <Input
              value={(props.alt as string) || ''}
              onChange={e => set('alt', e.target.value)}
              placeholder="Alt text..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Chiều cao banner (px)</Label>
            <Input
              type="number"
              value={props.height as number ?? 350}
              onChange={e => set('height', parseInt(e.target.value, 10) || 350)}
              placeholder="350"
            />
          </div>
        </div>
      )

    case 'heritage-map':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Tiêu đề Bản đồ</Label>
            <Input
              value={(props.title as string) || ''}
              onChange={e => set('title', e.target.value)}
              placeholder="Bản đồ di sản"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Mức độ thu phóng (Zoom: 1 - 20)</Label>
            <Input
              type="number"
              value={props.zoom as number ?? 12}
              min={1}
              max={20}
              onChange={e => set('zoom', parseInt(e.target.value, 10) || 12)}
              placeholder="12"
            />
          </div>
        </div>
      )

    default:
      return <div className="text-sm text-muted-foreground py-4 text-center">Không có thuộc tính</div>
  }
}
