import { v } from 'convex/values'
import { query, mutation } from './_generated/server'

/**
 * Get view count for a single blog post
 */
export const getViewCount = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query('blogViews')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()

    return {
      viewCount: record?.viewCount ?? 0,
      lastReadAt: record?.lastReadAt ?? null,
    }
  },
})

/**
 * Get view counts for multiple blog posts
 */
export const getViewCounts = query({
  args: { slugs: v.array(v.string()) },
  handler: async (ctx, args) => {
    const results: Record<string, number> = {}

    // Initialize all slugs with 0
    for (const slug of args.slugs) {
      results[slug] = 0
    }

    // Fetch all records for the given slugs
    for (const slug of args.slugs) {
      const record = await ctx.db
        .query('blogViews')
        .withIndex('by_slug', (q) => q.eq('slug', slug))
        .unique()

      if (record) {
        results[slug] = record.viewCount
      }
    }

    return results
  },
})

/**
 * Increment view count for a blog post (upsert)
 * Also updates lastReadAt timestamp
 */
export const incrementViewCount = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now()

    const existing = await ctx.db
      .query('blogViews')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        viewCount: existing.viewCount + 1,
        lastReadAt: now,
        updatedAt: now,
      })
      return { viewCount: existing.viewCount + 1 }
    } else {
      // Create new record
      await ctx.db.insert('blogViews', {
        slug: args.slug,
        viewCount: 1,
        lastReadAt: now,
        updatedAt: now,
      })
      return { viewCount: 1 }
    }
  },
})

/**
 * Seed view count data (for migration from Supabase)
 */
export const seedViewCount = mutation({
  args: {
    slug: v.string(),
    viewCount: v.number(),
    lastReadAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const existing = await ctx.db
      .query('blogViews')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        viewCount: args.viewCount,
        lastReadAt: args.lastReadAt ?? now,
        updatedAt: now,
      })
    } else {
      // Create new record
      await ctx.db.insert('blogViews', {
        slug: args.slug,
        viewCount: args.viewCount,
        lastReadAt: args.lastReadAt ?? now,
        updatedAt: now,
      })
    }

    return { success: true }
  },
})
