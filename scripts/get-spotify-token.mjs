/**
 * One-time script to get a Spotify refresh token.
 * Usage: node scripts/get-spotify-token.mjs
 *
 * Steps:
 * 1. Set CLIENT_ID and CLIENT_SECRET below (or via env vars)
 * 2. Run the script — it will print an auth URL
 * 3. Open the URL in your browser and authorize
 * 4. Paste the redirect URL (or just the `code` param) when prompted
 * 5. The refresh token will be printed — save it as SPOTIFY_REFRESH_TOKEN
 */

import http from 'http'
import { exec } from 'child_process'
import readline from 'readline'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ''
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''
const REDIRECT_URI = 'http://127.0.0.1:4321/callback'
const SCOPES = 'user-read-currently-playing user-read-recently-played'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    'Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set as environment variables.',
  )
  console.error(
    'Example: SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/get-spotify-token.mjs',
  )
  process.exit(1)
}

const authUrl =
  `https://accounts.spotify.com/authorize?` +
  new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
  }).toString()

console.log('\nOpen this URL in your browser to authorize:\n')
console.log(authUrl)
console.log()

// Try to open the browser automatically
const platform = process.platform
const openCmd =
  platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open'
exec(`${openCmd} "${authUrl}"`)

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

rl.question(
  'After authorizing, paste the full redirect URL (or just the "code" param): ',
  async (input) => {
    rl.close()

    let code = input.trim()

    // Extract code if full URL was pasted
    try {
      const url = new URL(code)
      code = url.searchParams.get('code') || code
    } catch {
      // Already just the code
    }

    if (!code) {
      console.error('No code found.')
      process.exit(1)
    }

    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }).toString(),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Error exchanging code:', data)
      process.exit(1)
    }

    console.log('\n✅ Success! Add these to your .env and Cloudflare Worker vars:\n')
    console.log(`SPOTIFY_CLIENT_ID=${CLIENT_ID}`)
    console.log(`SPOTIFY_CLIENT_SECRET=${CLIENT_SECRET}`)
    console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`)
    console.log()
  },
)
