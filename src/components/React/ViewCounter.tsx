import { useEffect, useRef, useState } from 'react'
import { actions } from 'astro:actions'
import { initConvexClient } from '@/lib/convex-client'
import { api } from '../../../convex/_generated/api'
import {
  wasPostViewedRecently,
  markPostAsViewed,
  cleanupOldViewedPosts,
} from '@/utils/utils'

interface Props {
  slug: string
  light?: boolean
  draft?: boolean
}

export default function ViewCounter({ slug, light = false, draft = false }: Props) {
  const [viewCount, setViewCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasIncrementedRef = useRef(false)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    let isMounted = true

    cleanupOldViewedPosts()

    initConvexClient()
      .then((client) => {
        if (!isMounted) return
        if (!client) {
          setError('Convex client not configured')
          return
        }

        try {
          unsubscribe = client.onUpdate(
            api.blogViews.getViewCount,
            { slug },
            (result) => {
              if (!isMounted) return
              setViewCount(result.viewCount)

              if (!hasIncrementedRef.current) {
                hasIncrementedRef.current = true

                if (wasPostViewedRecently(slug)) {
                  return
                }

                if (!draft) {
                  markPostAsViewed(slug)
                  actions.incrementViewCount({ slug }).catch((err) =>
                    console.error('Failed to increment:', err),
                  )
                }
              }
            }
          )
        } catch (err) {
          console.error('Error setting up subscription:', err)
          if (isMounted) setError(String(err))
        }
      })
      .catch((err) => {
        console.error('Error loading Convex client:', err)
        if (isMounted) setError(String(err))
      })

    return () => {
      isMounted = false
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
