/**
 * The site's `/_image` endpoint, swapped in for
 * `@emdash-cms/cloudflare/image-endpoint` by a `resolveId` plugin in
 * astro.config.mjs (so EmDash still treats it as its own endpoint and keeps
 * the storage-only fast path in its middleware).
 *
 * Like EmDash's endpoint it reads EmDash media straight from R2 (no HTTP
 * self-fetch) and transforms it with the `IMAGES` binding. On top of that it
 * - honours `fit` and `position` (crops, e.g. square polaroids, placed by
 *   the EmDash focal point), and
 * - stores successful transforms in Workers Cache (see ./cache.ts), so each
 *   variant is generated once rather than per request.
 *
 * Anything that isn't EmDash media is delegated to the Cloudflare adapter's
 * endpoint, which only serves bundled assets and `image.remotePatterns`
 * (EmDash registers just this site's /_emdash/api/media/file/**), so
 * `/_image` is not an open image proxy.
 */
import { GET as adapterGET } from '@astrojs/cloudflare/image-transform-endpoint'
import { env } from 'cloudflare:workers'
import {
  getTransformFingerprint,
  type ImageTransformFormat,
  isNotModified,
  matchInternalMediaKey,
  originalMediaHeaders,
  parseTransformParams,
  resolveTransformQuality,
  validatorHeaders,
} from 'emdash/media/image-endpoint'

import {
  MEDIA_BROWSER_CACHE_CONTROL,
  MEDIA_EDGE_MAX_AGE,
  mediaCacheTag,
} from './cache'

import type { APIContext, APIRoute } from 'astro'

export const prerender = false

const FORMAT_MIME: Record<ImageTransformFormat, ImageOutputOptions['format']> =
  {
    webp: 'image/webp',
    avif: 'image/avif',
    jpeg: 'image/jpeg',
    png: 'image/png',
  }

// The adapter adds the `IMAGES` binding to the generated Wrangler config, so
// it isn't in the generated `Env` type.
const images = () => (env as unknown as { IMAGES: ImagesBinding }).IMAGES

/**
 * Astro's `fit` values (sharp's vocabulary) mapped to the Images binding's.
 * EmDash's own endpoint drops `fit`, so a `w`+`h` request for a different
 * aspect ratio than the source was scaled down to fit inside the box
 * instead of being cropped to it.
 */
const FIT: Record<string, ImageTransform['fit']> = {
  cover: 'cover',
  contain: 'contain',
  fill: 'squeeze',
  inside: 'scale-down',
  'scale-down': 'scale-down',
}

const toFit = (value: string | null) => (value ? FIT[value] : undefined)

const SIDE_GRAVITY = new Set(['top', 'bottom', 'left', 'right'])
const PERCENT_PAIR = /^(\d{1,3}(?:\.\d+)?)% (\d{1,3}(?:\.\d+)?)%$/

/**
 * A CSS `object-position` (what Astro puts in `position`, and what EmDash's
 * focal point becomes) as Images `gravity`. Percentages use `remainder`
 * mode, which distributes the cropped-off area the same way CSS does.
 */
function toGravity(value: string | null): ImageTransform['gravity'] {
  const position = value?.trim().toLowerCase()
  if (!position || position === 'center') return undefined
  if (SIDE_GRAVITY.has(position)) {
    return position as 'top' | 'bottom' | 'left' | 'right'
  }
  const match = PERCENT_PAIR.exec(position)
  if (!match) return undefined
  const x = Number(match[1]) / 100
  const y = Number(match[2]) / 100
  if (x > 1 || y > 1) return undefined
  return { x, y, mode: 'remainder' }
}

const isNotFound = (error: unknown) =>
  error instanceof Error &&
  (error.message.includes('not found') || error.message.includes('NOT_FOUND'))

/** Store a 200 response for `key` in Workers Cache for a year. */
function cacheMediaResponse(ctx: APIContext, key: string, response: Response) {
  if (response.status !== 200) return response
  response.headers.set('Cache-Control', MEDIA_BROWSER_CACHE_CONTROL)
  if (ctx.cache?.enabled) {
    ctx.cache.set({ maxAge: MEDIA_EDGE_MAX_AGE, tags: [mediaCacheTag(key)] })
  }
  return response
}

export const GET: APIRoute = async (ctx) => {
  const url = new URL(ctx.request.url)
  const key = matchInternalMediaKey(url.searchParams.get('href'))
  const storage = ctx.locals.emdash?.storage
  if (!key || !storage) return adapterGET(ctx)

  try {
    const source = await storage.download(key)
    const parsed = parseTransformParams(url.searchParams)

    // Non-raster media or a malformed request: serve the original bytes,
    // with EmDash's stored-XSS protections, as EmDash's endpoint does.
    if (!source.contentType.startsWith('image/') || !parsed.ok) {
      if (isNotModified(ctx.request, source.size, source.lastModified)) {
        await source.body.cancel()
        return new Response(null, {
          status: 304,
          headers: validatorHeaders(source.size, source.lastModified),
        })
      }
      return new Response(source.body, {
        status: 200,
        headers: originalMediaHeaders(
          source.contentType,
          source.size,
          source.lastModified
        ),
      })
    }

    const fit = toFit(url.searchParams.get('fit'))
    const gravity = toGravity(url.searchParams.get('position'))
    // EmDash's fingerprint covers w/h/f/q/fit; the crop position changes the
    // bytes too.
    const fingerprint = [
      getTransformFingerprint(url.searchParams),
      gravity ? `position=${url.searchParams.get('position')}` : '',
    ]
      .filter(Boolean)
      .join('&')
    const validators = validatorHeaders(
      source.size,
      source.lastModified,
      fingerprint
    )
    if (
      isNotModified(ctx.request, source.size, source.lastModified, fingerprint)
    ) {
      await source.body.cancel()
      return new Response(null, { status: 304, headers: validators })
    }

    const { width, height, format, quality } = parsed.options
    const transform: ImageTransform = {}
    if (width) transform.width = width
    if (height) transform.height = height
    // Only crop when both dimensions are set; with one, `cover` is a resize.
    if (width && height && fit) {
      transform.fit = fit
      if (fit === 'cover' && gravity) transform.gravity = gravity
    }
    const output: ImageOutputOptions = { format: FORMAT_MIME[format] }
    const effectiveQuality = resolveTransformQuality(format, quality)
    if (effectiveQuality !== undefined) output.quality = effectiveQuality

    const result = await images()
      .input(source.body)
      .transform(transform)
      .output(output)
    const transformed = result.response()
    if (!transformed.body) return new Response(null, { status: 500 })

    return cacheMediaResponse(
      ctx,
      key,
      new Response(transformed.body, {
        status: 200,
        headers: {
          'Content-Type':
            transformed.headers.get('Content-Type') ?? FORMAT_MIME[format],
          'X-Content-Type-Options': 'nosniff',
          ...validators,
        },
      })
    )
  } catch (error) {
    if (isNotFound(error)) return new Response('Not Found', { status: 404 })
    console.error('[image-endpoint] transform failed:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
