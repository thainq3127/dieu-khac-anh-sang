import 'server-only'
import { db } from '@/lib/db'

export type SiteSettings = {
  site_title: { vi: string; en: string }
  site_description: { vi: string; en: string }
  contact_email: string
  social_links: { facebook: string; youtube: string; instagram: string }
  enabled_languages: string[]
  show_blog: boolean
}

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const result = await db.query<{ value: T }>(
    'select value from public.site_settings where key = $1 limit 1',
    [key],
  )
  return result.rows[0]?.value ?? null
}

export async function setSetting(key: string, value: unknown) {
  await db.query(
    `insert into public.site_settings (key, value, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at`,
    [key, JSON.stringify(value)],
  )
}

export async function getAdminSettings(): Promise<Partial<SiteSettings>> {
  const result = await db.query<{ key: string; value: unknown }>(
    `select key, value from public.site_settings
     where key = any($1::text[])
     order by key asc`,
    [['site_title', 'site_description', 'contact_email', 'social_links', 'enabled_languages', 'show_blog']],
  )
  return Object.fromEntries(result.rows.map((row) => [row.key, row.value])) as Partial<SiteSettings>
}

export async function setAdminSettings(settings: SiteSettings) {
  for (const [key, value] of Object.entries(settings)) {
    await setSetting(key, value)
  }
}

export async function setBlogSettings(value: unknown) {
  await setSetting('blog_settings', value)
}

export async function setShowBlog(value: boolean) {
  await setSetting('show_blog', value)
}
