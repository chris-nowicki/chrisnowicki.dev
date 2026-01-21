<script lang="ts">
  export let slug: string
  export let trackingEnabled: boolean = false

  async function fetchAndTrackViews() {
    // GET fresh count
    const getResponse = await fetch(`/api/views/${slug}`)
    let viewCount = 0
    if (getResponse.ok) {
      const getData = await getResponse.json()
      viewCount = getData.view_count ?? 0
    }

    // POST to increment if tracking enabled
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

    return viewCount
  }

  let viewsPromise = fetchAndTrackViews()
</script>

{#await viewsPromise}
  <!-- Show nothing while loading -->
{:then viewCount}
  {#if viewCount > 0}
    <span class="inline-flex items-center">
      | {viewCount.toLocaleString('en-US')} views
    </span>
  {/if}
{:catch}
  <!-- Show nothing on error -->
{/await}
