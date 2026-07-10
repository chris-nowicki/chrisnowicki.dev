import type { CareerEntry } from '@/data/career'
import { careerData } from '@/data/career'

// Group career entries by year label (reverse-chron), preserving that order.
export const getCareerByYear = (): [string, CareerEntry[]][] => {
  const sorted = [...careerData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const groups = new Map<string, CareerEntry[]>()
  for (const entry of sorted) {
    const label = entry.year ?? String(new Date(entry.date).getUTCFullYear())
    const bucket = groups.get(label)
    if (bucket) {
      bucket.push(entry)
    } else {
      groups.set(label, [entry])
    }
  }

  return [...groups.entries()]
}
