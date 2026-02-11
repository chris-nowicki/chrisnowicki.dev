// @ts-check
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import rehypeAutoLinkHeadings from 'rehype-autolink-headings'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import expressiveCode from 'astro-expressive-code'

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

  integrations: [
    sitemap(),
    react(),
    expressiveCode({
      themes: ['catppuccin-latte', 'catppuccin-mocha'],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => {
        if (theme.name === 'catppuccin-mocha') return '.dark'
        return ''
      },
      styleOverrides: {
        codeFontFamily: "'Geist Mono', monospace",
        codeFontSize: '0.875rem',
        codeLineHeight: '1.5',
        borderRadius: '0.375rem',
        borderWidth: '0px',
        frames: {
          shadowColor: 'transparent',
        },
      },
      defaultProps: {
        wrap: true,
      },
    }),
    mdx(),
  ],

  markdown: {
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
