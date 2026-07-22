'use server'

import { updateTag } from 'next/cache'

export async function revalidateCMS() {
  updateTag('cms')
}

export async function revalidatePage(slug: string) {
  updateTag(`page-${slug}`)
}

export async function revalidatePosts() {
  updateTag('posts')
}

export async function revalidatePost(slug: string) {
  updateTag(`post-${slug}`)
}
