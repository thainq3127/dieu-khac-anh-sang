'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getPublicFooterPages } from '@/lib/public-actions';

import { useEffect, useState } from 'react';

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations();
  const [dbPages, setDbPages] = useState<Array<{ slug: string; title: Record<string, string>; sub_nav?: Array<{ anchor: string; label: Record<string, string> }> }>>([]);


  useEffect(() => {
    getPublicFooterPages().then((pages) => {
      setDbPages(pages as Array<{ slug: string; title: Record<string, string>; sub_nav?: Array<{ anchor: string; label: Record<string, string> }> }>);
    });
  }, []);

  return (
    <footer className="bg-black border-t border-white/8">
      <div className="w-[min(calc(100%-48px),1280px)] mx-auto grid grid-cols-[1fr_auto] max-[860px]:grid-cols-1 gap-6 items-end pt-[clamp(40px,6vw,72px)] pb-[clamp(28px,4vw,40px)]">
        <div>
          <p className="font-serif text-[clamp(1.4rem,3vw,2rem)] italic text-white/86 mb-1.5">{t('common.footer_brand')}</p>
          <p className="text-[0.88rem] text-white/46 mb-0">{t('common.footer_tagline')}</p>

          <div className="text-[0.88rem] text-white/52 mt-4.5 space-y-1">
            <p className="font-semibold text-white/70 text-[0.92rem]">{t('common.footer_dept')}</p>
            <p>{t('common.footer_email')}</p>
            <p>{t('common.footer_hotline')}</p>
          </div>

          <nav className="flex gap-1.5 flex-wrap mt-5" aria-label={t('common.footer_nav_aria')}>
            {dbPages.filter((p) => p.slug !== 'home').map((p) => (
              <Link key={p.slug} className="text-[0.82rem] font-semibold tracking-[0.08em] uppercase text-white/52 px-2.5 py-1.5 rounded-[5px] transition-[color,background] duration-180 hover:text-white hover:bg-white/6" href={`/${locale}/${p.slug}`}>
                {p.title?.[locale] || p.title?.['vi'] || ''}
              </Link>
            ))}
            {/* <Link className="text-[0.82rem] font-semibold tracking-[0.08em] uppercase text-white/52 px-2.5 py-1.5 rounded-[5px] transition-[color,background] duration-180 hover:text-white hover:bg-white/6" href={`/${locale}`}>{t('common.home')}</Link>
            <Link className="text-[0.82rem] font-semibold tracking-[0.08em] uppercase text-white/52 px-2.5 py-1.5 rounded-[5px] transition-[color,background] duration-180 hover:text-white hover:bg-white/6" href={`/${locale}/ponagar`}>{t('common.nav_ponagar')}</Link>
            <Link className="text-[0.82rem] font-semibold tracking-[0.08em] uppercase text-white/52 px-2.5 py-1.5 rounded-[5px] transition-[color,background] duration-180 hover:text-white hover:bg-white/6" href={`/${locale}/poklong`}>{t('common.nav_poklong')}</Link>
            <Link className="text-[0.82rem] font-semibold tracking-[0.08em] uppercase text-white/52 px-2.5 py-1.5 rounded-[5px] transition-[color,background] duration-180 hover:text-white hover:bg-white/6" href={`/${locale}/porome`}>{t('common.nav_porome')}</Link>
            <Link className="text-[0.82rem] font-semibold tracking-[0.08em] uppercase text-white/52 px-2.5 py-1.5 rounded-[5px] transition-[color,background] duration-180 hover:text-white hover:bg-white/6" href={`/${locale}/hoalai`}>{t('common.nav_hoalai')}</Link>
            <Link className="text-[0.82rem] font-semibold tracking-[0.08em] uppercase text-white/52 px-2.5 py-1.5 rounded-[5px] transition-[color,background] duration-180 hover:text-white hover:bg-white/6" href={`/${locale}/blog`}>{t('common.blog')}</Link> */}
          </nav>
        </div>
        <p className="text-[0.78rem] text-white/26 text-right max-[860px]:text-left">
          {t('common.footer_credit')}
        </p>
      </div>
      <div className="bg-forest italic bg-[linear-gradient(180deg,transparent,rgba(184,80,48,0.04)_40%,rgba(232,184,50,0.04)_70%,transparent)] py-3 text-center text-white text-sm tracking-[0.06em]">
        {t('common.footer_madeby')}
      </div>
    </footer>
  )
}
