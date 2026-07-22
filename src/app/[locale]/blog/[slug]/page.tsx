import { getPostBySlug, getPosts } from '@/lib/cms'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import RelatedPostsCarousel from '@/components/blog/RelatedPostsCarousel'
import { resolveAssetUrl, storedAssetHtmlToPublicUrls } from '@/lib/assets'

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const post = await getPostBySlug(slug, locale)

  if (!post) {
    return {}
  }

  const coverImage = resolveAssetUrl(post.cover_image)

  return {
    title: `${post.title} — Văn hóa Chăm`,
    description: post.summary,
    openGraph: coverImage ? {
      images: [{ url: coverImage }],
    } : undefined,
    twitter: coverImage ? {
      card: 'summary_large_image' as const,
      images: [coverImage],
    } : undefined,
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug, locale } = await params
  const [post, allPosts, t] = await Promise.all([
    getPostBySlug(slug, locale),
    getPosts(locale),
    getTranslations({ locale, namespace: 'blog' }),
  ])

  if (!post) {
    notFound()
  }

  const coverImage = resolveAssetUrl(post.cover_image)
  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 10)

  return (
    <main className="min-h-screen bg-bg">
      <div className="pt-36 pb-16">
        <div className="shell-container mx-auto px-4">
          {/* Back Link */}
          <div className="mb-8">
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-terra transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back_link')}
            </Link>
          </div>

          {/* Post Header */}
          <header className="space-y-4 mb-10">
            <div className="flex items-center gap-3 flex-wrap">
              {post.category && (
                <span className="inline-block text-[0.62rem] font-bold tracking-[0.14em] uppercase bg-terra/10 text-terra border border-terra/20 rounded-full px-2.5 py-0.5">
                  {post.category.name}
                </span>
              )}
              <div className="flex items-center gap-2 text-xs font-bold text-terra uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(post.published_at).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <h1 className="font-serif font-bold text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] text-ivory">
              {post.title}
            </h1>
            {post.summary && (
              <p className="font-serif text-lg italic text-muted-foreground leading-relaxed border-l-2 border-terra/30 pl-4 py-1">
                {post.summary}
              </p>
            )}
          </header>
        </div>

        {/* Cover Image — full shell width */}
        {coverImage && (
          <div className="shell-container mx-auto px-4 mb-12">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-[rgba(26,35,32,0.09)] shadow-lg">
              <Image
                src={coverImage}
                alt={post.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        <div className="shell-container mx-auto px-4">
          {/* Content Body */}
          <article className="prose max-w-none">
            <div
              className="text-lg text-justify space-y-6
                [&_p]:mb-5 [&_p]:text-muted [&_p]:leading-[1.86]
                [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ivory [&_h2]:pt-6 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-border/30
                [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ivory [&_h3]:pt-4
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:text-muted
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:text-muted
                [&_blockquote]:border-l-3 [&_blockquote]:border-terra [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-terra-dark [&_blockquote]:my-6 [&_blockquote]:py-1
                [&_a]:text-terra [&_a]:underline hover:[&_a]:text-terra-dark transition-colors [&_img]:m-auto"
              dangerouslySetInnerHTML={{ __html: storedAssetHtmlToPublicUrls(post.content) }}
            />
          </article>
        </div>
      </div>

      {/* Related Posts */}
      <RelatedPostsCarousel
        posts={relatedPosts}
        locale={locale}
        readMoreLabel={t('read_more')}
        titleLabel={t('related_title')}
      />
    </main>
  )
}
