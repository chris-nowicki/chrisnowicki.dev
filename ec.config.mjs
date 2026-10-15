// @ts-check
import { defineEcConfig } from 'astro-expressive-code'

export default defineEcConfig({
  themes: ['catppuccin-latte', 'catppuccin-mocha'],
  useDarkModeMediaQuery: false,
  // Workers disallow runtime WASM compilation (Oniguruma), so use Shiki's
  // JavaScript regex engine for on-demand highlighting.
  shiki: { engine: 'javascript' },
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
})
