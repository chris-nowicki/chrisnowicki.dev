import type { APIRoute } from 'astro'

export const prerender = false

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json(body: { success: boolean; message: string }, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { email, _gotcha } = body as { email?: string; _gotcha?: string }

    // Honeypot — bots fill this hidden field; silently succeed without calling API
    if (_gotcha) {
      return json({ success: true, message: 'Thanks for subscribing!' })
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return json({ success: false, message: 'Please enter a valid email address.' }, 400)
    }

    const apiKey = import.meta.env.BEEHIIV_API_KEY
    const publicationId = import.meta.env.BEEHIIV_PUBLICATION_ID

    if (!apiKey || !publicationId) {
      console.error('Missing beehiiv environment variables')
      return json({ success: false, message: 'Newsletter service is not configured.' }, 500)
    }

    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          reactivate_existing: false,
          send_welcome_email: true,
        }),
      }
    )

    // 409 = already subscribed — treat as success
    if (res.ok || res.status === 409) {
      return json({ success: true, message: 'Thanks for subscribing!' })
    }

    const errorData = await res.json().catch(() => null)
    console.error('beehiiv API error:', res.status, errorData)

    return json({ success: false, message: 'Something went wrong. Please try again later.' }, 500)
  } catch {
    return json({ success: false, message: 'Invalid request.' }, 400)
  }
}
