import { translateContent } from './translate'
import {
  getBlogSettings,
  getPublishedPageBlocks,
  getPublishedPostBySlug,
  getPublishedPostCategories,
  getPublishedPostCategoriesFull,
  getPublishedPosts,
  getPublishedPostsByCategory,
  isBlogVisible,
} from './repos/public-cms'

export type CMSBlock = {
  id: string
  page_id: string
  block_type: string
  sort_order: number
  content: Record<string, unknown>
  is_visible: boolean
  audio_url?: string | null
}

export type PostCategory = {
  id: string
  name: string
  slug?: string | null
}

export type PostCategoryFull = {
  id: string
  name: string
  slug: string
  description?: string
}

export type Post = {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  cover_image: string | null
  is_published: boolean
  published_at: string
  created_at: string
  updated_at: string
  category?: PostCategory | null
}

export type BlogSettings = {
  list_label: string
  list_title: string
  list_subtitle: string
}

export { translateContent }

export const getPageBlocks = getPublishedPageBlocks
export const getPosts = getPublishedPosts
export const getPostBySlug = getPublishedPostBySlug
export const getPostCategories = getPublishedPostCategories
export const getPostCategoriesFull = getPublishedPostCategoriesFull
export const getPostsByCategory = getPublishedPostsByCategory
export { isBlogVisible, getBlogSettings }
