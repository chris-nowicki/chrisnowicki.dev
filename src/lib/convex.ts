import { ConvexClient } from 'convex/browser'
import { ConvexHttpClient } from 'convex/browser'

/**
 * Get Convex URL from runtime environment (Worker env) or fallback to build-time
 * For client-side: reads from window.__CONVEX_URL__ injected by Astro
 * For server-side: should be passed as parameter
 */
function getConvexUrl(): string | undefined {
  // Client-side: read from global variable injected at runtime
  if (typeof window !== 'undefined') {
    return (window as any).__CONVEX_URL__
  }
  
  // Fallback to build-time env (for local dev)
  return import.meta.env.PUBLIC_CONVEX_URL as string | undefined
}

/**
 * Browser client for real-time subscriptions (used in Svelte components)
 * Uses WebSocket connection for live updates
 * Created lazily to ensure window.__CONVEX_URL__ is available
 */
export function getConvexClient(): ConvexClient | null {
  const url = getConvexUrl()
  return url ? new ConvexClient(url) : null
}

/**
 * HTTP client for server-side queries (used in Astro pages)
 * For SSR, pass the URL from Astro.locals.runtime.env
 */
export function getConvexHttpClient(convexUrl?: string): ConvexHttpClient | null {
  const url = convexUrl || getConvexUrl()
  return url ? new ConvexHttpClient(url) : null
}

// Legacy export for backward compatibility (uses runtime URL)
export const convexHttpClient = getConvexHttpClient()

/**
 * Check if Convex is configured
 */
export const isConvexConfigured = (): boolean => {
  return !!getConvexUrl()
}
