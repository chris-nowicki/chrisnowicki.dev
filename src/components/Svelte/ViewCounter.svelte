<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { getConvexClient } from '@/lib/convex'
  import { api } from '../../../convex/_generated/api'

  export let slug: string

  let viewCount: number | null = null
  let unsubscribe: (() => void) | null = null
  let hasIncremented = false
  let error: string | null = null

  onMount(async () => {
    console.log('ViewCounter mounted for slug:', slug)
    
    // Get client lazily to ensure window.__CONVEX_URL__ is available
    const client = getConvexClient()
    console.log('Convex client:', client)

    if (!client) {
      error = 'Convex client not configured'
      console.warn(error)
      return
    }

    try {
      // Subscribe to real-time view count updates
      unsubscribe = client.onUpdate(
        api.blogViews.getViewCount,
        { slug },
        (result) => {
          console.log('Received view count result:', result)
          viewCount = result.viewCount

          // Increment view count once after initial load
          if (!hasIncremented) {
            hasIncremented = true
            client.mutation(api.blogViews.incrementViewCount, { slug })
              .then(() => console.log('Incremented view count'))
              .catch((err) => console.error('Failed to increment:', err))
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
