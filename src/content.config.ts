import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/blog' }),
  schema: z.object({
    date: z.date().transform((d) => new Date(d.setUTCHours(12, 0, 0, 0))),
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    draft: z.boolean(),
  }),
})

// Selected work — case studies (prose Problem → Approach → Outcome) and
// freelance projects. Entries with `link` point at a live/external project;
// entries without one get a `/work/[slug]` write-up page.
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/work' }),
  schema: z.object({
    date: z.date().transform((d) => new Date(d.setUTCHours(12, 0, 0, 0))),
    title: z.string(),
    description: z.string(),
    // Client or employer the work was for.
    company: z.string().optional(),
    // External URL for a live/freelance project (omit for a case study).
    link: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
})

// Site changelog — one entry per release, authored Keep-a-Changelog style.
// Frontmatter carries the version + date + summary; the markdown body holds
// the grouped changes (### Added / Changed / Fixed / Removed).
const changelog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/changelog' }),
  schema: z.object({
    version: z.string(),
    date: z.date().transform((d) => new Date(d.setUTCHours(12, 0, 0, 0))),
    // Optional release headline, e.g. "Editorial redesign".
    title: z.string().optional(),
    // One-line description shown under the version header.
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog, work, changelog }
