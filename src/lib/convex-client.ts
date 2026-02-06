import type { ConvexClient } from 'convex/browser'

// Singleton browser client - only created once
let clientPromise: Promise<ConvexClient> | null = null
let clientInstance: ConvexClient | null = null

export const convexUrl = import.meta.env.PUBLIC_CONVEX_URL as string | undefined

export function getConvexClient(): ConvexClient | null {
  // Only run on client
  if (typeof window === 'undefined') return null
  if (!convexUrl) return null

  // Return existing instance if available
  if (clientInstance) return clientInstance

  return null
}

export async function initConvexClient(): Promise<ConvexClient | null> {
  // Only run on client
  if (typeof window === 'undefined') return null
  if (!convexUrl) return null

  // Return existing instance
  if (clientInstance) return clientInstance

  // Return existing promise
  if (clientPromise) return clientPromise

  // Create new client
  clientPromise = import('convex/browser').then(({ ConvexClient }) => {
    clientInstance = new ConvexClient(convexUrl)
    return clientInstance
  })

  return clientPromise
}
