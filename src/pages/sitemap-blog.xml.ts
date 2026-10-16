import { applyCacheHint, getBlogPosts } from '@/utils/blog-helpers'

import type { APIRoute } from 'astro'

// The blog is served on demand from EmDash, so @astrojs/sitemap (which only
// sees prerendered pages) can't list it. This sitemap covers /blog and every
// published post; robots.txt references it next to sitemap-index.xml.
// URLs keep the trailing slash used by sitemap-index.xml and canonicals.

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const toW3CDate = (date: Date) => date.toISOString().slice(0, 10)

const urlEntry = (loc: URL, lastmod?: Date) =>
  [
    '  <url>',
    `    <loc>${escapeXml(loc.href)}</loc>`,
    lastmod ? `    <lastmod>${toW3CDate(lastmod)}</lastmod>` : '',
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')

export const GET: APIRoute = async ({ site, url, cache }) => {
  const origin = site ?? url
  const { posts, cacheHint } = await getBlogPosts()
  applyCacheHint(cache, cacheHint)

  // lastmod is the post's own `date` field: the D1 timestamps reflect when
  // the post was imported or touched in the admin, not when it was written.
  const newest = posts[0]?.data.date
  const urls = [
    urlEntry(new URL('/blog/', origin), newest),
    ...posts.map((post) =>
      urlEntry(new URL(`/blog/${post.id}/`, origin), post.data.date)
    ),
  ]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
