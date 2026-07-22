'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ChevronDown } from 'lucide-react';
import { getPublicHeaderData } from '@/lib/public-actions';

function HeaderPagesDropdown({
  locale,
  pages,
  pathname,
  blogLabel,
  showBlog,
  getMetaLinkClass,
}: {
  locale: string;
  pages: Array<{ slug: string; title: Record<string, string> }>;
  pathname: string;
  blogLabel: string;
  showBlog: boolean;
  getMetaLinkClass: (isActive: boolean) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const moreLabels: Record<string, string> = {
    vi: 'Xem thêm',
    en: 'More',
    ru: 'Еще',
    zh: '更多',
  };
  const label = moreLabels[locale] || moreLabels['vi'];

  // Check if any page in the dropdown is active
  const isAnyActive = pages.some((p) => pathname.includes(`/${p.slug}`)) || (showBlog && pathname.includes('/blog'));

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = () => setIsOpen(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${getMetaLinkClass(isAnyActive)} flex items-center gap-1 bg-transparent border-0 cursor-pointer focus:outline-none`}
        type="button"
        aria-expanded={isOpen}
      >
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 min-w-[180px] bg-terra-dark border border-white/20 rounded shadow-lg overflow-hidden z-[950] py-1"
          >
            {pages.map((p) => {
              const titleStr = p.title?.[locale] || p.title?.['vi'] || '';
              const isActive = pathname.includes(`/${p.slug}`);
              return (
                <Link
                  key={p.slug}
                  href={`/${locale}/${p.slug}`}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 text-left text-xs transition-colors ${isActive
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/86 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {titleStr}
                </Link>
              );
            })}
            {showBlog && (
              <Link
                href={`/${locale}/blog`}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 text-left text-xs border-t border-white/10 transition-colors ${pathname.includes('/blog')
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-white/86 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {blogLabel}
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = useTranslations();
  const [dbPages, setDbPages] = useState<Array<{ slug: string; title: Record<string, string>; sub_nav?: Array<{ anchor: string; label: Record<string, string> }> }>>([]);
  const [blogTitle, setBlogTitle] = useState('');
  const [enabledLanguages, setEnabledLanguages] = useState<string[]>(['vi', 'en', 'ru', 'zh']);
  const [showBlog, setShowBlog] = useState(true);
  const [blogCategories, setBlogCategories] = useState<Array<{ id: string; name: string; slug?: string | null }>>([]);

  useEffect(() => {
    getPublicHeaderData(locale, pathname.includes('/blog')).then((data) => {
      setBlogTitle(data.blogTitle);
      setEnabledLanguages(data.enabledLanguages);
      setShowBlog(data.showBlog);
      setDbPages(data.pages as Array<{ slug: string; title: Record<string, string>; sub_nav?: Array<{ anchor: string; label: Record<string, string> }> }>);
      setBlogCategories(data.categories);
    });
  }, [locale, pathname]);

  const blogLabelText = blogTitle || t('common.blog');
  const isHomeActive = !pathname.includes('/blog') && dbPages.filter((p) => p.slug !== 'home').every((p) => !pathname.includes(`/${p.slug}`));

  // Extract current category slug from path /blog/category/[slug]
  const blogCategoryMatch = pathname.match(/\/blog\/category\/([^/]+)/);
  const activeCategorySlug = blogCategoryMatch ? blogCategoryMatch[1] : null;

  const handleLocaleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    const segments = pathname.split('/');
    if (segments.length > 1 && ['vi', 'en', 'ru', 'zh'].includes(segments[1])) {
      segments[1] = nextLocale;
    } else {
      segments.unshift(nextLocale);
    }
    const nextPath = segments.join('/') || '/';
    // Use hard navigation to bypass Next.js Router Cache,
    // ensuring the server re-renders with the new locale
    window.location.href = nextPath;
  };
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('#hero');
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Adjust drawer state during rendering when pathname changes
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  }

  // Handle header scroll states
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 18);

      if (isDrawerOpen) {
        setIsHidden(false);
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY <= 60) {
        setIsHidden(false);
        lastScrollY = currentScrollY;
        return;
      }

      const scrollDelta = currentScrollY - lastScrollY;
      if (scrollDelta > 4 && currentScrollY > 72) {
        setIsHidden(true);
      } else if (scrollDelta < -4) {
        setIsHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDrawerOpen]);

  // Track active section on scroll
  useEffect(() => {
    let sectionIds = ['hero', 'khong-gian', 'thap-cham', 'di-san', 'hanh-trinh', 'video'];
    const curPage = dbPages.find((p) => pathname.includes(`/${p.slug}`));
    if (curPage && curPage.sub_nav && curPage.sub_nav.length > 0) {
      sectionIds = curPage.sub_nav.map((item) => item.anchor);
    } else if (pathname.includes('/ponagar')) {
      sectionIds = ['ponagar-tong-quan', 'ponagar-nu-than', 'ponagar-hanh-trinh', 'ponagar-thap-chinh', 'ponagar-le-hoi', 'ponagar-video'];
    } else if (pathname.includes('/hoalai')) {
      sectionIds = ['hoalai-tong-quan', 'hoalai-lich-su', 'hoalai-ba-thap', 'hoalai-hoa-van', 'hoalai-bao-ton'];
    } else if (pathname.includes('/poklong')) {
      sectionIds = ['poklong-tong-quan', 'poklong-vua-thieng', 'poklong-quan-the', 'poklong-kien-truc', 'poklong-le-hoi'];
    } else if (pathname.includes('/porome')) {
      sectionIds = ['porome-tong-quan', 'porome-vi-vua', 'porome-quan-the', 'porome-thap-chinh', 'porome-le-hoi'];
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveHash(`#${visible.target.id}`);
        }
      },
      { threshold: [0.1, 0.3, 0.5], rootMargin: '-90px 0px -40% 0px' }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname, dbPages]);

  // Synchronize drawer open state with document.body class
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
    }
    return () => {
      document.body.classList.remove('nav-open');
    };
  }, [isDrawerOpen]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const getNavLink = (hash: string, targetPage: 'main' | 'ponagar' | 'hoalai' | 'poklong' | 'porome') => {
    if (targetPage === 'ponagar') {
      return pathname.includes('/ponagar') ? hash : `/${locale}/ponagar${hash}`;
    } else if (targetPage === 'hoalai') {
      return pathname.includes('/hoalai') ? hash : `/${locale}/hoalai${hash}`;
    } else if (targetPage === 'poklong') {
      return pathname.includes('/poklong') ? hash : `/${locale}/poklong${hash}`;
    } else if (targetPage === 'porome') {
      return pathname.includes('/porome') ? hash : `/${locale}/porome${hash}`;
    } else {
      const isMainPage = pathname === `/${locale}` || pathname === '/';
      return isMainPage ? hash : `/${locale}${hash}`;
    }
  };

  const getNavLinkClass = (isActive: boolean, isPonagarNav: boolean) => {
    const base = "relative flex items-center justify-center min-h-[72px] py-2 text-[#1a2320]/84 font-bold leading-[1.35] text-center uppercase transition-colors duration-180 ease-out before:content-[''] before:absolute before:left-1/2 before:bottom-3 before:h-0.5 before:rounded-full before:-translate-x-1/2 before:bg-terra before:transition-[width] before:duration-220 before:ease-out";

    const sizeClass = isPonagarNav
      ? "max-w-[90px] text-xs tracking-[0.05em]"
      : "max-w-[118px] text-[0.72rem] tracking-[0.06em]";

    const stateClass = isActive
      ? "text-terra-dark before:w-[min(34px,100%)]"
      : "before:w-0 hover:text-terra-dark hover:before:w-[min(34px,100%)]";

    return `${base} ${sizeClass} ${stateClass}`;
  };

  const getHomeLinkClass = (isActive: boolean) => {
    const base = "w-[38px] h-[38px] min-h-[38px] max-w-none p-0 rounded-full flex items-center justify-center transition-all duration-180 ease-out shadow-[inset_0_0_0_1px_rgba(184,80,48,0.14)]";
    const stateClass = isActive
      ? "bg-terra text-white"
      : "bg-white/58 text-terra hover:bg-terra hover:text-white";
    return `${base} ${stateClass}`;
  };

  const getMetaLinkClass = (isActive: boolean) => {
    const base = "text-sm font-semibold tracking-[0.02em] whitespace-nowrap transition-[opacity,color] duration-180 ease-out";
    const stateClass = isActive
      ? "text-white opacity-100 underline decoration-[1.5px] underline-offset-[5px]"
      : "text-white/86 opacity-80 hover:opacity-100 hover:text-white hover:underline hover:decoration-[1.5px] hover:underline-offset-[5px]";
    return `${base} ${stateClass}`;
  };

  const currentPage = dbPages.find((p) => {
    if (p.slug === 'home') {
      return pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.includes(`/${p.slug}`);
  });

  const filteredPages = dbPages.filter((p) => p.slug !== 'home');

  const maxDirectItems = 7;

  // Luôn giữ Blog ở menu chính nếu showBlog = true
  const directPages = filteredPages.slice(
    0,
    showBlog ? maxDirectItems - 1 : maxDirectItems
  );

  const dropdownPages = filteredPages.slice(
    showBlog ? maxDirectItems - 1 : maxDirectItems
  );

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-940 pointer-events-none opacity-100 transition-[transform,opacity,box-shadow] duration-320 ease-out ${isScrolled ? 'shadow-[0_22px_56px_rgba(8,15,13,0.14)]' : ''
          } ${isHidden && !isDrawerOpen ? '-translate-y-[calc(100%+32px)] opacity-0' : 'translate-y-0'
          }`}
        data-header
      >
        {/* HEADER META (Top bar) */}
        <div className="w-full pointer-events-auto bg-linear-to-br from-terra-dark via-terra to-[#c2603f] text-white/92 px-2">
          <div className="shell-container mx-auto min-h-8 flex items-center justify-between gap-3.5 max-lg:gap-3 py-3">
            <div
              className="flex items-center gap-3.5 min-w-0 max-lg:gap-3 max-lg:overflow-x-auto [&::-webkit-scrollbar]:hidden scrollbar-none"
              aria-label={t('common.nav_aria_label')}
            >
              {directPages.map((p) => {
                const titleStr = p.title?.[locale] || p.title?.vi || '';

                return (
                  <Link
                    key={p.slug}
                    className={getMetaLinkClass(pathname.includes(`/${p.slug}`))}
                    href={`/${locale}/${p.slug}`}
                  >
                    {titleStr}
                  </Link>
                );
              })}

              {showBlog && (
                <Link
                  className={getMetaLinkClass(pathname.includes('/blog'))}
                  href={`/${locale}/blog`}
                >
                  {blogLabelText}
                </Link>
              )}
            </div>

            <div className="ml-auto flex items-center shrink-0 gap-3">
              {dropdownPages.length > 0 && (
                <HeaderPagesDropdown
                  locale={locale}
                  pages={dropdownPages}
                  pathname={pathname}
                  blogLabel={blogLabelText}
                  showBlog={false}
                  getMetaLinkClass={getMetaLinkClass}
                />
              )}

              <select
                className="bg-white/12 text-white border border-white/24 rounded text-sm font-medium px-2 py-0.5 cursor-pointer outline-none transition-[background,border-color] duration-180 ease-out hover:bg-white/20 hover:border-white/45 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 font-inherit"
                aria-label={t('common.lang_selector_aria')}
                value={locale}
                onChange={handleLocaleChange}
              >
                {enabledLanguages.includes('vi') && (
                  <option className="bg-terra-dark text-white" value="vi">
                    Tiếng Việt
                  </option>
                )}

                {enabledLanguages.includes('en') && (
                  <option className="bg-terra-dark text-white" value="en">
                    English
                  </option>
                )}

                {enabledLanguages.includes('ru') && (
                  <option className="bg-terra-dark text-white" value="ru">
                    Русский
                  </option>
                )}

                {enabledLanguages.includes('zh') && (
                  <option className="bg-terra-dark text-white" value="zh">
                    中文
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* HEADER MAIN */}
        <div className={`w-full pointer-events-auto border-b border-white/36 backdrop-blur-[18px] backdrop-saturate-[1.12] px-2 transition-colors duration-320 ${isScrolled ? 'bg-[#f5f0e6]/92' : 'bg-[#efe4d2]/76'
          }`}>
          <div className="shell-container min-h-[72px] max-lg:min-h-[68px] flex items-center gap-4.5 max-lg:gap-3.5">
            <Link
              className="flex items-center gap-3.5 no-underline color-inherit shrink-0"
              href={getNavLink('/', 'main')}
              aria-label={t('common.home_brand_aria')}
            >
              <span className="w-[50px] h-[50px] p-0 rounded-none bg-none border-0 shadow-none flex items-center justify-center" aria-hidden="true">
                <Image className="w-full h-full object-contain" src="/images/khanh-hoa-emblem.png" alt="" width={50} height={50} />
              </span>
            </Link>

            <span className='text-xs md:text-lg lg:text-xl font-bold text-primary uppercase'>{t('common.header_title_nav')}</span>

            <div className="flex justify-end items-center gap-4.5 min-w-0 flex-auto">
              {/* MAIN NAVIGATION */}
              {currentPage && currentPage.sub_nav && currentPage.sub_nav.length > 0 ? (
                <nav
                  className="min-w-0 flex max-lg:hidden items-center gap-2.5"
                  aria-label={currentPage.title?.[locale] || currentPage.title?.['vi'] || 'Page navigation'}
                >
                  {currentPage.sub_nav[0] && (
                    <a
                      className={getHomeLinkClass(activeHash === `#${currentPage.sub_nav[0].anchor}`)}
                      href={`/`}
                      aria-label={t('common.home_aria')}
                    >
                      <Home className="w-4 h-4 fill-none stroke-current stroke-[1.9] stroke-linecap-round stroke-linejoin-round" aria-hidden="true" />
                    </a>
                  )}
                  {currentPage.sub_nav.map((item) => {
                    const labelStr = item.label?.[locale] || item.label?.['vi'] || '';
                    return (
                      <a
                        key={item.anchor}
                        className={getNavLinkClass(activeHash === `#${item.anchor}`, currentPage.sub_nav!.length > 5)}
                        href={`#${item.anchor}`}
                      >
                        {labelStr}
                      </a>
                    );
                  })}
                </nav>
              ) : pathname.includes('/ponagar') ? (
                <nav
                  className="min-w-0 flex max-lg:hidden items-center gap-2.5"
                  aria-label={t('common.ponagar_nav_aria')}
                >
                  <a
                    className={getHomeLinkClass(activeHash === '#ponagar-tong-quan')}
                    href="#ponagar-tong-quan"
                    aria-label={t('ponagar.nav.home_aria')}
                  >
                    <Home className="w-4 h-4 fill-none stroke-current stroke-[1.9] stroke-linecap-round stroke-linejoin-round" aria-hidden="true" />
                  </a>
                  <a className={getNavLinkClass(activeHash === '#ponagar-tong-quan', true)} href="#ponagar-tong-quan">{t('ponagar.nav.tong_quan')}</a>
                  <a className={getNavLinkClass(activeHash === '#ponagar-nu-than', true)} href="#ponagar-nu-than">{t('ponagar.nav.nu_than')}</a>
                  <a className={getNavLinkClass(activeHash === '#ponagar-hanh-trinh', true)} href="#ponagar-hanh-trinh">{t('ponagar.nav.hanh_trinh')}</a>
                  <a className={getNavLinkClass(activeHash === '#ponagar-thap-chinh', true)} href="#ponagar-thap-chinh">{t('ponagar.nav.thap_chinh')}</a>
                  <a className={getNavLinkClass(activeHash === '#ponagar-le-hoi', true)} href="#ponagar-le-hoi">{t('ponagar.nav.le_hoi')}</a>
                </nav>
              ) : pathname.includes('/hoalai') ? (
                <nav
                  className="min-w-0 flex max-lg:hidden items-center gap-2.5"
                  aria-label="Điều hướng Tháp Hòa Lai"
                >
                  <a
                    className={getHomeLinkClass(activeHash === '#hoalai-tong-quan')}
                    href="#hoalai-tong-quan"
                    aria-label={t('hoalai.nav.home_aria')}
                  >
                    <Home className="w-4 h-4 fill-none stroke-current stroke-[1.9] stroke-linecap-round stroke-linejoin-round" aria-hidden="true" />
                  </a>
                  <a className={getNavLinkClass(activeHash === '#hoalai-tong-quan', true)} href="#hoalai-tong-quan">{t('hoalai.nav.tong_quan')}</a>
                  <a className={getNavLinkClass(activeHash === '#hoalai-lich-su', true)} href="#hoalai-lich-su">{t('hoalai.nav.lich_su')}</a>
                  <a className={getNavLinkClass(activeHash === '#hoalai-ba-thap', true)} href="#hoalai-ba-thap">{t('hoalai.nav.ba_thap')}</a>
                  <a className={getNavLinkClass(activeHash === '#hoalai-hoa-van', true)} href="#hoalai-hoa-van">{t('hoalai.nav.hoa_van')}</a>
                  <a className={getNavLinkClass(activeHash === '#hoalai-bao-ton', true)} href="#hoalai-bao-ton">{t('hoalai.nav.bao_ton')}</a>
                </nav>
              ) : pathname.includes('/poklong') ? (
                <nav
                  className="min-w-0 flex max-lg:hidden items-center gap-2.5"
                  aria-label="Điều hướng Tháp Pô Klong Garai"
                >
                  <a
                    className={getHomeLinkClass(activeHash === '#poklong-tong-quan')}
                    href="#poklong-tong-quan"
                    aria-label={t('poklong.nav.home_aria')}
                  >
                    <Home className="w-4 h-4 fill-none stroke-current stroke-[1.9] stroke-linecap-round stroke-linejoin-round" aria-hidden="true" />
                  </a>
                  <a className={getNavLinkClass(activeHash === '#poklong-tong-quan', true)} href="#poklong-tong-quan">{t('poklong.nav.tong_quan')}</a>
                  <a className={getNavLinkClass(activeHash === '#poklong-vua-thieng', true)} href="#poklong-vua-thieng">{t('poklong.nav.vua_thieng')}</a>
                  <a className={getNavLinkClass(activeHash === '#poklong-quan-the', true)} href="#poklong-quan-the">{t('poklong.nav.quan_the')}</a>
                  <a className={getNavLinkClass(activeHash === '#poklong-kien-truc', true)} href="#poklong-kien-truc">{t('poklong.nav.kien_truc')}</a>
                  <a className={getNavLinkClass(activeHash === '#poklong-le-hoi', true)} href="#poklong-le-hoi">{t('poklong.nav.le_hoi')}</a>
                </nav>
              ) : pathname.includes('/porome') ? (
                <nav
                  className="min-w-0 flex max-lg:hidden items-center gap-2.5"
                  aria-label="Điều hướng Tháp Pô Rômê"
                >
                  <a
                    className={getHomeLinkClass(activeHash === '#porome-tong-quan')}
                    href="#porome-tong-quan"
                    aria-label={t('porome.nav.home_aria')}
                  >
                    <Home className="w-4 h-4 fill-none stroke-current stroke-[1.9] stroke-linecap-round stroke-linejoin-round" aria-hidden="true" />
                  </a>
                  <a className={getNavLinkClass(activeHash === '#porome-tong-quan', true)} href="#porome-tong-quan">{t('porome.nav.tong_quan')}</a>
                  <a className={getNavLinkClass(activeHash === '#porome-vi-vua', true)} href="#porome-vi-vua">{t('porome.nav.vi_vua')}</a>
                  <a className={getNavLinkClass(activeHash === '#porome-quan-the', true)} href="#porome-quan-the">{t('porome.nav.quan_the')}</a>
                  <a className={getNavLinkClass(activeHash === '#porome-thap-chinh', true)} href="#porome-thap-chinh">{t('porome.nav.thap_chinh')}</a>
                  <a className={getNavLinkClass(activeHash === '#porome-le-hoi', true)} href="#porome-le-hoi">{t('porome.nav.le_hoi')}</a>
                </nav>
              ) : pathname.includes('/blog') ? (
                <nav
                  className="min-w-0 flex max-lg:hidden items-center gap-2.5"
                  aria-label="Danh mục bài viết"
                >
                  <Link
                    className={getHomeLinkClass(false)}
                    href={`/${locale}`}
                    aria-label={t('common.home_aria')}
                  >
                    <Home className="w-4 h-4 fill-none stroke-current stroke-[1.9] stroke-linecap-round stroke-linejoin-round" aria-hidden="true" />
                  </Link>
                  <Link
                    className={getNavLinkClass(!activeCategorySlug, true)}
                    href={`/${locale}/blog`}
                  >
                    Tất cả
                  </Link>
                  {blogCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      className={getNavLinkClass(activeCategorySlug === cat.slug, true)}
                      href={`/${locale}/blog/category/${cat.slug}`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              ) : (!isHomeActive && !pathname.includes('/ponagar') && !pathname.includes('/hoalai') && !pathname.includes('/poklong') && !pathname.includes('/porome')) ? (
                <nav
                  className="min-w-0 flex max-lg:hidden items-center gap-3.5"
                  aria-label={t('common.main_nav_aria')}
                >
                  <Link
                    className={getHomeLinkClass(false)}
                    href={`/${locale}`}
                    aria-label={t('common.home_aria')}
                  >
                    <Home className="w-4 h-4 fill-none stroke-current stroke-[1.9] stroke-linecap-round stroke-linejoin-round" aria-hidden="true" />
                  </Link>
                </nav>
              ) : (
                <nav
                  className="min-w-0 flex max-lg:hidden items-center gap-3.5"
                  aria-label={t('common.main_nav_aria')}
                >
                  <a
                    className={getHomeLinkClass(activeHash === '#hero')}
                    href="#hero"
                    aria-label={t('common.home_aria')}
                  >
                    <Home className="w-4 h-4 fill-none stroke-current stroke-[1.9] stroke-linecap-round stroke-linejoin-round" aria-hidden="true" />
                  </a>
                  <a className={getNavLinkClass(activeHash === '#khong-gian', false)} href="#khong-gian">{t('main.nav.khong_gian')}</a>
                  <a className={getNavLinkClass(activeHash === '#thap-cham', false)} href="#thap-cham">{t('main.nav.thap_cham')}</a>
                  <a className={getNavLinkClass(activeHash === '#di-san', false)} href="#di-san">{t('main.nav.di_san')}</a>
                  <a className={getNavLinkClass(activeHash === '#hanh-trinh', false)} href="#hanh-trinh">{t('main.nav.hanh_trinh')}</a>
                  <a className={getNavLinkClass(activeHash === '#video', false)} href="#video">{t('main.nav.video')}</a>
                </nav>
              )}

              {/* MOBILE MENU TOGGLE */}
              <button
                className="w-[46px] h-[46px] max-lg:w-[42px] max-lg:h-[42px] items-center justify-center text-terra-dark shrink-0 max-lg:inline-flex lg:hidden"
                type="button"
                aria-label={t('common.menu_open')}
                aria-expanded={isDrawerOpen}
                onClick={toggleDrawer}
              >
                <span className="flex flex-col gap-[5px]" aria-hidden="true">
                  <span className={`w-6 h-0.5 rounded-full bg-current transition-[transform,opacity] duration-280 ease-out ${isDrawerOpen ? 'translate-y-[7px] -rotate-45' : ''
                    }`}></span>
                  <span className={`w-6 h-0.5 rounded-full bg-current transition-[transform,opacity] duration-220 ease-out ${isDrawerOpen ? 'opacity-0' : 'opacity-100'
                    }`}></span>
                  <span className={`w-6 h-0.5 rounded-full bg-current transition-[transform,opacity] duration-280 ease-out ${isDrawerOpen ? 'translate-y-[-7px] rotate-45' : ''
                    }`}></span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU DRAWER (Framer Motion) */}
        <AnimatePresence>
          {isDrawerOpen && (
            <motion.div
              className="absolute top-full left-0 w-full lg:hidden pt-0 z-940 pointer-events-auto"
              id="nav-drawer-panel"
              aria-label={t('common.nav_drawer_aria')}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              style={{ display: 'block' }} // Force block so styles-v2 overrides don't conflict
            >
              <div className="w-full bg-linear-to-br from-[#6e2b19]/98 to-[#501c0f]/97 border border-[#d46540]/24 shadow-[0_28px_58px_rgba(8,15,13,0.28)] text-white py-6 px-5 rounded-b">
                <div className="flex flex-col items-center gap-5 py-3">
                  <Link
                    className={`inline-block font-serif text-xl font-semibold tracking-[0.02em] no-underline border-b border-dashed px-3 py-1 transition-all duration-220 ease-out hover:text-white hover:border-white hover:scale-104 ${isHomeActive
                      ? 'text-white border-white scale-104'
                      : 'text-gold-lt border-[#e8b832]/25'
                      }`}
                    href={`/${locale}`}
                  >
                    {t('common.nav_drawer_main')}
                  </Link>
                  {dbPages.filter((p) => p.slug !== 'home').map((p) => {
                    const titleStr = p.title?.[locale] || p.title?.['vi'] || '';
                    const isActive = pathname.includes(`/${p.slug}`);
                    return (
                      <Link
                        key={p.slug}
                        className={`inline-block font-serif text-xl font-semibold tracking-[0.02em] no-underline border-b border-dashed px-3 py-1 transition-all duration-220 ease-out hover:text-white hover:border-white hover:scale-104 ${isActive
                          ? 'text-white border-white scale-104'
                          : 'text-gold-lt border-[#e8b832]/25'
                          }`}
                        href={`/${locale}/${p.slug}`}
                      >
                        {titleStr}
                      </Link>
                    );
                  })}
                  {showBlog && (
                    <Link
                      className={`inline-block font-serif text-xl font-semibold tracking-[0.02em] no-underline border-b border-dashed px-3 py-1 transition-all duration-220 ease-out hover:text-white hover:border-white hover:scale-104 ${pathname.includes('/blog')
                        ? 'text-white border-white scale-104'
                        : 'text-gold-lt border-[#e8b832]/25'
                        }`}
                      href={`/${locale}/blog`}
                    >
                      {blogLabelText}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SCRIM BACKDROP FOR DRAWER (Framer Motion) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.button
            className="fixed inset-0 z-[930] border-0 bg-[#080f0d]/22 backdrop-blur-[2px]"
            type="button"
            aria-label={t('common.menu_close')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
          />
        )}
      </AnimatePresence>
    </>
  );
}
