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

  // All three fonts come from the Google provider; Astro downloads and
  // self-hosts them at build time, so there are no font files in the repo.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Geist',
      cssVariable: '--font-geist',
      weights: ['100 900'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      display: 'optional',
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      weights: ['100 900'],
      subsets: ['latin'],
      display: 'optional',
      fallbacks: ['monospace'],
    },
    {
      provider: fontProviders.google(),
      name: 'Reenie Beanie',
      cssVariable: '--font-reenie',
      weights: [400],
      subsets: ['latin'],
      display: 'optional',
      fallbacks: ['cursive'],
    },
  ],
})
