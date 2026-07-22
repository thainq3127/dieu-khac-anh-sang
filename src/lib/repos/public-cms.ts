import 'server-only'
import { db } from '@/lib/db'
import { translateContent } from '@/lib/translate'
import type { CMSBlock, Post, PostCategory, PostCategoryFull, BlogSettings } from '@/lib/cms'

type RawCategory = { id: string | null; name: Record<string, string> | null; slug?: string | null } | null

function localizeCategory(raw: RawCategory, locale: string): PostCategory | null {
  if (!raw?.id) return null
  return {
    id: raw.id,
    name: raw.name?.[locale] || raw.name?.vi || '',
    slug: raw.slug ?? null,
  }
}

function localizedText(value: unknown, locale: string) {
  if (!value || typeof value !== 'object') return ''
  const text = value as Record<string, string>
  return text[locale] || text.vi || ''
}

function localizePost(row: Record<string, unknown>, locale: string): Post {
  return {
    ...row,
    title: localizedText(row.title, locale),
    summary: localizedText(row.summary, locale),
    content: localizedText(row.content, locale),
    category: localizeCategory(row.post_categories as RawCategory, locale),
  } as Post
}

export async function getPublishedPageBlocks(slug: string, locale = 'vi'): Promise<CMSBlock[] | null> {
  const pageResult = await db.query<{ id: string; audio_url: string | null }>(
    'select id, audio_url from public.pages where slug = $1 and is_published = true limit 1',
    [slug],
  )
  const page = pageResult.rows[0]
  if (!page) return null

  const blockResult = await db.query<CMSBlock>(
    `select * from public.content_blocks
     where page_id = $1 and is_visible = true
     order by sort_order asc`,
    [page.id],
  )
  if (!blockResult.rows.length) return null

  return blockResult.rows.map((block) => ({
    ...block,
    content: translateContent(block.content, locale),
    audio_url: page.audio_url,
  }))
}

export async function getPublishedPosts(locale = 'vi'): Promise<Post[]> {
  const result = await db.query(
    `select p.*,
      jsonb_build_object('id', pc.id, 'name', pc.name, 'slug', pc.slug) as post_categories
     from public.posts p
     left join public.post_categories pc on pc.id = p.category_id
     where p.is_published = true
     order by p.published_at desc`,
  )
  return result.rows.map((post) => localizePost(post, locale))
}

export async function getPublishedPostBySlug(slug: string, locale = 'vi'): Promise<Post | null> {
  const result = await db.query(
    `select p.*,
      jsonb_build_object('id', pc.id, 'name', pc.name, 'slug', pc.slug) as post_categories
     from public.posts p
     left join public.post_categories pc on pc.id = p.category_id
     where p.slug = $1 and p.is_published = true
     limit 1`,
    [slug],
  )
  return result.rows[0] ? localizePost(result.rows[0], locale) : null
}

export async function getPublishedPostCategories(locale = 'vi'): Promise<PostCategory[]> {
  const result = await db.query<{ id: string; name: Record<string, string>; slug: string | null }>(
    'select id, name, slug from public.post_categories order by sort_order asc',
  )
  return result.rows.map((cat) => ({
    id: cat.id,
    name: cat.name?.[locale] || cat.name?.vi || '',
    slug: cat.slug,
  }))
}

export async function getPublishedPostCategoriesFull(locale = 'vi'): Promise<PostCategoryFull[]> {
  const result = await db.query<{ id: string; name: Record<string, string>; slug: string | null; description: Record<string, string> | null }>(
    'select id, name, slug, description from public.post_categories where slug is not null order by sort_order asc',
  )
  return result.rows
    .filter((cat) => cat.slug)
    .map((cat) => ({
      id: cat.id,
      name: cat.name?.[locale] || cat.name?.vi || '',
      slug: cat.slug as string,
      description: cat.description?.[locale] || cat.description?.vi || '',
    }))
}

export async function getPublishedPostsByCategory(categorySlug: string, locale = 'vi'): Promise<Post[]> {
  const result = await db.query(
    `select p.*,
      jsonb_build_object('id', pc.id, 'name', pc.name, 'slug', pc.slug) as post_categories
     from public.posts p
     inner join public.post_categories pc on pc.id = p.category_id
     where p.is_published = true and pc.slug = $1
     order by p.published_at desc`,
    [categorySlug],
  )
  return result.rows.map((post) => localizePost(post, locale))
}

export async function isBlogVisible(): Promise<boolean> {
  const result = await db.query<{ value: unknown }>(
    "select value from public.site_settings where key = 'show_blog' limit 1",
  )
  const value = result.rows[0]?.value
  if (value === undefined) return true
  return value === true || value === 'true'
}

export async function getBlogSettings(locale = 'vi'): Promise<BlogSettings | null> {
  const result = await db.query<{ value: Record<string, Record<string, string>> }>(
    "select value from public.site_settings where key = 'blog_settings' limit 1",
  )
  const settings = result.rows[0]?.value
  if (!settings) return null
  return {
    list_label: settings.list_label?.[locale] || settings.list_label?.vi || '',
    list_title: settings.list_title?.[locale] || settings.list_title?.vi || '',
    list_subtitle: settings.list_subtitle?.[locale] || settings.list_subtitle?.vi || '',
  }
}

export async function getPageMetaBySlug(slug: string) {
  const result = await db.query(
    'select title, description, seo_image from public.pages where slug = $1 and is_published = true limit 1',
    [slug],
  )
  return result.rows[0] ?? null
}

export async function getPublishedPageStatus(slug: string) {
  const result = await db.query<{ id: string; is_published: boolean }>(
    'select id, is_published from public.pages where slug = $1 limit 1',
    [slug],
  )
  return result.rows[0] ?? null
}

export async function getPublishedNavPages() {
  const result = await db.query(
    'select slug, title, sub_nav from public.pages where is_published = true order by sort_order asc',
  )
  return result.rows
}

export async function getPublicMapLocations() {
  const result = await db.query(
    `select ml.*,
      jsonb_build_object('id', p.id, 'slug', p.slug, 'title', p.title) as pages
     from public.map_locations ml
     left join public.pages p on p.id = ml.page_id
     where ml.is_published = true
     order by ml.sort_order asc`,
  )
  return result.rows
}
