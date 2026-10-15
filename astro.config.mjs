// @ts-check
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import { unified } from '@astrojs/markdown-remark'
import cloudflare from '@astrojs/cloudflare'
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

  integrations: [
    react(),
    emdash({
      database: d1({ binding: 'DB' }),
      storage: r2({ binding: 'MEDIA' }),
    }),
    sitemap(),
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
