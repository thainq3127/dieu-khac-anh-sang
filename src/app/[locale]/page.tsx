import { getPageBlocks } from '@/lib/cms'
import DynamicBlock from '@/components/blocks/DynamicBlock'
import type { Metadata } from 'next'
import { getPublicPageMeta } from '@/lib/public-actions'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const page = await getPublicPageMeta('home')

  if (!page) {
    return {}
  }

  const titleObj = page.title as Record<string, string>
  const pageTitle = titleObj?.[locale] || titleObj?.vi || 'Trang chủ'

  const descObj = page.description as Record<string, string>
  const pageDesc = descObj?.[locale] || descObj?.vi || 'Di sản sống trong dòng chảy Việt Nam'

  const ogImages = page.seo_image ? [{ url: page.seo_image }] : []

  return {
    title: pageTitle.includes('Chăm') ? pageTitle : `${pageTitle} — Văn hóa Chăm`,
    description: pageDesc,
    openGraph: page.seo_image ? {
      images: ogImages,
    } : undefined,
    twitter: page.seo_image ? {
      card: 'summary_large_image',
      images: [page.seo_image],
    } : undefined,
  }
}

export default async function MainPage({ params }: PageProps) {
  const { locale } = await params
  const blocks = await getPageBlocks('home', locale)

  return (
    <div className="min-w-0 bg-bg [[hidden]]:hidden" data-page-main>
      {blocks && blocks.map((block) => (
        <DynamicBlock key={block.id} block={block} locale={locale} />
      ))}
      {!blocks && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-muted-foreground text-sm">Trang chủ chưa có nội dung block nào.</p>
        </div>
      )}
    </div>
  )
}
