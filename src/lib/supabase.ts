import { createClient } from '@supabase/supabase-js'
import {
  getCachedViewCount,
  setCachedViewCount,
  getCachedViewCounts,
  setCachedViewCounts,
  invalidateCache,
  invalidateAllCache,
} from './view-cache'

// Re-export cache invalidation functions for use in API routes
export { invalidateCache, invalidateAllCache }

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
// Use process.env for Vercel serverless runtime, fallback to import.meta.env for local dev
// In Vercel, non-PUBLIC env vars are only available via process.env at runtime
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are not set. View tracking will not work.'
  )
}

/**
 * Client-side Supabase client for browser use
 * Uses anonymous key for public operations
 */
export const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Server-side Supabase client for API routes
 * Uses service role key for admin operations
 */
export const supabaseServer = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Database type for blog_views table
 */
export interface BlogView {
  slug: string
  view_count: number
  updated_at: string
}

/**
 * Fetches view counts for multiple blog post slugs
 * Uses in-memory cache first, then queries database for missing slugs
 * Returns a map of slug -> view_count, defaulting to 0 for missing slugs
 */
export async function getViewCounts(
  slugs: string[]
): Promise<Record<string, number>> {
  if (slugs.length === 0) {
    return {}
  }

  // Check cache first
  const { cached, missing } = getCachedViewCounts(slugs)

  // If all slugs are cached, return immediately
  if (missing.length === 0) {
    return cached
  }

  // If no Supabase client, return cached values + 0 for missing
  if (!supabaseServer) {
    const result = { ...cached }
    missing.forEach((slug) => {
      result[slug] = 0
    })
    return result
  }

  try {
    // Only query database for missing slugs
    const { data, error } = await supabaseServer
      .from('blog_views')
      .select('slug, view_count')
      .in('slug', missing)

    if (error) {
      console.error('Error fetching view counts:', error)
      // Return cached values + 0 for missing on error
      const result = { ...cached }
      missing.forEach((slug) => {
        result[slug] = 0
      })
      return result
    }

    // Build result with cached values
    const viewCounts: Record<string, number> = { ...cached }

    // Default missing slugs to 0
    missing.forEach((slug) => {
      viewCounts[slug] = 0
    })

    // Update with database values and cache them
    const toCache: Record<string, number> = {}
    if (data) {
      data.forEach((row: { slug: string; view_count: number }) => {
        viewCounts[row.slug] = row.view_count
        toCache[row.slug] = row.view_count
      })
    }

    // Cache the fetched values (including 0 for missing slugs)
    missing.forEach((slug) => {
      if (!(slug in toCache)) {
        toCache[slug] = 0
      }
    })
    setCachedViewCounts(toCache)

    return viewCounts
  } catch (error) {
    console.error('Failed to fetch view counts:', error)
    // Return cached values + 0 for missing on error
    const result = { ...cached }
    missing.forEach((slug) => {
      result[slug] = 0
    })
    return result
  }
}

/**
 * Fetches view count for a single blog post slug
 * Uses in-memory cache first, then queries database on cache miss
 */
export async function getViewCount(slug: string): Promise<number> {
  // Check cache first
  const cachedCount = getCachedViewCount(slug)
  if (cachedCount !== null) {
    return cachedCount
  }

  // Cache miss - query database
  if (!supabaseServer) {
    return 0
  }

  try {
    const { data, error } = await supabaseServer
      .from('blog_views')
      .select('view_count')
      .eq('slug', slug)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected for new posts
      console.error('Error fetching view count:', error)
      return 0
    }

    const count = data?.view_count ?? 0

    // Cache the result
    setCachedViewCount(slug, count)

    return count
  } catch (error) {
    console.error('Failed to fetch view count:', error)
    return 0
  }
}
