import 'server-only'
import { db, withTransaction } from '@/lib/db'

export type PageInput = {
  slug?: string
  title?: unknown
  description?: unknown
  seo_image?: string | null
  audio_url?: string | null
  is_published?: boolean
  sort_order?: number
  sub_nav?: unknown
}

export type BlockInput = {
  page_id?: string
  block_type?: string
  sort_order?: number
  content?: unknown
  is_visible?: boolean
  label?: string | null
}

function compact<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined))
}

function buildSet(input: Record<string, unknown>, startIndex = 1) {
  const entries = Object.entries(input)
  return {
    entries,
    sql: entries.map(([key], index) => `"${key}" = $${startIndex + index}`).join(', '),
    values: entries.map(([, value]) => {
      // pg formats JS arrays as PostgreSQL array literals ({...}) rather than JSON arrays ([...]),
      // which breaks JSONB columns. Explicitly stringify objects and arrays so pg sends valid JSON.
      if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        return JSON.stringify(value)
      }
      return value
    }),
  }
}

export async function getAdminPages() {
  const result = await db.query('select * from public.pages order by sort_order asc')
  return result.rows
}

export async function getPageBySlug(slug: string) {
  const result = await db.query('select * from public.pages where slug = $1 limit 1', [slug])
  return result.rows[0] ?? null
}

export async function getPageById(id: string) {
  const result = await db.query('select * from public.pages where id = $1 limit 1', [id])
  return result.rows[0] ?? null
}

export async function createPage(input: PageInput) {
  const payload = compact(input as Record<string, unknown>)
  const keys = Object.keys(payload)
  const values = Object.values(payload)
  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ')
  const result = await db.query(
    `insert into public.pages (${keys.map((key) => `"${key}"`).join(', ')})
     values (${placeholders}) returning *`,
    values,
  )
  return result.rows[0]
}

export async function updatePage(id: string, input: PageInput) {
  const payload = compact({ ...input, updated_at: new Date().toISOString() } as Record<string, unknown>)
  const set = buildSet(payload)
  const result = await db.query(
    `update public.pages set ${set.sql} where id = $${set.values.length + 1} returning *`,
    [...set.values, id],
  )
  return result.rows[0] ?? null
}

export async function deletePage(id: string) {
  await db.query('delete from public.pages where id = $1', [id])
}

export async function getPageBlocks(pageId: string) {
  const result = await db.query('select * from public.content_blocks where page_id = $1 order by sort_order asc', [pageId])
  return result.rows
}

export async function getPageBySlugWithBlocks(slug: string) {
  const page = await getPageBySlug(slug)
  if (!page) return { page: null, blocks: [] }
  const blocks = await getPageBlocks(page.id)
  return { page, blocks }
}

export async function createBlock(input: BlockInput) {
  const payload = compact(input as Record<string, unknown>)
  const keys = Object.keys(payload)
  const values = Object.values(payload)
  const result = await db.query(
    `insert into public.content_blocks (${keys.map((key) => `"${key}"`).join(', ')})
     values (${values.map((_, index) => `$${index + 1}`).join(', ')}) returning *`,
    values,
  )
  return result.rows[0]
}

export async function updateBlock(id: string, input: BlockInput) {
  const payload = compact({ ...input, updated_at: new Date().toISOString() } as Record<string, unknown>)
  const set = buildSet(payload)
  const result = await db.query(
    `update public.content_blocks set ${set.sql} where id = $${set.values.length + 1} returning *`,
    [...set.values, id],
  )
  return result.rows[0] ?? null
}

export async function deleteBlock(id: string) {
  await db.query('delete from public.content_blocks where id = $1', [id])
}

export async function duplicatePage(id: string, input: PageInput) {
  return withTransaction(async (client) => {
    const pageResult = await client.query('select * from public.pages where id = $1 limit 1', [id])
    const page = pageResult.rows[0]
    if (!page) throw new Error('Không tìm thấy trang gốc')

    const newPage = {
      slug: input.slug,
      title: input.title,
      description: input.description ?? page.description,
      seo_image: input.seo_image ?? page.seo_image,
      audio_url: input.audio_url ?? page.audio_url,
      is_published: false,
      sort_order: input.sort_order ?? page.sort_order + 5,
    }
    const created = await client.query(
      `insert into public.pages (slug, title, description, seo_image, audio_url, is_published, sort_order)
       values ($1, $2, $3, $4, $5, $6, $7) returning *`,
      [newPage.slug, newPage.title, newPage.description, newPage.seo_image, newPage.audio_url, newPage.is_published, newPage.sort_order],
    )

    const blocks = await client.query('select * from public.content_blocks where page_id = $1 order by sort_order asc', [id])
    for (const block of blocks.rows) {
      await client.query(
        `insert into public.content_blocks (page_id, block_type, sort_order, content, is_visible, label)
         values ($1, $2, $3, $4, $5, $6)`,
        [created.rows[0].id, block.block_type, block.sort_order, block.content, block.is_visible, block.label ?? null],
      )
    }

    return created.rows[0]
  })
}

export async function reorderBlocks(orderedBlocks: Array<{ id: string; sort_order: number }>) {
  await withTransaction(async (client) => {
    for (const block of orderedBlocks) {
      await client.query(
        'update public.content_blocks set sort_order = $1, updated_at = now() where id = $2',
        [block.sort_order, block.id],
      )
    }
  })
}
