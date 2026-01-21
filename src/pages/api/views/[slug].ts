import type { APIRoute } from 'astro'
import { supabaseServer, getViewCount, invalidateCache } from '@/lib/supabase'

// Cache headers for CDN caching (shared across all serverless instances)
const CACHE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
}

// No-cache headers for write operations
const NO_CACHE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!supabaseServer) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const viewCount = await getViewCount(slug)

    return new Response(JSON.stringify({ slug, view_count: viewCount }), {
      status: 200,
      headers: CACHE_HEADERS,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: NO_CACHE_HEADERS,
      }
    )
  }
}

export const POST: APIRoute = async ({ params }) => {
  const slug = params.slug

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Skip view tracking if not enabled (protects production data during dev/preview)
  // Use process.env for runtime environment variables in Vercel serverless functions
  const trackingEnabled = process.env.ENABLE_VIEW_TRACKING === 'true' ||
    import.meta.env.ENABLE_VIEW_TRACKING === 'true'

  if (!trackingEnabled) {
    // Return current count without incrementing (safe for dev/preview)
    const currentCount = await getViewCount(slug)
    return new Response(
      JSON.stringify({ slug, view_count: currentCount, tracking_disabled: true }),
      {
        status: 200,
        headers: NO_CACHE_HEADERS,
      }
    )
  }

  if (!supabaseServer) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Use RPC for atomic increment (single database operation)
    const { data, error } = await supabaseServer.rpc('increment_page_view', {
      page_slug: slug,
    })

    if (error) {
      console.error('Error incrementing view count:', error)
      return new Response(
        JSON.stringify({
          error: 'Failed to increment view count',
          details: error.message,
          code: error.code,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // RPC returns array with single row containing view_count
    // Handle both array format and direct value format
    let newViewCount: number
    if (Array.isArray(data) && data.length > 0) {
      newViewCount = data[0]?.view_count ?? 1
    } else if (typeof data === 'number') {
      newViewCount = data
    } else {
      newViewCount = await getViewCount(slug)
    }

    // Invalidate in-memory cache after successful update
    invalidateCache(slug)

    return new Response(
      JSON.stringify({
        slug,
        view_count: newViewCount,
      }),
      {
        status: 200,
        headers: NO_CACHE_HEADERS,
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: NO_CACHE_HEADERS,
      }
    )
  }
}
