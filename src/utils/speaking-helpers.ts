import type { speakingDataItem } from '@/data/speaking'

/**
 * Gets the latest speaking engagements from plain data file
 * Sorted by date (newest first) and limited to specified count
 *
 * @param limit Number of speaking engagements to retrieve
 * @returns Array of speakingDataItem
 */
export const getLatestSpeakingData = async (limit: number) => {
  try {
    const { speakingData } = await import('@/data/speaking')

    if (!speakingData || speakingData.length === 0) {
      console.warn('No speaking engagements found in data')
      return []
    }

    return speakingData
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  } catch (error) {
    console.error('Failed to load speaking data:', error)
    return []
  }
}

/**
 *
 * Groups speaking engagements by year
 * @param entries Array of speakingDataItem
 * @returns Record<string, speakingDataItem[]>
 */
export function groupSpeakingByYear(
  entries: speakingDataItem[]
): Record<string, speakingDataItem[]> {
  return entries.reduce(
    (acc, entry) => {
      const year = new Date(entry.date).getFullYear().toString()
      if (!acc[year]) {
        acc[year] = []
      }
      acc[year].push(entry)
      return acc
    },
    {} as Record<string, speakingDataItem[]>
  )
}

export function getSortedYears(entries: Record<string, any[]>): string[] {
  return Object.keys(entries).sort((a, b) => parseInt(b) - parseInt(a))
}
