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
    if (!convexClient) {
      setError('Convex client not configured')
      return
    }

    cleanupOldViewedPosts()

    const client = convexClient
    let unsubscribe: (() => void) | null = null

    try {
      unsubscribe = client.onUpdate(
        api.blogViews.getViewCount,
        { slug },
        (result) => {
          setViewCount(result.viewCount)

          if (!hasIncrementedRef.current) {
            hasIncrementedRef.current = true

            if (wasPostViewedRecently(slug)) {
              return
            }

            markPostAsViewed(slug)
            client
              .mutation(api.blogViews.incrementViewCount, { slug })
              .catch((err) => console.error('Failed to increment:', err))
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
