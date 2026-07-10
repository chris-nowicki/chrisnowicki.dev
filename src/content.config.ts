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

// Case studies — prose write-ups (Problem → Approach → Outcome) that
// changelog entries in `/work` can link to.
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/work' }),
  schema: z.object({
    date: z.date().transform((d) => new Date(d.setUTCHours(12, 0, 0, 0))),
    title: z.string(),
    description: z.string(),
    company: z.string().optional(),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog, work }
