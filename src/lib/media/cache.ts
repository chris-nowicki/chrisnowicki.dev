/**
 * Caching policy for EmDash media (`/_emdash/api/media/file/<key>`) and its
 * `/_image` transforms.
 *
 * Media storage keys are ULIDs minted per upload, so a key never points at a
 * different upload. EmDash's "Replace original" (PUT
 * /_emdash/api/media/:id/replace) is the exception: it overwrites the bytes
 * under the same key without changing the URL. So:
 *
 * - Workers Cache (shared, purgeable) keeps responses for a year, tagged with
 *   `mediaCacheTag(key)`. src/middleware.ts purges that tag after a
 *   successful replace or delete.
 * - Browsers (not purgeable) get a day, then revalidate in the background
 *   against the edge copy. After a replace a returning visitor sees the old
 *   image at most once more.
 */

/** Workers Cache lifetime for media and its transforms (1 year). */
export const MEDIA_EDGE_MAX_AGE = 31_536_000

/** Browser policy; see the module comment for why it isn't `immutable`. */
export const MEDIA_BROWSER_CACHE_CONTROL =
  'public, max-age=86400, stale-while-revalidate=604800'

export const MEDIA_FILE_PREFIX = '/_emdash/api/media/file/'

/** Storage keys EmDash mints: `{ulid}{ext}`, no slashes or traversal. */
const SAFE_STORAGE_KEY = /^[A-Za-z0-9._-]+$/

/** Cache tag shared by a media file and every transform of it. */
export const mediaCacheTag = (storageKey: string) => `media:${storageKey}`

/** The storage key in a `/_emdash/api/media/file/<key>` path, if safe. */
export function mediaKeyFromPath(pathname: string): string | null {
  if (!pathname.startsWith(MEDIA_FILE_PREFIX)) return null
  const key = pathname.slice(MEDIA_FILE_PREFIX.length)
  return SAFE_STORAGE_KEY.test(key) ? key : null
}
