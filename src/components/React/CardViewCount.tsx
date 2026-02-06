import { useEffect, useState } from 'react'
import { convexClient } from '@/lib/convex'
import { api } from '../../../convex/_generated/api'

interface Props {
  slug: string
}

export default function CardViewCount({ slug }: Props) {
  const [viewCount, setViewCount] = useState<number | null>(null)

  useEffect(() => {
    if (!convexClient) return

    const unsubscribe = convexClient.onUpdate(
      api.blogViews.getViewCount,
      { slug },
      (result) => {
        if (result) setViewCount(result.viewCount)
      }
    )

    return () => unsubscribe()
  }, [slug])

  if (!viewCount) return null

  return <span> · {viewCount.toLocaleString('en-US')} views</span>
}
