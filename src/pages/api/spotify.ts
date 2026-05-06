import type { APIRoute } from 'astro'
import { env } from 'cloudflare:workers'

export const prerender = false

const KV_TOKEN_KEY = 'spotify:access_token'
const TOKEN_TTL_SECONDS = 3300
const RESPONSE_TTL_SECONDS = 30
const NO_TRACK = { isPlaying: false, title: null }

type Track = {
  isPlaying: boolean
  title: string
  artist: string
  albumArt: string
  songUrl: string
}
type TrackPayload = Track | typeof NO_TRACK

async function refreshAccessToken(): Promise<string | null> {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) return null

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  })
  if (!res.ok) return null

  const { access_token } = (await res.json()) as { access_token: string }
  await env.SESSION.put(KV_TOKEN_KEY, access_token, {
    expirationTtl: TOKEN_TTL_SECONDS,
  })
  return access_token
}

async function getAccessToken(): Promise<string | null> {
  return (await env.SESSION.get(KV_TOKEN_KEY)) ?? refreshAccessToken()
}

async function fetchSpotifyTrack(
  token: string,
): Promise<{ status: number; payload: TrackPayload }> {
  const current = await fetch(
    'https://api.spotify.com/v1/me/player/currently-playing',
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (current.status === 401) return { status: 401, payload: NO_TRACK }
  if (current.status === 200) {
    const data = (await current.json()) as {
      is_playing: boolean
      item?: {
        name: string
        artists: { name: string }[]
        album: { images: { url: string }[] }
        external_urls: { spotify: string }
      }
    }
    if (data?.item) {
      return {
        status: 200,
        payload: {
          isPlaying: data.is_playing,
          title: data.item.name,
          artist: data.item.artists.map((a) => a.name).join(', '),
          albumArt:
            data.item.album.images[0]?.url ?? data.item.album.images[2]?.url,
          songUrl: data.item.external_urls.spotify,
        },
      }
    }
  }

  const recent = await fetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=1',
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (recent.status === 401) return { status: 401, payload: NO_TRACK }
  if (!recent.ok) return { status: recent.status, payload: NO_TRACK }

  const recentData = (await recent.json()) as {
    items?: {
      track: {
        name: string
        artists: { name: string }[]
        album: { images: { url: string }[] }
        external_urls: { spotify: string }
      }
    }[]
  }
  const track = recentData?.items?.[0]?.track
  if (!track) return { status: 200, payload: NO_TRACK }

  return {
    status: 200,
    payload: {
      isPlaying: false,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      albumArt: track.album.images[0]?.url ?? track.album.images[2]?.url,
      songUrl: track.external_urls.spotify,
    },
  }
}

export const GET: APIRoute = async ({ request, locals }) => {
  const cacheKey = new Request(
    new URL('/api/spotify', request.url).toString(),
    { method: 'GET' },
  )
  const cache = caches.default

  const hit = await cache.match(cacheKey)
  if (hit) return hit

  let token = await getAccessToken()
  if (!token) return Response.json(NO_TRACK)

  let result = await fetchSpotifyTrack(token)
  if (result.status === 401) {
    await env.SESSION.delete(KV_TOKEN_KEY)
    token = await refreshAccessToken()
    if (!token) return Response.json(NO_TRACK)
    result = await fetchSpotifyTrack(token)
  }

  const response = Response.json(result.payload, {
    headers: {
      'Cache-Control': `public, s-maxage=${RESPONSE_TTL_SECONDS}, max-age=10`,
    },
  })

  if (result.status === 200) {
    locals.cfContext.waitUntil(cache.put(cacheKey, response.clone()))
  }
  return response
}
