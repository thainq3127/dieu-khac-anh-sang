import 'server-only'
import { db } from '@/lib/db'

export type PostInput = {
  slug?: string
  title?: unknown
  summary?: unknown
  content?: unknown
  cover_image?: string | null
  is_published?: boolean
  published_at?: string
  category_id?: string | null
}

export type PostCategoryInput = {
  name?: unknown
  slug?: string | null
  description?: unknown
  sort_order?: number
}

function compact(input: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined))
}

function buildSet(input: Record<string, unknown>) {
  const entries = Object.entries(input)
  return {
    sql: entries.map(([key], index) => `"${key}" = $${index + 1}`).join(', '),
    values: entries.map(([, value]) => value),
  }
}

export async function getAdminPosts() {
  const result = await db.query(
    `select p.id, p.slug, p.title, p.cover_image, p.is_published, p.published_at, p.category_id,
      jsonb_build_object('id', pc.id, 'name', pc.name, 'slug', pc.slug) as post_categories
     from public.posts p
     left join public.post_categories pc on pc.id = p.category_id
     order by p.published_at desc`,
  )
  return result.rows
}

export async function getAdminPostById(id: string) {
  const result = await db.query('select * from public.posts where id = $1 limit 1', [id])
  return result.rows[0] ?? null
}

export async function getAdminPostBySlug(slug: string) {
  const result = await db.query('select id from public.posts where slug = $1 limit 1', [slug])
  return result.rows[0] ?? null
}

export async function createPost(input: PostInput) {
  const payload = compact(input as Record<string, unknown>)
  const keys = Object.keys(payload)
  const values = Object.values(payload)
  const result = await db.query(
    `insert into public.posts (${keys.map((key) => `"${key}"`).join(', ')})
     values (${values.map((_, index) => `$${index + 1}`).join(', ')}) returning *`,
    values,
  )
  return result.rows[0]
}

export async function updatePost(id: string, input: PostInput) {
  const payload = compact({ ...input, updated_at: new Date().toISOString() } as Record<string, unknown>)
  const set = buildSet(payload)
  const result = await db.query(
    `update public.posts set ${set.sql} where id = $${set.values.length + 1} returning *`,
    [...set.values, id],
  )
  return result.rows[0] ?? null
}

export async function deletePost(id: string) {
  await db.query('delete from public.posts where id = $1', [id])
}

export async function duplicatePost(id: string, slug: string, title: unknown) {
  const original = await getAdminPostById(id)
  if (!original) throw new Error('Không tìm thấy bài viết gốc')
  return createPost({
    slug,
    title,
    summary: original.summary || { vi: '', en: '', ru: '', zh: '' },
    content: original.content || { vi: '', en: '', ru: '', zh: '' },
    cover_image: original.cover_image,
    category_id: original.category_id ?? null,
    is_published: false,
    published_at: new Date().toISOString(),
  })
}

export async function getPostCategories() {
  const result = await db.query('select * from public.post_categories order by sort_order asc')
  return result.rows
}

export async function createPostCategory(input: PostCategoryInput) {
  const payload = compact(input as Record<string, unknown>)
  const keys = Object.keys(payload)
  const values = Object.values(payload)
  const result = await db.query(
    `insert into public.post_categories (${keys.map((key) => `"${key}"`).join(', ')})
     values (${values.map((_, index) => `$${index + 1}`).join(', ')}) returning *`,
    values,
  )
  return result.rows[0]
}

export async function updatePostCategory(id: string, input: PostCategoryInput) {
  const payload = compact({ ...input, updated_at: new Date().toISOString() } as Record<string, unknown>)
  const set = buildSet(payload)
  const result = await db.query(
    `update public.post_categories set ${set.sql} where id = $${set.values.length + 1} returning *`,
    [...set.values, id],
  )
  return result.rows[0] ?? null
}

export async function deletePostCategory(id: string) {
  await db.query('delete from public.post_categories where id = $1', [id])
}
