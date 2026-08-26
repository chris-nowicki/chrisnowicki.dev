import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'

export type SpeakingTalk = CollectionEntry<'speaking'>['data'] & {
  slug: string
  hasDetail: boolean
}

export const getSpeakingTalks = async (
  limit?: number
): Promise<SpeakingTalk[]> => {
  const talks = await getCollection(
    'speaking',
    ({ data }) => !import.meta.env.PROD || !data.draft
  )

  const sortedTalks = [...talks].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  )

  const mappedTalks = sortedTalks.map((entry) => ({
    slug: entry.id,
    ...entry.data,
    hasDetail:
      Boolean(entry.data.slidesSlug) ||
      (entry.body?.trim().length ?? 0) > 0,
  }))

  return limit ? mappedTalks.slice(0, limit) : mappedTalks
}

// Backwards-compatible alias for existing consumers.
export const getSpeakingData = getSpeakingTalks
