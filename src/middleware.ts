import { defineMiddleware } from 'astro:middleware'

import {
  MEDIA_BROWSER_CACHE_CONTROL,
  MEDIA_EDGE_MAX_AGE,
  mediaCacheTag,
  mediaKeyFromPath,
} from '@/lib/media/cache'

import type { APIContext } from 'astro'

/** `PUT /_emdash/api/media/:id/replace` and `DELETE /_emdash/api/media/:id`. */
const MEDIA_REPLACE_RE = /^\/_emdash\/api\/media\/([^/]+)\/replace\/?$/
const MEDIA_ITEM_RE = /^\/_emdash\/api\/media\/([^/]+)\/?$/

/**
 * The storage key of the media item a replace/delete request targets, read
 * before the route runs (a delete removes the row).
 */
async function mutatedMediaKey(context: APIContext): Promise<string | null> {
  const { method } = context.request
  const { pathname } = context.url
  const id =
    method === 'PUT' ? MEDIA_REPLACE_RE.exec(pathname)?.[1]
    : method === 'DELETE' ? MEDIA_ITEM_RE.exec(pathname)?.[1]
    : undefined
  if (!id || !context.locals.emdash?.handleMediaGet) return null
  try {
    const result = await context.locals.emdash.handleMediaGet(id)
    return result.success ? result.data.item.storageKey : null
  } catch {
    return null
  }
}

/**
 * - Keep error responses out of the route cache. Route rules apply by path,
 *   so without this a 500 on a cached route (e.g. a failed D1 read) would be
 *   stored for the rule's `maxAge`. EmDash already opts out 404s, previews
 *   and editor-specific renders.
 * - Store EmDash media files in Workers Cache (`/_image` transforms do the
 *   same in src/lib/media/image-endpoint.ts), and purge a file and its
 *   transforms when EmDash replaces or deletes it. See src/lib/media/cache.ts.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const mutatedKey = await mutatedMediaKey(context)

  const response = await next()

  if (response.status >= 400 && context.cache?.enabled) {
    context.cache.set(false)
    return response
  }

  if (mutatedKey && response.ok && context.cache?.enabled) {
    try {
      await context.cache.invalidate({ tags: [mediaCacheTag(mutatedKey)] })
    } catch (error) {
      console.error('[middleware] media cache purge failed:', error)
    }
    return response
  }

  const mediaKey =
    context.request.method === 'GET' ?
      mediaKeyFromPath(context.url.pathname)
    : null
  if (
    mediaKey &&
    response.status === 200 &&
    // A cached partial response would be served for the whole file.
    !context.request.headers.has('Range') &&
    response.headers.get('Content-Type')?.startsWith('image/')
  ) {
    const cached = new Response(response.body, response)
    cached.headers.set('Cache-Control', MEDIA_BROWSER_CACHE_CONTROL)
    if (context.cache?.enabled) {
      context.cache.set({
        maxAge: MEDIA_EDGE_MAX_AGE,
        tags: [mediaCacheTag(mediaKey)],
      })
    }
    return cached
  }

  return response
})
