import type { CollectionEntry } from 'astro:content'

/**
 * Gets blog posts, sorted by date (newest first)
 * @param limit - Optional limit to return only the latest posts
 * @returns Array of blog posts or empty array if collection fails to load
 */
export const getBlogPosts = async (
  limit?: number
): Promise<CollectionEntry<'blog'>[]> => {
  try {
    const { getCollection } = await import('astro:content')
    const posts = await getCollection('blog')

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

/**
 * Gets all unique categories from blog posts
 * Returns empty array if no categories found
 */
export const getAllPostCategories = async (): Promise<string[]> => {
  try {
    const posts = await getBlogPosts()

    // Extract categories and filter out undefined/empty values
    const categories = posts
      .map((post) => post.data.category)
      .filter((category): category is string => Boolean(category))

    // Return unique categories
    return [...new Set(categories)]
  } catch (error) {
    console.error('Failed to load categories:', error)
    return []
  }
}

/**
 * Gets posts filtered by category, or all posts if no category specified
 * Returns empty array if no posts found
 */
export const getPostsByCategory = async (
  category?: string | null
): Promise<CollectionEntry<'blog'>[]> => {
  try {
    const allPosts = await getBlogPosts()

    // If no category specified, return all posts
    if (!category) {
      return allPosts
    }

    // Filter posts by category (case-insensitive)
    return allPosts.filter(
      (post) => post.data.category?.toLowerCase() === category.toLowerCase()
    )
  } catch (error) {
    console.error('Failed to filter posts by category:', error)
    return []
  }
}

/**
 * Sorts blog posts by date in descending order (newest first)
 * Filters out posts with invalid dates
 */
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
