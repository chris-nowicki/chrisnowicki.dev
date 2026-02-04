import { ConvexClient } from 'convex/browser'
import { ConvexHttpClient } from 'convex/browser'

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL as string | undefined

// Browser client with WebSocket for real-time subscriptions (React components)
export const convexClient = convexUrl ? new ConvexClient(convexUrl) : null

// HTTP client for SSR contexts (Astro pages)
export const convexHttpClient = convexUrl
  ? new ConvexHttpClient(convexUrl)
  : null

export const isConvexConfigured = (): boolean => {
  return !!convexUrl
}
