import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { AnimationConfig } from '../types'
import { ANIMATION_EFFECTS, ANIMATION_VARIANTS } from '../constants'

interface AnimationPanelProps {
  config: AnimationConfig
  onChange: (config: AnimationConfig) => void
}

export default function AnimationPanel({ config, onChange }: AnimationPanelProps) {
  const [previewing, setPreviewing] = useState(false)
  const set = <K extends keyof AnimationConfig>(key: K, value: AnimationConfig[K]) =>
    onChange({ ...config, [key]: value })

  return (
    <div className="space-y-5">
      {/* Effect grid */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Hiệu ứng xuất hiện</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {ANIMATION_EFFECTS.map(({ effect, label, symbol }) => (
            <button
              key={effect}
              type="button"
              onClick={() => set('effect', effect)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all',
                config.effect === effect
                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-semibold shadow-sm'
                  : 'border-border text-muted-foreground hover:border-amber-500/40 hover:text-foreground',
              )}
            >
              <span className="text-base leading-none">{symbol}</span>
              <span className="leading-none text-center text-[10px]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Delay */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Delay</Label>
          <span className="text-xs text-muted-foreground font-mono">{config.delay}ms</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {[0, 100, 200, 300, 400, 500, 600, 800].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => set('delay', d)}
              className={cn(
                'px-2 py-1 text-[10px] rounded border transition-all',
                config.delay === d
                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-semibold'
                  : 'border-border text-muted-foreground hover:border-amber-500/40',
              )}
            >
              {d === 0 ? '0' : `${d}`}ms
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Thời gian hiệu ứng</Label>
          <span className="text-xs text-muted-foreground font-mono">{config.duration}ms</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { v: 300, l: 'Nhanh', s: '300ms' },
            { v: 500, l: 'Bình thường', s: '500ms' },
            { v: 800, l: 'Chậm', s: '800ms' },
            { v: 1200, l: 'Rất chậm', s: '1.2s' },
          ].map(({ v, l, s }) => (
            <button
              key={v}
              type="button"
              onClick={() => set('duration', v)}
              className={cn(
                'py-1.5 text-xs rounded-md border transition-all leading-tight',
                config.duration === v
                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-semibold'
                  : 'border-border text-muted-foreground hover:border-amber-500/40',
              )}
            >
              <div>{l}</div>
              <div className="text-[10px] opacity-70">{s}</div>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Trigger */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Kích hoạt khi</Label>
        <div className="flex gap-1.5">
          {[
            { v: 'load' as const, l: '⚡', sub: 'Tải trang' },
            { v: 'scroll' as const, l: '📜', sub: 'Cuộn đến' },
          ].map(({ v, l, sub }) => (
            <button
              key={v}
              type="button"
              onClick={() => set('trigger', v)}
              className={cn(
                'flex-1 flex flex-col items-center py-2 rounded-lg border text-xs transition-all',
                config.trigger === v
                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-semibold'
                  : 'border-border text-muted-foreground hover:border-amber-500/40',
              )}
            >
              <span className="text-lg leading-none mb-0.5">{l}</span>
              <span className="text-[10px]">{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Once toggle */}
      <div className="flex items-center justify-between py-1 bg-muted/10 p-2 rounded-lg border">
        <div>
          <p className="text-xs font-semibold">Chỉ chạy một lần</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Tắt để lặp mỗi lần cuộn đến</p>
        </div>
        <Switch checked={config.once} onCheckedChange={v => set('once', v)} />
      </div>

      <Separator />

      {/* Live preview */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Xem trước hiệu ứng</Label>
        <div className="relative h-24 bg-muted/40 rounded-xl border border-border overflow-hidden flex items-center justify-center">
          {config.effect !== 'none' ? (
            <AnimatePresence mode="wait">
              {previewing ? (
                <motion.div
                  key={`preview-${config.effect}`}
                  variants={ANIMATION_VARIANTS[config.effect]}
                  initial="hidden"
                  animate="visible"
                  transition={{
                    delay: 0,
                    duration: config.duration / 1000,
                    ease: 'easeOut',
                  }}
                  onAnimationComplete={() => setTimeout(() => setPreviewing(false), 800)}
                  className="px-5 py-2.5 bg-amber-500 text-black text-xs font-bold rounded-lg shadow-lg"
                >
                  Hiệu ứng {ANIMATION_EFFECTS.find(e => e.effect === config.effect)?.label}
                </motion.div>
              ) : (
                <motion.button
                  key="play-btn"
                  type="button"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
                  onClick={() => setPreviewing(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-7 h-7 rounded-full border border-border group-hover:border-amber-500/40 flex items-center justify-center bg-background shadow-sm">
                    <Play className="w-3 h-3 ml-0.5 text-amber-600" />
                  </div>
                  Nhấn để chạy thử
                </motion.button>
              )}
            </AnimatePresence>
          ) : (
            <span className="text-xs text-muted-foreground/50">Không có hiệu ứng</span>
          )}
        </div>
      </div>
    </div>
  )
}
