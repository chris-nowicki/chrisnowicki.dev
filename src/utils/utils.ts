import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formats view count for display with comma separators (e.g., 1234 -> "1,234")
 */
export function formatViewCount(count: number): string {
  return count.toLocaleString('en-US')
}

/**
 * Local storage key for tracking viewed blog posts
 */
const VIEWED_POSTS_STORAGE_KEY = 'blog-viewed-posts'

/**
 * Time period in milliseconds before a post can be counted as viewed again
 * Default: 30 minutes (prevents refresh spam while allowing legitimate return visits)
 * Common alternatives: 1 hour (3600000), 24 hours (86400000)
 */
const VIEW_COUNT_COOLDOWN_MS = 30 * 60 * 1000 // 30 minutes

/**
 * Check if view count protection is disabled via environment variable
 * Set PUBLIC_DISABLE_VIEW_COUNT_PROTECTION=true to disable protection (for testing)
 */
function isViewCountProtectionDisabled(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  const envValue = import.meta.env.PUBLIC_DISABLE_VIEW_COUNT_PROTECTION
  return envValue === 'true' || envValue === '1'
}

/**
 * Type for viewed posts storage
 */
type ViewedPosts = Record<string, number> // slug -> timestamp

/**
 * Get all viewed posts from local storage
 */
function getViewedPosts(): ViewedPosts {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const stored = localStorage.getItem(VIEWED_POSTS_STORAGE_KEY)
    if (!stored) {
      return {}
    }
    return JSON.parse(stored) as ViewedPosts
  } catch {
    return {}
  }
}

/**
 * Save viewed posts to local storage
 */
function saveViewedPosts(posts: ViewedPosts): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(VIEWED_POSTS_STORAGE_KEY, JSON.stringify(posts))
  } catch (error) {
    console.warn('Failed to save viewed posts to local storage:', error)
  }
}

/**
 * Check if a blog post was viewed recently (within the cooldown period)
 * @param slug - Blog post slug
 * @returns true if the post was viewed within the cooldown period
 *         Always returns false if protection is disabled via env var
 */
export function wasPostViewedRecently(slug: string): boolean {
  // If protection is disabled (for testing), always allow incrementing
  if (isViewCountProtectionDisabled()) {
    return false
  }

  const viewedPosts = getViewedPosts()
  const viewedAt = viewedPosts[slug]

  if (!viewedAt) {
    return false
  }

  const now = Date.now()
  const timeSinceView = now - viewedAt

  return timeSinceView < VIEW_COUNT_COOLDOWN_MS
}

/**
 * Mark a blog post as viewed (stores current timestamp)
 * @param slug - Blog post slug
 */
export function markPostAsViewed(slug: string): void {
  const viewedPosts = getViewedPosts()
  viewedPosts[slug] = Date.now()
  saveViewedPosts(viewedPosts)
}

/**
 * Clear old viewed posts that are beyond the cooldown period
 * This helps keep local storage clean
 */
export function cleanupOldViewedPosts(): void {
  const viewedPosts = getViewedPosts()
  const now = Date.now()
  const cleaned: ViewedPosts = {}

  for (const [slug, viewedAt] of Object.entries(viewedPosts)) {
    const timeSinceView = now - viewedAt
    // Keep entries that are still within cooldown period
    if (timeSinceView < VIEW_COUNT_COOLDOWN_MS) {
      cleaned[slug] = viewedAt
    }
  }

  if (Object.keys(cleaned).length !== Object.keys(viewedPosts).length) {
    saveViewedPosts(cleaned)
  }
}
