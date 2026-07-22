'use client'

import Link from 'next/link'
import { Plus, Layers, Wand2, Clock, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const SAMPLE_TEMPLATES = [
  { id: 'hero-cta', name: 'Hero + CTA', elements: 4, lastEdited: '2 ngày trước', tags: ['Hero', 'Button'] },
  { id: 'text-image', name: 'Text + Hình ảnh', elements: 3, lastEdited: '5 ngày trước', tags: ['Paragraph', 'Image'] },
  { id: 'feature-grid', name: 'Feature Grid', elements: 5, lastEdited: '1 tuần trước', tags: ['Heading', 'Icon Feature'] },
]

export default function BlocksPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Block Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tạo các block tái sử dụng bằng drag &amp; drop với hiệu ứng animation
          </p>
        </div>
        <Link
          href="/admin/blocks/builder"
          className={cn(buttonVariants({ size: 'sm' }), 'bg-amber-600 hover:bg-amber-500 text-black font-semibold gap-2')}
        >
          <Plus className="w-4 h-4" />
          Tạo block mới
        </Link>
      </div>

      {/* Intro banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-amber-500/3 to-transparent p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Wand2 className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-semibold text-base">Trình tạo block trực quan</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              Kéo và thả các element (heading, image, button, v.v.) vào canvas để xây dựng layout.
              Mỗi element đều có tùy chọn animation riêng — fade, slide, scale, bounce — với delay và trigger linh hoạt.
            </p>
            <div className="flex gap-2 pt-1">
              {['Drag & Drop', 'Animation Editor', 'Live Preview', 'Export JSON'].map(tag => (
                <Badge key={tag} variant="outline" className="text-[10px] border-amber-500/30 text-amber-700">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Link href="/admin/blocks/builder" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0 ml-auto gap-1.5 border-amber-500/30 text-amber-700 hover:bg-amber-500/10')}>
            Mở Builder
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Templates grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Block đã lưu
          </h2>
          <Badge variant="outline" className="text-xs">{SAMPLE_TEMPLATES.length} templates</Badge>
        </div>

        {SAMPLE_TEMPLATES.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-border text-center">
            <Layers className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Chưa có block nào</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tạo block đầu tiên của bạn</p>
            <Link href="/admin/blocks/builder" className={cn(buttonVariants({ variant: 'link' }), 'mt-3 text-amber-600')}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Tạo ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_TEMPLATES.map(tmpl => (
              <Link
                key={tmpl.id}
                href={`/admin/blocks/builder?id=${tmpl.id}`}
                className="group relative rounded-xl border border-border hover:border-amber-500/40 bg-card hover:bg-amber-500/3 transition-all duration-200 p-5 flex flex-col gap-3"
              >
                {/* Preview area */}
                <div className="aspect-3/2 bg-muted rounded-lg border border-border flex items-center justify-center text-muted-foreground/30">
                  <Layers className="w-8 h-8" />
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm group-hover:text-amber-600 transition-colors">
                      {tmpl.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {tmpl.lastEdited}
                      <span>·</span>
                      <span>{tmpl.elements} elements</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-amber-500 transition-colors mt-0.5 shrink-0" />
                </div>

                <div className="flex flex-wrap gap-1">
                  {tmpl.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[9px] px-1.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}

            {/* Create new card */}
            <Link
              href="/admin/blocks/builder"
              className="group rounded-xl border-2 border-dashed border-border hover:border-amber-500/40 hover:bg-amber-500/3 transition-all duration-200 p-5 flex flex-col items-center justify-center gap-2 aspect-[3/2] min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-border group-hover:border-amber-500/40 flex items-center justify-center text-muted-foreground/40 group-hover:text-amber-500 transition-all">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Block mới
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
