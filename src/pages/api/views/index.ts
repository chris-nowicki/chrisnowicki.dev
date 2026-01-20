import type { APIRoute } from 'astro'
import { supabaseServer } from '@/lib/supabase'

export const GET: APIRoute = async ({ url }) => {
  const slugsParam = url.searchParams.get('slugs')

  if (!slugsParam) {
    return new Response(JSON.stringify({ error: 'slugs parameter is required' }), {
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
    const slugs = slugsParam.split(',').map((s) => s.trim()).filter(Boolean)

    if (slugs.length === 0) {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data, error } = await supabaseServer
      .from('blog_views')
      .select('slug, view_count')
      .in('slug', slugs)

    if (error) {
      console.error('Error fetching view counts:', error)
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch view counts',
          details: error.message,
          code: error.code,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Create a map of slug -> view_count, defaulting to 0 for missing slugs
    const viewCounts: Record<string, number> = {}
    slugs.forEach((slug) => {
      viewCounts[slug] = 0
    })

    if (data) {
      data.forEach((row) => {
        viewCounts[row.slug] = row.view_count
      })
    }

    return new Response(JSON.stringify(viewCounts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
