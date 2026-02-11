import type { CollectionEntry } from 'astro:content'

export const getBlogPosts = async (
  limit?: number
): Promise<CollectionEntry<'blog'>[]> => {
  try {
    const { getCollection } = await import('astro:content')
    const posts = await getCollection(
      'blog',
      ({ data }) => import.meta.env.DEV || !data.draft
    )

    if (!posts || posts.length === 0) {
      console.warn('No blog posts found in collection')
      return []
    }

    const sortedPosts = sortPostsByDate(posts)
    return limit ? sortedPosts.slice(0, limit) : sortedPosts
  } catch (error) {
    console.error('Failed to load blog posts:', error)
    return []
  }
}

export const getAllPostCategories = async (): Promise<string[]> => {
  try {
    const posts = await getBlogPosts()

    const categories = posts
      .map((post) => post.data.category)
      .filter((category): category is string => Boolean(category))

    return [...new Set(categories)]
  } catch (error) {
    console.error('Failed to load categories:', error)
    return []
  }
}

export const getPostsByCategory = async (
  category?: string | null
): Promise<CollectionEntry<'blog'>[]> => {
  try {
    const allPosts = await getBlogPosts()

    if (!category) {
      return allPosts
    }

    return allPosts.filter(
      (post) => post.data.category?.toLowerCase() === category.toLowerCase()
    )
  } catch (error) {
    console.error('Failed to filter posts by category:', error)
    return []
  }
}

export const sortPostsByDate = (
  posts: CollectionEntry<'blog'>[]
): CollectionEntry<'blog'>[] => {
  return posts
    .filter((post) => {
      if (!post.data.date) {
        console.warn(
          `Blog post "${post.id}" is missing a date and will be excluded`
        )
        return false
      }
      return true
    })
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}
