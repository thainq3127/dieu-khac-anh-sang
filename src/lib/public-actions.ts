'use server'

import {
  getBlogSettings,
  getPageMetaBySlug,
  getPublishedNavPages,
  getPublishedPageStatus,
  getPublishedPostCategories,
  getPublicMapLocations,
  isBlogVisible,
} from '@/lib/repos/public-cms'
import { getSetting } from '@/lib/repos/settings'

export async function getPublicHeaderData(locale: string, includeBlogCategories: boolean) {
  const [blogSettings, enabledLanguages, showBlog, pages, categories] = await Promise.all([
    getBlogSettings(locale),
    getSetting<string[]>('enabled_languages'),
    isBlogVisible(),
    getPublishedNavPages(),
    includeBlogCategories ? getPublishedPostCategories(locale) : Promise.resolve([]),
  ])

  return {
    blogTitle: blogSettings?.list_title ?? '',
    enabledLanguages: enabledLanguages?.length ? enabledLanguages : ['vi', 'en', 'ru', 'zh'],
    showBlog,
    pages,
    categories,
  }
}

export async function getPublicFooterPages() {
  return getPublishedNavPages()
}

export async function getPublicMapData() {
  return getPublicMapLocations()
}

export async function getPublicPageMeta(slug: string) {
  return getPageMetaBySlug(slug)
}

export async function getPublicPageStatus(slug: string) {
  return getPublishedPageStatus(slug)
}
