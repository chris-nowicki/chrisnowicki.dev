import type { speakingDataItem } from '@/data/speaking'
import { speakingData } from '@/data/speaking'

export const getSpeakingData = (limit?: number): speakingDataItem[] =>
  [...speakingData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)

// Extract a YouTube video id from the common URL shapes we link to
// (youtu.be/ID, youtube.com/watch?v=ID, /live/ID, /embed/ID). Returns null
// for anything that isn't a recognizable YouTube video, so callers can fall
// back to a plain external link.
export const getYouTubeId = (url: string): string | null => {
  try {
    const { hostname, pathname, searchParams } = new URL(url)
    if (hostname === 'youtu.be') return pathname.slice(1) || null
    if (hostname.endsWith('youtube.com')) {
      if (pathname === '/watch') return searchParams.get('v')
      const match = pathname.match(/^\/(?:live|embed|shorts)\/([^/?]+)/)
      if (match) return match[1]
    }
    return null
  } catch {
    return null
  }
}
