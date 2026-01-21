/**
 * Migration script to seed existing view counts from Supabase into Convex
 *
 * Run this after setting up Convex:
 * 1. Run `npx convex dev` to deploy your functions
 * 2. Run `npx tsx scripts/migrate-views-to-convex.ts`
 *
 * This script uses the Convex Node.js client to seed data directly.
 */

import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api'

// Your existing view counts from Supabase (exported on 2026-01-21)
const existingViewCounts = [
  {
    slug: 'breaking-into-tech-and-burnout',
    viewCount: 115,
    lastReadAt: new Date('2026-01-21T17:31:18.160Z').getTime(),
  },
  {
    slug: 'how-to-create-a-vercel-cron-job',
    viewCount: 6671,
    lastReadAt: new Date('2026-01-21T17:11:05.500Z').getTime(),
  },
  {
    slug: 'how-to-secure-a-vercel-cron-job',
    viewCount: 1225,
    lastReadAt: new Date('2026-01-21T15:38:01.462Z').getTime(),
  },
  {
    slug: 'how-to-setup-vercel-postgres',
    viewCount: 2040,
    lastReadAt: new Date('2026-01-21T15:25:21.147Z').getTime(),
  },
]

async function migrateViewCounts() {
  const convexUrl = process.env.PUBLIC_CONVEX_URL

  if (!convexUrl) {
    console.error('Error: PUBLIC_CONVEX_URL environment variable is not set')
    console.log('Please set it in your .env file or pass it as an environment variable:')
    console.log('PUBLIC_CONVEX_URL=https://your-project.convex.cloud npx tsx scripts/migrate-views-to-convex.ts')
    process.exit(1)
  }

  const client = new ConvexHttpClient(convexUrl)

  console.log('Starting migration of view counts to Convex...\n')

  for (const data of existingViewCounts) {
    try {
      await client.mutation(api.blogViews.seedViewCount, {
        slug: data.slug,
        viewCount: data.viewCount,
        lastReadAt: data.lastReadAt,
      })
      console.log(`✓ Migrated: ${data.slug} (${data.viewCount} views)`)
    } catch (error) {
      console.error(`✗ Failed to migrate ${data.slug}:`, error)
    }
  }

  console.log('\nMigration complete!')
}

migrateViewCounts()
