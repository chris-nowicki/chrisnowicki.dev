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
  if (process.env.ENABLE_VIEW_TRACKING !== 'true') {
    return new Response(
      JSON.stringify({ slug, view_count: 0, tracking_disabled: true }),
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
    // Check if record exists
    const { data: existingData, error: selectError } = await supabaseServer
      .from('blog_views')
      .select('view_count')
      .eq('slug', slug)
      .single()

    let newViewCount: number

    if (selectError && selectError.code === 'PGRST116') {
      // Record doesn't exist, create it with count 1
      const { data: insertData, error: insertError } = await supabaseServer
        .from('blog_views')
        .insert({
          slug,
          view_count: 1,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating view count:', insertError)
        return new Response(
          JSON.stringify({
            error: 'Failed to create view count',
            details: insertError.message,
            code: insertError.code,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      newViewCount = insertData?.view_count ?? 1
    } else if (selectError) {
      // Unexpected error
      console.error('Error fetching view count:', selectError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch view count' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } else {
      // Record exists, increment it
      newViewCount = (existingData?.view_count ?? 0) + 1
      const { error: updateError } = await supabaseServer
        .from('blog_views')
        .update({
          view_count: newViewCount,
          updated_at: new Date().toISOString(),
        })
        .eq('slug', slug)

      if (updateError) {
        console.error('Error updating view count:', updateError)
        return new Response(
          JSON.stringify({
            error: 'Failed to update view count',
            details: updateError.message,
            code: updateError.code,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
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
