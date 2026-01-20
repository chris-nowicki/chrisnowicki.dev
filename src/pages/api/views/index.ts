import type { APIRoute } from 'astro'
import { getViewCounts } from '@/lib/supabase'

export const GET: APIRoute = async ({ url }) => {
  const slugsParam = url.searchParams.get('slugs')

  if (!slugsParam) {
    return new Response(JSON.stringify({ error: 'slugs parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const slugs = slugsParam.split(',').map((s) => s.trim()).filter(Boolean)

    if (slugs.length === 0) {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const viewCounts = await getViewCounts(slugs)

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
