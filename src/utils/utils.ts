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

export function formatViewCount(count: number): string {
  return count.toLocaleString('en-US')
}

const VIEWED_POSTS_STORAGE_KEY = 'blog-viewed-posts'
const VIEW_COUNT_COOLDOWN_MS = 30 * 60 * 1000 // Prevents refresh spam

type ViewedPosts = Record<string, number>

function isViewCountProtectionDisabled(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  const envValue = import.meta.env.PUBLIC_DISABLE_VIEW_COUNT_PROTECTION
  return envValue === 'true' || envValue === '1'
}

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

export function wasPostViewedRecently(slug: string): boolean {
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

export function markPostAsViewed(slug: string): void {
  const viewedPosts = getViewedPosts()
  viewedPosts[slug] = Date.now()
  saveViewedPosts(viewedPosts)
}

export function cleanupOldViewedPosts(): void {
  const viewedPosts = getViewedPosts()
  const now = Date.now()
  const cleaned: ViewedPosts = {}

  for (const [slug, viewedAt] of Object.entries(viewedPosts)) {
    const timeSinceView = now - viewedAt
    if (timeSinceView < VIEW_COUNT_COOLDOWN_MS) {
      cleaned[slug] = viewedAt
    }
  }

  if (Object.keys(cleaned).length !== Object.keys(viewedPosts).length) {
    saveViewedPosts(cleaned)
  }
}
