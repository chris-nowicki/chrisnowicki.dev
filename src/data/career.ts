// Career changelog — reverse-chron, one line per meaningful event, in
// Keep-a-Changelog style. Feeds /work (and later /resume.md).
//
// Timeline is from Chris's LinkedIn. NOTE(chris): the 2026 accomplishment
// numbers (Fern migration) are from the PRD — confirm they're publicly
// shareable, and adjust any wording/dates as needed.
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
    link: '/work/fern-docs-migration',
  },
  {
    date: '2026-01-14',
    title: 'Spoke at Commit Your Code ’26, Dallas',
  },
  {
    date: '2025-07-01',
    title: 'Joined Commerce as a Developer Experience Engineer',
  },
  {
    date: '2024-11-01',
    title: 'Software Engineering Lead at This Dot',
  },
  {
    date: '2024-02-01',
    title: 'Full-stack engineer at Gridiron Survivor (freelance) — my break into tech',
  },
  {
    date: '2007-02-01',
    year: '2007–2024',
    title:
      'Raytheon — 18 years, from technical support to Sr. Manager of the interactive simulation (IMI) product line',
  },
]
