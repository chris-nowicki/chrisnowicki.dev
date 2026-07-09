import type { speakingDataItem } from '@/data/speaking'
import { speakingData } from '@/data/speaking'

export const getSpeakingData = (limit?: number): speakingDataItem[] =>
  [...speakingData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
