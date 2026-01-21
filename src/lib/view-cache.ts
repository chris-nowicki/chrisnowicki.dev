/**
 * In-memory cache for view counts with TTL (Time To Live)
 * This provides per-instance caching for serverless functions
 * Works alongside CDN caching (HTTP headers) for optimal performance
 */

interface CacheEntry {
  count: number
  expiresAt: number
}

// Default TTL: 60 seconds (matches CDN cache duration)
const DEFAULT_TTL_MS = 60 * 1000

// In-memory cache store
const cache = new Map<string, CacheEntry>()

/**
 * Get cached view count for a single slug
 * Returns null if not cached or expired
 */
export function getCachedViewCount(slug: string): number | null {
  const entry = cache.get(slug)
  if (entry && entry.expiresAt > Date.now()) {
    return entry.count
  }
  // Remove expired entry
  if (entry) {
    cache.delete(slug)
  }
  return null
}

/**
 * Set cached view count for a single slug
 */
export function setCachedViewCount(
  slug: string,
  count: number,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  cache.set(slug, {
    count,
    expiresAt: Date.now() + ttlMs,
  })
}

/**
 * Get cached view counts for multiple slugs
 * Returns object with cached values and array of missing slugs
 */
export function getCachedViewCounts(slugs: string[]): {
  cached: Record<string, number>
  missing: string[]
} {
  const cached: Record<string, number> = {}
  const missing: string[] = []

  for (const slug of slugs) {
    const count = getCachedViewCount(slug)
    if (count !== null) {
      cached[slug] = count
    } else {
      missing.push(slug)
    }
  }

  return { cached, missing }
}

/**
 * Set cached view counts for multiple slugs
 */
export function setCachedViewCounts(
  counts: Record<string, number>,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  for (const [slug, count] of Object.entries(counts)) {
    setCachedViewCount(slug, count, ttlMs)
  }
}

/**
 * Invalidate cache for a specific slug
 * Call this after updating view count via POST
 */
export function invalidateCache(slug: string): void {
  cache.delete(slug)
}

/**
 * Clear entire cache
 * Useful for testing or manual cache reset
 */
export function invalidateAllCache(): void {
  cache.clear()
}

/**
 * Get cache statistics (for debugging/monitoring)
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  }
}
