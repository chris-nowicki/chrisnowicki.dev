<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { convexClient } from '@/lib/convex'
  import { api } from '../../../convex/_generated/api'
  import {
    wasPostViewedRecently,
    markPostAsViewed,
    cleanupOldViewedPosts,
  } from '@/utils/utils'

  export let slug: string

  let viewCount: number | null = null
  let unsubscribe: (() => void) | null = null
  let hasIncremented = false
  let error: string | null = null

  onMount(async () => {
    console.log('ViewCounter mounted for slug:', slug)
    console.log('Convex client:', convexClient)

    if (!convexClient) {
      error = 'Convex client not configured'
      console.warn(error)
      return
    }

    // Clean up old viewed posts to keep local storage tidy
    cleanupOldViewedPosts()

    // Store client reference for use in callback
    const client = convexClient

    try {
      // Subscribe to real-time view count updates
      unsubscribe = client.onUpdate(
        api.blogViews.getViewCount,
        { slug },
        (result) => {
          console.log('Received view count result:', result)
          viewCount = result.viewCount

          // Increment view count once after initial load, but only if not viewed recently
          if (!hasIncremented) {
            hasIncremented = true

            // Check if this post was viewed recently (within cooldown period)
            // Protection can be disabled via PUBLIC_DISABLE_VIEW_COUNT_PROTECTION env var
            if (wasPostViewedRecently(slug)) {
              console.log(
                `Post "${slug}" was viewed recently, skipping view count increment`
              )
            } else {
              // Mark as viewed and increment count
              markPostAsViewed(slug)
              client.mutation(api.blogViews.incrementViewCount, { slug })
                .then(() => console.log('Incremented view count'))
                .catch((err) => console.error('Failed to increment:', err))
            }
          }
        }
      )
    } catch (err) {
      console.error('Error setting up subscription:', err)
      error = String(err)
    }
  })

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })
</script>

{#if error}
  <span class="text-red-500">Error: {error}</span>
{:else if viewCount !== null}
  <span class="inline-flex items-center">
    | {viewCount.toLocaleString('en-US')} views
  </span>
{:else}
  <span class="inline-flex items-center text-muted-foreground">
    | loading...
  </span>
{/if}
