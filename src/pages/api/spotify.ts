import type { APIRoute } from 'astro'

export const prerender = false

// In-memory cache shared across requests within the same isolate.
// Cloudflare Pages Functions don't CDN-cache dynamic responses via
// Cache-Control headers alone, so we cache here to avoid hitting
// Spotify's rate limits when multiple visitors poll concurrently.
const CACHE_TTL = 60_000 // 60 seconds
const ERROR_CACHE_TTL = 10_000 // 10 seconds for error/empty responses
let cached: { data: Record<string, unknown>; expiresAt: number } | null = null

async function fetchSpotifyData(): Promise<Record<string, unknown>> {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return { isPlaying: false, title: null }
  }

  // Exchange refresh token for access token
  const basicAuth = btoa(`${clientId}:${clientSecret}`)
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  })

  if (!tokenRes.ok) {
    return { isPlaying: false, title: null }
  }

  const { access_token: accessToken } = await tokenRes.json()

  // Try currently playing first
  const currentRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (currentRes.status === 200) {
    const data = await currentRes.json()
    if (data?.item) {
      return {
        isPlaying: data.is_playing,
        title: data.item.name,
        artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
        albumArt: data.item.album.images[0]?.url ?? data.item.album.images[2]?.url,
        songUrl: data.item.external_urls.spotify,
      }
    }
  }

  // Fall back to recently played
  const recentRes = await fetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=1',
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  if (!recentRes.ok) {
    return { isPlaying: false, title: null }
  }

  const recentData = await recentRes.json()
  const track = recentData?.items?.[0]?.track

  if (!track) {
    return { isPlaying: false, title: null }
  }

  return {
    isPlaying: false,
    title: track.name,
    artist: track.artists.map((a: { name: string }) => a.name).join(', '),
    albumArt: track.album.images[0]?.url ?? track.album.images[2]?.url,
    songUrl: track.external_urls.spotify,
  }
}

export const GET: APIRoute = async () => {
  const now = Date.now()

  if (cached && now < cached.expiresAt) {
    return Response.json(cached.data)
  }

  const data = await fetchSpotifyData()
  const ttl = data.title ? CACHE_TTL : ERROR_CACHE_TTL

  cached = { data, expiresAt: now + ttl }

  return Response.json(data)
}
