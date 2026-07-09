// @ts-check
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'

import { transformerCodeTitle } from './src/lib/shiki-transformers.ts'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.chrisnowicki.dev',

  vite: {
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

  integrations: [sitemap(), mdx()],

  // Sätteri (Astro's default Rust Markdown pipeline) handles rendering.
  // Syntax highlighting is Shiki with dual catppuccin themes; `defaultColor:
  // false` emits both palettes as CSS variables toggled by the `.dark` class.
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: {
        light: 'catppuccin-latte',
        dark: 'catppuccin-mocha',
      },
      defaultColor: false,
      wrap: true,
      transformers: [transformerCodeTitle()],
    },
  },
  output: 'static',
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
