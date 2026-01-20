import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

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
 * Returns a map of slug -> view_count, defaulting to 0 for missing slugs
 */
export async function getViewCounts(
  slugs: string[]
): Promise<Record<string, number>> {
  if (!supabaseServer || slugs.length === 0) {
    return slugs.reduce((acc, slug) => ({ ...acc, [slug]: 0 }), {})
  }

  try {
    const { data, error } = await supabaseServer
      .from('blog_views')
      .select('slug, view_count')
      .in('slug', slugs)

    if (error) {
      console.error('Error fetching view counts:', error)
      return slugs.reduce((acc, slug) => ({ ...acc, [slug]: 0 }), {})
    }

    // Create a map of slug -> view_count, defaulting to 0 for missing slugs
    const viewCounts: Record<string, number> = {}
    slugs.forEach((slug) => {
      viewCounts[slug] = 0
    })

    if (data) {
      data.forEach((row: { slug: string; view_count: number }) => {
        viewCounts[row.slug] = row.view_count
      })
    }

    return viewCounts
  } catch (error) {
    console.error('Failed to fetch view counts:', error)
    return slugs.reduce((acc, slug) => ({ ...acc, [slug]: 0 }), {})
  }
}

/**
 * Fetches view count for a single blog post slug
 */
export async function getViewCount(slug: string): Promise<number> {
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

    return data?.view_count ?? 0
  } catch (error) {
    console.error('Failed to fetch view count:', error)
    return 0
  }
}
