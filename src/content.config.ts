import { defineCollection, z } from 'astro:content'
import { file, glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/blog' }),
  schema: z.object({
    date: z.date().transform((d) => new Date(d.setUTCHours(12, 0, 0, 0))),
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    category: z.string(),
    draft: z.boolean(),
  }),
})

const speaking = defineCollection({
  loader: file('src/content/speaking.json'),
  schema: z.object({
    id: z.number(),
    date: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.array(z.string()),
    videoUrl: z.string(),
  }),
})

export const collections = { blog, speaking }
