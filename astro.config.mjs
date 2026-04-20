// @ts-check
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'
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
  adapter: cloudflare({
    imageService: 'compile',
    prerenderEnvironment: 'node',
  }),
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
