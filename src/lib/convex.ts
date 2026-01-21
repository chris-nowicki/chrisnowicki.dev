import { ConvexClient } from 'convex/browser'
import { ConvexHttpClient } from 'convex/browser'

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL as string | undefined

/**
 * Browser client for real-time subscriptions (used in Svelte components)
 * Uses WebSocket connection for live updates
 */
export const convexClient = convexUrl ? new ConvexClient(convexUrl) : null

/**
 * HTTP client for server-side queries (used in Astro pages)
 * Stateless client for SSR contexts
 */
export const convexHttpClient = convexUrl
  ? new ConvexHttpClient(convexUrl)
  : null

/**
 * Check if Convex is configured
 */
export const isConvexConfigured = (): boolean => {
  return !!convexUrl
}
