import { getPostsByCategory, getPostCategoriesFull } from '@/lib/cms'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ locale: string; categorySlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, categorySlug } = await params
  const categories = await getPostCategoriesFull(locale)
  const cat = categories.find((c) => c.slug === categorySlug)
  if (!cat) return {}
  return {
    title: `${cat.name} — Kim Anh`,
    description: cat.description || undefined,
  }
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { locale, categorySlug } = await params
  const [posts, categories, t] = await Promise.all([
    getPostsByCategory(categorySlug, locale),
    getPostCategoriesFull(locale),
    getTranslations({ locale, namespace: 'blog' }),
  ])

  const currentCat = categories.find((c) => c.slug === categorySlug)
  if (!currentCat) notFound()

  return (
    <main className="min-h-screen pt-36 pb-20 bg-bg">
      <div className="shell-container mx-auto px-4">
        {/* Header */}
        <header className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <span className="inline-block text-[0.68rem] font-bold tracking-[0.18em] uppercase text-terra">
            {t('list_label')}
          </span>
          <h1 className="font-serif font-bold text-[clamp(2.4rem,5vw,4rem)] text-forest leading-none">
            {currentCat.name}
          </h1>
          {currentCat.description && (
            <p className="font-serif text-[clamp(1rem,1.6vw,1.2rem)] italic text-muted/80 max-w-[50ch] mx-auto">
              {currentCat.description}
            </p>
          )}
          <div className="w-16 h-0.5 bg-terra mx-auto mt-6" />
        </header>

        {/* Blog Post Grid */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted text-lg font-serif italic">{t('empty')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('empty_sub')}</p>
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-terra hover:text-terra-dark transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Xem tất cả bài viết
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-[rgba(255,250,242,0.72)] border border-[rgba(26,35,32,0.09)] rounded-lg overflow-hidden flex flex-col h-full shadow-[0_12px_30px_rgba(8,15,13,0.04)] hover:shadow-[0_24px_50px_rgba(8,15,13,0.09)] transition-all duration-300 group"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-104"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-forest-mid/5 flex items-center justify-center text-forest/20">
                      <BookOpen className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/15 to-transparent pointer-events-none" />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <span className="inline-block text-[0.6rem] font-bold tracking-[0.12em] uppercase bg-terra/10 text-terra border border-terra/20 rounded-full px-2 py-0.5">
                      {currentCat.name}
                    </span>
                    <span className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-[0.14em]">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                        : t('new_label')}
                    </span>
                  </div>

                  <h2 className="font-serif font-bold text-xl leading-snug mb-3 text-ivory hover:text-terra transition-colors line-clamp-2">
                    <Link href={`/${locale}/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  <p className="text-[0.92rem] leading-relaxed text-muted-foreground line-clamp-3 mb-6">
                    {post.summary}
                  </p>

                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-[0.82rem] font-bold tracking-wider uppercase text-terra hover:text-terra-dark transition-colors mt-auto group-link"
                  >
                    <span>{t('read_more')}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-220 ease-out group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
