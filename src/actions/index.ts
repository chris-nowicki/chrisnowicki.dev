import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { getConvexHttpClient } from '@/lib/convex'
import { api } from '../../convex/_generated/api'

const COOLDOWN_MS = 30 * 60 * 1000

export const server = {
  incrementViewCount: defineAction({
    input: z.object({ slug: z.string() }),
    handler: async ({ slug }) => {
      if (import.meta.env.DEV && import.meta.env.ENABLE_VIEW_TRACKING !== 'true') {
        return { viewCount: null, skipped: true }
      }

      const client = await getConvexHttpClient()
      if (!client) return { viewCount: null, skipped: true }

      const protectionDisabled = import.meta.env.DEV

      // Server-side cooldown using existing lastReadAt field in Convex schema
      const existing = await client.query(api.blogViews.getViewCount, { slug })
      const now = Date.now()
      if (
        !protectionDisabled &&
        existing.lastReadAt !== null &&
        now - existing.lastReadAt < COOLDOWN_MS
      ) {
        return { viewCount: existing.viewCount, skipped: true }
      }

      const result = await client.mutation(api.blogViews.incrementViewCount, { slug })
      return { viewCount: result.viewCount, skipped: false }
    },
  }),
}
