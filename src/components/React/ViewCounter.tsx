import { useEffect, useRef, useState } from 'react'
import { convexClient } from '@/lib/convex'
import { api } from '../../../convex/_generated/api'
import {
  wasPostViewedRecently,
  markPostAsViewed,
  cleanupOldViewedPosts,
} from '@/utils/utils'

interface Props {
  slug: string
  light?: boolean
}

export default function ViewCounter({ slug, light = false }: Props) {
  const [viewCount, setViewCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasIncrementedRef = useRef(false)

  useEffect(() => {
    console.log('ViewCounter mounted for slug:', slug)
    console.log('Convex client:', convexClient)

    if (!convexClient) {
      setError('Convex client not configured')
      console.warn('Convex client not configured')
      return
    }

    // Clean up old viewed posts to keep local storage tidy
    cleanupOldViewedPosts()

    // Store client reference for use in callback
    const client = convexClient

    let unsubscribe: (() => void) | null = null

    try {
      // Subscribe to real-time view count updates
      unsubscribe = client.onUpdate(
        api.blogViews.getViewCount,
        { slug },
        (result) => {
          console.log('Received view count result:', result)
          setViewCount(result.viewCount)

          // Increment view count once after initial load, but only if not viewed recently
          if (!hasIncrementedRef.current) {
            hasIncrementedRef.current = true

            // Check if this post was viewed recently (within cooldown period)
            // Protection can be disabled via PUBLIC_DISABLE_VIEW_COUNT_PROTECTION env var
            if (wasPostViewedRecently(slug)) {
              console.log(
                `Post "${slug}" was viewed recently, skipping view count increment`
              )
            } else {
              // Mark as viewed and increment count
              markPostAsViewed(slug)
              client
                .mutation(api.blogViews.incrementViewCount, { slug })
                .then(() => console.log('Incremented view count'))
                .catch((err) => console.error('Failed to increment:', err))
            }
          }
        }
      )
    } catch (err) {
      console.error('Error setting up subscription:', err)
      setError(String(err))
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [slug])

  if (error) {
    return <span className="text-red-500">Error: {error}</span>
  }

  if (viewCount !== null) {
    return (
      <span className={`inline-flex items-center ${light ? 'text-white/70' : ''}`}>
        {viewCount.toLocaleString('en-US')} views
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center ${light ? 'text-white/50' : 'text-muted-foreground'}`}
    >
      loading...
    </span>
  )
}
