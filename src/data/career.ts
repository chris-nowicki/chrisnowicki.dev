// Career changelog — reverse-chron, one line per meaningful event, in
// Keep-a-Changelog style. Feeds /work (and later /resume.md).
//
// TODO(chris): I couldn't read your LinkedIn (it blocks automated fetches),
// so the timeline structure is yours but the bracketed bits are guesses —
// fill in the real company/title/month for the 2024–2025 tech role, confirm
// when you joined Commerce, and use publicly-cleared numbers only.
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
    // TODO(chris): confirm the month you joined Commerce.
    date: '2025-01-01',
    title: 'Joined Commerce as a Developer Experience Engineer',
  },
  {
    // TODO(chris): real company + title for the 2024–2025 role.
    date: '2024-01-01',
    year: '2024–2025',
    title: 'Broke into tech — [title] at [company]',
  },
  {
    date: '2007-01-01',
    year: '2007–2024',
    title: 'Aerospace engineering — a different kind of shipping.',
  },
]
