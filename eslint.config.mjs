// @ts-check
import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tailwindcss from 'eslint-plugin-tailwindcss'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/', '.astro/', 'node_modules/', 'worker-configuration.d.ts'] },

  // Base JS + TypeScript
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // React hooks (eslint-plugin-react@7.x doesn't support ESLint 10 yet)
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Reading DOM state once on mount is valid — don't error on this pattern
      'react-hooks/set-state-in-effect': 'warn',
    },
  },

  // Node.js scripts
  {
    files: ['scripts/**/*.mjs', 'scripts/**/*.js'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly', Buffer: 'readonly', URL: 'readonly', URLSearchParams: 'readonly', fetch: 'readonly' } },
  },

  // Accessibility — scoped to .tsx only (.astro uses eslint-plugin-astro's a11y rules)
  {
    files: ['**/*.tsx'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: { ...jsxA11y.configs.recommended.rules },
  },

  // Import order (external → Astro → internal → types → assets)
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  // Tailwind class linting (built-in classes only — no custom @theme tokens)
  {
    ...tailwindcss.configs['flat/recommended'][0],
    settings: { tailwindcss: { config: './src/styles/global.css' } },
  },

  // Astro files
  ...astro.configs.recommended,
)
