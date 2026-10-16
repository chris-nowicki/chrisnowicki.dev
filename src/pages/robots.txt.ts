import type { APIRoute } from 'astro'

export const prerender = true

const getRobotsTxt = (sitemapURLs: URL[]) => `
User-agent: *
Allow: /

${sitemapURLs.map((sitemapURL) => `Sitemap: ${sitemapURL.href}`).join('\n')}
`

export const GET: APIRoute = ({ site }) => {
  // sitemap-index.xml (from @astrojs/sitemap) covers prerendered pages;
  // sitemap-blog.xml is rendered on demand from EmDash.
  const sitemapURLs = [
    new URL('sitemap-index.xml', site),
    new URL('sitemap-blog.xml', site),
  ]
  return new Response(getRobotsTxt(sitemapURLs))
}
