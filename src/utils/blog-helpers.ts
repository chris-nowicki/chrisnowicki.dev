import { getEmDashCollection, getEmDashEntry } from 'emdash'

import type { CacheHint, EmDashCollections } from 'emdash'

type Post = EmDashCollections['posts']

/** A published blog post, shaped for the site's pages and components. */
export interface BlogPost {
  /** The post slug; doubles as the URL segment (`/blog/{id}`). */
  id: string
  data: Omit<Post, 'date'> & { date: Date }
}

export interface BlogPostsResult {
  posts: BlogPost[]
  /** Pass to `Astro.cache.set()` (see `applyCacheHint`). */
  cacheHint: CacheHint
}

export interface BlogPostResult {
  post: BlogPost | null
  cacheHint: CacheHint
  /** True when serving a draft through an EmDash preview link. */
  isPreview: boolean
}

const toBlogPost = ({ id, data }: { id: string; data: Post }): BlogPost => ({
  id,
  data: { ...data, date: new Date(data.date) },
})

/**
 * Published posts, newest first. `date` is an indexed custom field on the
 * `posts` collection, so EmDash can sort on it directly. Drafts are viewed
 * through EmDash preview links, not this list.
 */
export const getBlogPosts = async (
  limit?: number
): Promise<BlogPostsResult> => {
  const { entries, error, cacheHint } = await getEmDashCollection('posts', {
    status: 'published',
    orderBy: { date: 'desc' },
    limit,
  })

  if (error) throw error

  return { posts: entries.map(toBlogPost), cacheHint }
}

/** A single post by slug; `post` is null when it doesn't exist. */
export const getBlogPost = async (slug: string): Promise<BlogPostResult> => {
  const { entry, error, cacheHint, isPreview } = await getEmDashEntry(
    'posts',
    slug
  )

  if (error) throw error

  return { post: entry ? toBlogPost(entry) : null, cacheHint, isPreview }
}

/**
 * Forward EmDash's cache hint to Astro route caching. A no-op until a cache
 * provider is configured (`Astro.cache.enabled` is false in dev and without
 * one), which avoids Astro's "caching is not enabled" warning.
 */
export const applyCacheHint = (
  cache: { enabled: boolean; set: (hint: CacheHint) => void } | undefined,
  cacheHint: CacheHint
) => {
  if (cache?.enabled) cache.set(cacheHint)
}
