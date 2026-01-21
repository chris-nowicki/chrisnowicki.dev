import type { APIRoute } from 'astro'
import { getViewCounts } from '@/lib/supabase'

// Cache headers for CDN caching (shared across all serverless instances)
const CACHE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
}

// No-cache headers for error responses
const NO_CACHE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}

export const GET: APIRoute = async ({ url }) => {
  const slugsParam = url.searchParams.get('slugs')

  if (!slugsParam) {
    return new Response(JSON.stringify({ error: 'slugs parameter is required' }), {
      status: 400,
      headers: NO_CACHE_HEADERS,
    })
  }

  try {
    const slugs = slugsParam.split(',').map((s) => s.trim()).filter(Boolean)

    if (slugs.length === 0) {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: CACHE_HEADERS,
      })
    }

    const viewCounts = await getViewCounts(slugs)

    return new Response(JSON.stringify(viewCounts), {
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
