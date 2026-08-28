import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

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

const speaking = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/speaking' }),
  schema: z.object({
    title: z.string(),
    date: z.date().transform((d) => new Date(d.setUTCHours(12, 0, 0, 0))),
    event: z.string().optional(),
    description: z.string(),
    category: z.array(z.string()).default([]),
    link: z.string().url().optional(),
    youtube: z.string().optional(),
    slidesSlug: z.string().optional(),
    slidesPdf: z.boolean().default(true),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog, speaking }
