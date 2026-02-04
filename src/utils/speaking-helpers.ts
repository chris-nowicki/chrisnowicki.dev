import type { speakingDataItem } from '@/data/speaking'

interface GetSpeakingDataOptions {
  category?: string | null
  limit?: number
}

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
