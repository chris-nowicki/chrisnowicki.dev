// @ts-check
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import rehypeAutoLinkHeadings from 'rehype-autolink-headings'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.chrisnowicki.dev',

  vite: {
    // @ts-ignore - Tailwind Vite plugin type compatibility
    plugins: [tailwindcss()],
    ssr: {
      external: ['node:async_hooks', 'node:crypto'],
    },
  },

  integrations: [sitemap(), react(), mdx()],

  markdown: {
    shikiConfig: {
      theme: 'catppuccin-mocha',
      wrap: true,
    },
    rehypePlugins: [
      rehypeHeadingIds,
      [
        rehypeAutoLinkHeadings,
        {
          behavior: 'wrap',
          properties: {
            class: ['subheading-anchor'],
            ariaLabel: 'Link to section',
          },
        },
      ],
    ],
  },
  adapter: cloudflare(),
  output: 'server',
  prefetch: true,
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
})
