// Career changelog — reverse-chron, one line per meaningful event, in
// Keep-a-Changelog style. Feeds /work (and later /resume.md).
//
// NOTE: seeded from the v2 PRD skeleton as placeholder content. Chris to
// edit with the real timeline and publicly-cleared numbers only.
export type CareerEntry = {
  // ISO date, used for sorting and to derive the year group.
  date: string
  // Optional display override for the year label (e.g. a range).
  year?: string
  // The changelog line.
  title: string
  // Optional link to a case study (internal) or external write-up.
  link?: string
  external?: boolean
}

export const careerData: CareerEntry[] = [
  {
    date: '2026-03-01',
    title:
      'Shipped the Fern docs migration — 991 pages, 147 PRs, 4,000+ redirects',
  },
  {
    date: '2026-01-14',
    title: 'Spoke at Commit Your Code ’26, Dallas',
  },
  {
    date: '2024-02-01',
    title: 'Joined Commerce as a Developer Experience Engineer',
  },
  {
    date: '2006-01-01',
    year: '2006–2024',
    title: 'Aerospace engineering, 18 years. A different kind of shipping.',
  },
]
