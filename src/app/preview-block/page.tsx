'use client'

import { useEffect, useState } from 'react'
import DynamicBlock from '@/components/blocks/DynamicBlock'
import { translateContent } from '@/lib/translate'
import type { CMSBlock } from '@/lib/cms'

export default function PreviewBlockPage() {
  const [block, setBlock] = useState<CMSBlock | null>(null)
  const [activeLang, setActiveLang] = useState<string>('vi')

  useEffect(() => {
    const cached = sessionStorage.getItem('preview_block_data')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed && typeof parsed === 'object') {
          setTimeout(() => {
            if ('block' in parsed) {
              setBlock(parsed.block)
            } else {
              setBlock(parsed as CMSBlock)
            }
            if (parsed.activeLang) {
              setActiveLang(parsed.activeLang)
            }
          }, 0)
        }
      } catch (e) {
        console.error('Failed to parse cached preview block data', e)
      }
    }
  }, [])

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'PREVIEW_BLOCK') {
        setBlock(event.data.block)
        if (event.data.activeLang) {
          setActiveLang(event.data.activeLang)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (!block) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg text-muted-foreground text-sm">
        Đang tải preview...
      </div>
    )
  }

  const translatedBlock = {
    ...block,
    content: translateContent(block.content, activeLang)
  }

  return (
    <div className="min-w-0 bg-bg w-full min-h-screen">
      <DynamicBlock block={translatedBlock} />
    </div>
  )
}
