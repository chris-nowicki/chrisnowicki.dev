import type { CollectionEntry } from 'astro:content'

export type Site = {
  NAME: string
  EMAIL: string
}

export type Metadata = {
  TITLE: string
  DESCRIPTION: string
}

export type Blog = CollectionEntry<'blog'>
