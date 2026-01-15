import type { speakingDataItem } from '@/data/speaking'

interface GetSpeakingDataOptions {
  category?: string | null
  limit?: number
}

/**
 * Gets speaking engagements from plain data file
 * Can be filtered by category and limited to specified count
 * Sorted by date (newest first)
 *
 * @param options Optional object with category and/or limit
 * @returns Array of speakingDataItem
 */
export const getSpeakingData = async (
  options?: GetSpeakingDataOptions
): Promise<speakingDataItem[]> => {
  try {
    const { speakingData } = await import('@/data/speaking')

    if (!speakingData || speakingData.length === 0) {
      console.warn('No speaking engagements found in data')
      return []
    }

    const { category, limit } = options ?? {}

    let filteredData = speakingData

    if (category) {
      filteredData = speakingData.filter((speakingDataItem) =>
        speakingDataItem.category.includes(category)
      )
    }

    return filteredData
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  } catch (error) {
    console.error('Failed to load speaking data:', error)
    return []
  }
}

/**
 * Gets all unique categories from speaking data
 * Returns empty array if no categories found
 */
export const getAllSpeakingCategories = async (): Promise<string[]> => {
  try {
    const { speakingData } = await import('@/data/speaking')

    const categories = speakingData
      .map((speakingDataItem) => speakingDataItem.category)
      .flat()
    return [...new Set(categories)]
  } catch (error) {
    console.error('Failed to load speaking categories:', error)
    return []
  }
}
