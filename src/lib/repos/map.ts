import 'server-only'
import { db } from '@/lib/db'

export type MapLocationInput = {
  name?: unknown
  description?: unknown
  lat?: number
  lng?: number
  icon_color?: string
  sort_order?: number
  is_published?: boolean
  google_maps_url?: string | null
  category_id?: string | null
  page_id?: string | null
}

export type LocationCategoryInput = {
  name?: unknown
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

export async function getAdminMapLocations() {
  const result = await db.query(
    `select ml.*,
      jsonb_build_object('id', lc.id, 'name', lc.name) as location_categories,
      jsonb_build_object('id', p.id, 'slug', p.slug, 'title', p.title) as pages
     from public.map_locations ml
     left join public.location_categories lc on lc.id = ml.category_id
     left join public.pages p on p.id = ml.page_id
     order by ml.sort_order asc`,
  )
  return result.rows
}

export async function createMapLocation(input: MapLocationInput) {
  const payload = compact(input as Record<string, unknown>)
  const keys = Object.keys(payload)
  const values = Object.values(payload)
  const result = await db.query(
    `insert into public.map_locations (${keys.map((key) => `"${key}"`).join(', ')})
     values (${values.map((_, index) => `$${index + 1}`).join(', ')}) returning *`,
    values,
  )
  return result.rows[0]
}

export async function updateMapLocation(id: string, input: MapLocationInput) {
  const payload = compact({ ...input, updated_at: new Date().toISOString() } as Record<string, unknown>)
  const set = buildSet(payload)
  const result = await db.query(
    `update public.map_locations set ${set.sql} where id = $${set.values.length + 1} returning *`,
    [...set.values, id],
  )
  return result.rows[0] ?? null
}

export async function deleteMapLocation(id: string) {
  await db.query('delete from public.map_locations where id = $1', [id])
}

export async function getLocationCategories() {
  const result = await db.query('select * from public.location_categories order by created_at asc')
  return result.rows
}

export async function createLocationCategory(input: LocationCategoryInput) {
  const result = await db.query(
    'insert into public.location_categories (name, created_at, updated_at) values ($1, now(), now()) returning *',
    [input.name],
  )
  return result.rows[0]
}

export async function updateLocationCategory(id: string, input: LocationCategoryInput) {
  const result = await db.query(
    'update public.location_categories set name = $1, updated_at = now() where id = $2 returning *',
    [input.name, id],
  )
  return result.rows[0] ?? null
}

export async function deleteLocationCategory(id: string) {
  await db.query('delete from public.location_categories where id = $1', [id])
}
