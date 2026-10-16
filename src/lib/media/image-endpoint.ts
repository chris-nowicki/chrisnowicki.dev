/**
 * The site's `/_image` endpoint, swapped in for
 * `@emdash-cms/cloudflare/image-endpoint` via a Vite alias in
 * astro.config.mjs (so EmDash still treats it as its own endpoint and keeps
 * the storage-only fast path in its middleware).
 *
 * Like EmDash's endpoint it reads EmDash media straight from R2 (no HTTP
 * self-fetch) and transforms it with the `IMAGES` binding. On top of that it
 * stores successful transforms in Workers Cache (see ./cache.ts) so a
 * variant is only ever generated once per deploy-independent cache lifetime.
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

    const fingerprint = getTransformFingerprint(url.searchParams)
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
