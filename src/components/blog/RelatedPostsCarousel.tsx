'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';

import { resolveAssetUrl } from '@/lib/assets';
import type { Post } from '@/lib/cms';

interface RelatedPostsCarouselProps {
  posts: Post[];
  locale: string;
  readMoreLabel: string;
  titleLabel: string;
}

export default function RelatedPostsCarousel({ posts, locale, readMoreLabel, titleLabel }: RelatedPostsCarouselProps) {
  if (!posts.length) return null;

  return (
    <section className="py-16 bg-bg border-t border-border/20">
      <div className="shell-container mx-auto px-4">
        <h2 className="font-serif font-bold text-[clamp(1.5rem,3vw,2.2rem)] text-ivory mb-10">
          {titleLabel}
        </h2>

        <div className="relative group/carousel">
          {/* Prev button */}
          <button
            className="related-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-4 w-10 h-10 rounded-full bg-surface border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-terra hover:border-terra transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 max-sm:hidden"
            aria-label="Previous"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <Swiper
            modules={[Autoplay, Navigation]}
            navigation={{ prevEl: '.related-prev', nextEl: '.related-next' }}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop={posts.length > 3}
          >
            {posts.map((post) => {
              const coverImage = resolveAssetUrl(post.cover_image)
              return (
              <SwiperSlide key={post.id}>
                <article className="bg-[rgba(255,250,242,0.72)] border border-[rgba(26,35,32,0.09)] rounded-lg overflow-hidden flex flex-col h-full shadow-[0_12px_30px_rgba(8,15,13,0.04)] hover:shadow-[0_24px_50px_rgba(8,15,13,0.09)] transition-all duration-300 group">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {coverImage ? (
                      <Image
                        src={coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-104"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-forest-mid/5 flex items-center justify-center text-forest/20">
                        <BookOpen className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/15 to-transparent pointer-events-none" />
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-[0.65rem] font-bold text-terra uppercase tracking-[0.14em] mb-2 block">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                        : ''}
                    </span>

                    <h3 className="font-serif font-bold text-[1.05rem] leading-snug mb-3 text-ivory line-clamp-2">
                      <Link href={`/${locale}/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-[0.88rem] leading-relaxed text-muted-foreground line-clamp-2 mb-4">
                      {post.summary}
                    </p>

                    <Link
                      href={`/${locale}/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-[0.78rem] font-bold tracking-wider uppercase text-terra hover:text-terra-dark transition-colors mt-auto"
                    >
                      <span>{readMoreLabel}</span>
                      <ArrowRight className="w-3 h-3 transition-transform duration-220 ease-out group-hover:translate-x-1" />
                    </Link>
                  </div>
                </article>
              </SwiperSlide>
              )
            })}
          </Swiper>

          {/* Next button */}
          <button
            className="related-next absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-4 w-10 h-10 rounded-full bg-surface border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-terra hover:border-terra transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 max-sm:hidden"
            aria-label="Next"
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
