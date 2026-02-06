export const convexUrl = import.meta.env.PUBLIC_CONVEX_URL as string | undefined

// HTTP client for SSR contexts (Astro pages)
// Lazy initialization to avoid top-level import issues
let _convexHttpClient: any = null

export async function getConvexHttpClient() {
  if (_convexHttpClient) return _convexHttpClient
  if (!convexUrl) return null

  const { ConvexHttpClient } = await import('convex/browser')
  _convexHttpClient = new ConvexHttpClient(convexUrl)
  return _convexHttpClient
}

export const isConvexConfigured = (): boolean => {
  return !!convexUrl
}
