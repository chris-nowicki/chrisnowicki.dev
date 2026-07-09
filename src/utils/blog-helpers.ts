import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'

export const sortPostsByDate = (
  posts: CollectionEntry<'blog'>[]
): CollectionEntry<'blog'>[] =>
  [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())

export const getBlogPosts = async (
  limit?: number
): Promise<CollectionEntry<'blog'>[]> => {
  const posts = await getCollection(
    'blog',
    ({ data }) => import.meta.env.DEV || !data.draft
  )

  const sortedPosts = sortPostsByDate(posts)
  return limit ? sortedPosts.slice(0, limit) : sortedPosts
}
