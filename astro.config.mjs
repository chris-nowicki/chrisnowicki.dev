// @ts-check
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import { unified } from '@astrojs/markdown-remark'
import cloudflare from '@astrojs/cloudflare'
import { cacheCloudflare } from '@astrojs/cloudflare/cache'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { d1, r2 } from '@emdash-cms/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'
import expressiveCode from 'astro-expressive-code'
import emdash from 'emdash/astro'
import rehypeAutoLinkHeadings from 'rehype-autolink-headings'

/** @type {import('@astrojs/markdown-remark').RehypePlugin} */
const rehypeLazyImages = () => {
  /**
   * @param {import('hast').Root | import('hast').RootContent} node
   */
  const addImageProperties = (node) => {
    if (node.type === 'element' && node.tagName === 'img') {
      if (!('loading' in node.properties)) {
        node.properties.loading = 'lazy'
      }
      if (!('decoding' in node.properties)) {
        node.properties.decoding = 'async'
      }
    }

    if (node.type === 'root' || node.type === 'element') {
      node.children.forEach(addImageProperties)
    }
  }

  return addImageProperties
}

// Route caching for the on-demand (EmDash) blog routes. Entries are
// invalidated by tag when content is published in EmDash, so `maxAge` only
// bounds staleness if a purge fails (Workers Cache purges are rate limited
// to 5/min). `posts` is the EmDash collection tag EmDash purges on write;
// `all` is never purged automatically and works as a manual kill switch.
const BLOG_CACHE_RULE = { maxAge: 3_600, swr: 86_400, tags: ['posts', 'all'] }

// https://astro.build/config
export default defineConfig({
  site: 'https://www.chrisnowicki.dev',

  vite: {
    // The workerd dev runner can't evaluate the CJS deps (postcss etc.) pulled
    // in by expressive-code's runtime <Code> component unless pre-bundled.
    ssr: {
      optimizeDeps: {
        include: [
          'astro-expressive-code',
          'astro-expressive-code > rehype-expressive-code',
          'astro-expressive-code > rehype-expressive-code/hast',
        ],
      },
    },
    plugins: [
      tailwindcss(),
      {
        name: 'increase-fs-watcher-limit',
        configureServer(server) {
          server.watcher.setMaxListeners(20)
        },
      },
    ],
  },

  adapter: cloudflare(),

  // Stores responses in the Workers Cache (a hit never runs the Worker). The
  // adapter enables `cache.enabled` in the generated Wrangler config.
  cache: {
    provider: cacheCloudflare(),
  },
  // Rules match request paths; anything without a rule (admin, API) is
  // marked no-store. EmDash opts preview, editor and 404 responses out.
  routeRules: {
    '/blog': BLOG_CACHE_RULE,
    '/blog/[slug]': BLOG_CACHE_RULE,
    '/sitemap-blog.xml': BLOG_CACHE_RULE,
    // The LatestPosts server island on the (prerendered) homepage.
    '/_server-islands/[name]': BLOG_CACHE_RULE,
  },

  integrations: [
    react(),
    emdash({
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA' }),
      // Cached pages are shared by every visitor, so render the editor
      // toolbar client-side instead of into the HTML.
      toolbar: 'client',
    }),
    sitemap({
      // The blog is on-demand (EmDash) and listed by src/pages/sitemap-blog.xml.ts.
      filter: (page) => !new URL(page).pathname.startsWith('/blog'),
    }),
    // Options live in ec.config.mjs: the runtime <Code> component (used for
    // CMS code blocks) can't receive non-serializable inline options.
    expressiveCode(),
    mdx(),
  ],

  markdown: {
    processor: unified({
      rehypePlugins: [
        rehypeHeadingIds,
        rehypeLazyImages,
        [
          /** @type {import('@astrojs/markdown-remark').RehypePlugin} */ (
            rehypeAutoLinkHeadings
          ),
          {
            behavior: 'wrap',
            properties: {
              class: ['subheading-anchor'],
              ariaLabel: 'Link to section',
            },
          },
        ],
      ],
    }),
  },
  output: 'server',
  prefetch: true,

  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Geist',
      cssVariable: '--font-geist',
      display: 'optional',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            weight: '100 900',
            style: 'normal',
            src: ['./src/assets/fonts/Geist[wght].woff2'],
          },
          {
            weight: '100 900',
            style: 'italic',
            src: ['./src/assets/fonts/Geist-Italic[wght].woff2'],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      display: 'optional',
      fallbacks: ['monospace'],
      options: {
        variants: [
          {
            weight: '100 900',
            style: 'normal',
            src: ['./src/assets/fonts/GeistMono[wght].woff2'],
          },
        ],
      },
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Reenie Beanie',
      cssVariable: '--font-reenie',
      display: 'optional',
      weights: [400],
      subsets: ['latin'],
      fallbacks: ['cursive'],
    },
  ],
})
