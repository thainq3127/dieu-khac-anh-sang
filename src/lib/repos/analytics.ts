import 'server-only'
import { db } from '@/lib/db'

export async function getContentCreatedAtStats() {
  const [pages, posts, mapLocations] = await Promise.all([
    db.query<{ created_at: string | null }>('select created_at from public.pages'),
    db.query<{ created_at: string | null }>('select created_at from public.posts'),
    db.query<{ created_at: string | null }>('select created_at from public.map_locations'),
  ])

  return {
    pages: pages.rows,
    posts: posts.rows,
    mapLocations: mapLocations.rows,
  }
}
