import { getPageBlocks } from '@/lib/cms'
import DynamicBlock from '@/components/blocks/DynamicBlock'
import { notFound } from 'next/navigation'
import { getPublicPageMeta, getPublicPageStatus } from '@/lib/public-actions'
import { resolveAssetUrl } from '@/lib/assets'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const page = await getPublicPageMeta(slug)

  if (!page) {
    return {}
  }

  const titleObj = page.title as Record<string, string>
  const pageTitle = titleObj?.[locale] || titleObj?.vi || 'Văn hóa Chăm'

  const descObj = page.description as Record<string, string>
  const pageDesc = descObj?.[locale] || descObj?.vi || 'Di sản sống trong dòng chảy Việt Nam'
  const seoImage = resolveAssetUrl(page.seo_image as string | null)

  const ogImages = seoImage ? [{ url: seoImage }] : []

  return {
    title: pageTitle.includes('Chăm') ? pageTitle : `${pageTitle} — Văn hóa Chăm`,
    description: pageDesc,
    openGraph: seoImage ? {
      images: ogImages,
    } : undefined,
    twitter: seoImage ? {
      card: 'summary_large_image',
      images: [seoImage],
    } : undefined,
  }
}

export default async function DynamicSlugPage({ params }: PageProps) {
  const { slug, locale } = await params

  const page = await getPublicPageStatus(slug)

  if (!page || !page.is_published) {
    notFound()
  }

  const blocks = await getPageBlocks(slug, locale)

  return (
    <div className="min-w-0 bg-bg [[hidden]]:hidden" data-page-main>
      {blocks && blocks.map((block) => (
        <DynamicBlock key={block.id} block={block} locale={locale} />
      ))}
      {!blocks && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="text-muted-foreground text-sm">Trang này chưa có nội dung block nào.</p>
        </div>
      )}
    </div>
  )
}
