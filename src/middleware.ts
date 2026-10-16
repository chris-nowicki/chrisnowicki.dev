import { defineMiddleware } from 'astro:middleware'

/**
 * Keep error responses out of the route cache. Route rules apply by path, so
 * without this a 500 on a cached route (e.g. a failed D1 read) would be stored
 * for the rule's `maxAge`. EmDash already opts out 404s, previews and
 * editor-specific renders.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()
  if (response.status >= 400 && context.cache?.enabled) {
    context.cache.set(false)
  }
  return response
})
