import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ locals }) => {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return Response.json({ isPlaying: false, title: null })
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
    return Response.json({ isPlaying: false, title: null })
  }

  const { access_token: accessToken } = await tokenRes.json()

  // Try currently playing first
  const currentRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (currentRes.status === 200) {
    const data = await currentRes.json()
    if (data?.item) {
      return Response.json({
        isPlaying: data.is_playing,
        title: data.item.name,
        artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
        albumArt: data.item.album.images[0]?.url ?? data.item.album.images[2]?.url,
        songUrl: data.item.external_urls.spotify,
      })
    }
  }

  // Fall back to recently played
  const recentRes = await fetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=1',
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  if (!recentRes.ok) {
    return Response.json({ isPlaying: false, title: null })
  }

  const recentData = await recentRes.json()
  const track = recentData?.items?.[0]?.track

  if (!track) {
    return Response.json({ isPlaying: false, title: null })
  }

  return Response.json({
    isPlaying: false,
    title: track.name,
    artist: track.artists.map((a: { name: string }) => a.name).join(', '),
    albumArt: track.album.images[0]?.url ?? track.album.images[2]?.url,
    songUrl: track.external_urls.spotify,
  })
}
