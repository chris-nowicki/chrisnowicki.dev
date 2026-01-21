import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  blogViews: defineTable({
    slug: v.string(),
    viewCount: v.number(),
    lastReadAt: v.number(), // Unix timestamp (ms) of last view
    updatedAt: v.number(), // Unix timestamp (ms) of last update
  }).index('by_slug', ['slug']),
})
