import type { APIRoute } from 'astro'
import { supabaseServer } from '@/lib/supabase'

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
    const { data, error } = await supabaseServer
      .from('blog_views')
      .select('view_count')
      .eq('slug', slug)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected for new posts
      console.error('Error fetching view count:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch view count' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const viewCount = data?.view_count ?? 0

    return new Response(JSON.stringify({ slug, view_count: viewCount }), {
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

export const POST: APIRoute = async ({ params }) => {
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

    return new Response(
      JSON.stringify({
        slug,
        view_count: newViewCount,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
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
