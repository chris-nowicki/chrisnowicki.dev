<script lang="ts">
  import { onMount } from 'svelte'

  export let slug: string
  export let initialCount: number = 0
  export let trackingEnabled: boolean = false

  let viewCount = initialCount

  onMount(async () => {
    try {
      // Step 1: GET fresh count to fix stale static value
      const getResponse = await fetch(`/api/views/${slug}`)
      if (getResponse.ok) {
        const getData = await getResponse.json()
        viewCount = getData.view_count ?? 0
      }

      // Step 2: POST to increment (only if tracking enabled)
      if (trackingEnabled) {
        const postResponse = await fetch(`/api/views/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        if (postResponse.ok) {
          const postData = await postResponse.json()
          viewCount = postData.view_count ?? viewCount
        }
      }
    } catch (error) {
      // Silently fail - keep existing count if view tracking fails
    }
  })
</script>

<span class="inline-flex items-center">
  {viewCount.toLocaleString('en-US')}
</span>
