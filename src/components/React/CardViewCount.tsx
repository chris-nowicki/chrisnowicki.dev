import { useEffect, useState } from 'react'
import { initConvexClient } from '@/lib/convex-client'
import { api } from '../../../convex/_generated/api'

interface Props {
  slug: string
}

export default function CardViewCount({ slug }: Props) {
  const [viewCount, setViewCount] = useState<number | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    let isMounted = true

    initConvexClient()
      .then((client) => {
        if (!isMounted || !client) return

        unsubscribe = client.onUpdate(
          api.blogViews.getViewCount,
          { slug },
          (result) => {
            if (isMounted && result) setViewCount(result.viewCount)
          }
        )
      })

    return () => {
      isMounted = false
      if (unsubscribe) unsubscribe()
    }
  }, [slug])

  if (!viewCount) return null

  return <span> · {viewCount.toLocaleString('en-US')} views</span>
}
